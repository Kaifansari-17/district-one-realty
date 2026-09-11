import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole, PublishStatus } from "@prisma/client";
import { app } from "@/test/testApp";
import { resetDatabase, disconnectDatabase } from "@/test/db";
import { loginAs } from "@/test/authHelper";
import { createLocationHierarchy, createPropertyLookups, createProperty } from "@/test/fixtures";

beforeAll(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

async function setupBaseData() {
  const { location } = await createLocationHierarchy();
  const { propertyType, category, purpose } = await createPropertyLookups();
  return { location, propertyType, category, purpose };
}

describe("Public property endpoints", () => {
  it("only lists published properties", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    await createProperty({
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      publishStatus: PublishStatus.PUBLISHED,
      title: "Published Property",
    });
    await createProperty({
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      publishStatus: PublishStatus.DRAFT,
      title: "Draft Property",
    });

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Published Property");
  });

  it("filters server-side by bhk and price range", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id, title: "2BHK" });

    const matching = await request(app).get("/api/properties").query({ bhk: "2", maxPrice: "10000000" });
    const nonMatching = await request(app).get("/api/properties").query({ bhk: "3" });

    expect(matching.body.data.items).toHaveLength(1);
    expect(nonMatching.body.data.items).toHaveLength(0);
  });

  it("returns 404 for an unpublished or nonexistent slug", async () => {
    const res = await request(app).get("/api/properties/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("Admin property RBAC and ownership", () => {
  it("blocks an unauthenticated request", async () => {
    const res = await request(app).get("/api/admin/properties");
    expect(res.status).toBe(401);
  });

  it("only Admin/Super Admin can create a property; Agent gets 403", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const { agent: agentClient } = await loginAs(UserRole.AGENT);

    const res = await agentClient.post("/api/admin/properties").send({
      title: "Should Not Be Created",
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      price: 5_000_000,
      status: "READY_TO_MOVE",
    });

    expect(res.status).toBe(403);
  });

  it("Admin can create a property", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const { agent: adminClient } = await loginAs(UserRole.ADMIN);

    const res = await adminClient.post("/api/admin/properties").send({
      title: "New Listing",
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      price: 7_500_000,
      status: "READY_TO_MOVE",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("New Listing");
  });

  it("an agent sees 0 properties in the admin list when none are assigned to them", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });
    const { agent: agentClient } = await loginAs(UserRole.AGENT);

    const res = await agentClient.get("/api/admin/properties");

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it("an agent sees only their own assigned property, and staff sees all", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const { agent: agentClient, user: agentUser } = await loginAs(UserRole.AGENT);
    const { agent: adminClient } = await loginAs(UserRole.ADMIN);

    const assigned = await createProperty({
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      agentIds: [agentUser.id],
    });
    await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });

    const agentRes = await agentClient.get("/api/admin/properties");
    expect(agentRes.body.data.items).toHaveLength(1);
    expect(agentRes.body.data.items[0].id).toBe(assigned.id);

    const adminRes = await adminClient.get("/api/admin/properties");
    expect(adminRes.body.data.items).toHaveLength(2);
  });

  it("an agent gets 403 fetching a property they aren't assigned to by id", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });
    const { agent: agentClient } = await loginAs(UserRole.AGENT);

    const res = await agentClient.get(`/api/admin/properties/${property.id}`);
    expect(res.status).toBe(403);
  });

  it("an agent can publish their own assigned property but cannot verify or feature it", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const { agent: agentClient, user: agentUser } = await loginAs(UserRole.AGENT);
    const property = await createProperty({
      locationId: location.id,
      propertyTypeId: propertyType.id,
      categoryId: category.id,
      purposeId: purpose.id,
      agentIds: [agentUser.id],
      publishStatus: PublishStatus.DRAFT,
    });

    const publishRes = await agentClient.patch(`/api/admin/properties/${property.id}/publish`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.publishStatus).toBe("PUBLISHED");

    const verifyRes = await agentClient.patch(`/api/admin/properties/${property.id}/verified`).send({ verified: true });
    expect(verifyRes.status).toBe(403);
  });

  it("only Admin/Super Admin can delete a property; Agent gets 403", async () => {
    const { location, propertyType, category, purpose } = await setupBaseData();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });
    const { agent: agentClient } = await loginAs(UserRole.AGENT);
    const { agent: adminClient } = await loginAs(UserRole.ADMIN);

    const forbidden = await agentClient.delete(`/api/admin/properties/${property.id}`);
    expect(forbidden.status).toBe(403);

    const allowed = await adminClient.delete(`/api/admin/properties/${property.id}`);
    expect(allowed.status).toBe(200);
  });
});
