import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { UserRole } from "@prisma/client";
import { resetDatabase, disconnectDatabase } from "@/test/db";
import { loginAs } from "@/test/authHelper";
import { createLocationHierarchy, createPropertyLookups, createProperty } from "@/test/fixtures";

// No Cloudinary credentials in the test env (see .env.test), so uploads exercise the local-disk
// storage fallback for real — actual files land under apps/api/uploads/. Clean those up too,
// since resetDatabase() only clears rows, not the filesystem.
const TEST_UPLOAD_DIRS = ["property_image", "property_floor_plan"];

async function cleanUploadDirs() {
  await Promise.all(
    TEST_UPLOAD_DIRS.map((dir) => fs.rm(path.join(process.cwd(), "uploads", dir), { recursive: true, force: true }))
  );
}

beforeAll(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
  await cleanUploadDirs();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("Media upload MIME type validation", () => {
  it("rejects a non-image file on the property image upload endpoint before it's ever written to storage", async () => {
    const { agent } = await loginAs(UserRole.ADMIN);
    const { location } = await createLocationHierarchy();
    const { propertyType, category, purpose } = await createPropertyLookups();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });

    const res = await agent
      .post(`/api/admin/properties/${property.id}/media`)
      .attach("file", Buffer.from("not an image"), { filename: "notes.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JPG|PNG|WEBP/i);
  });

  it("accepts and stores a PDF on the floor-plans endpoint via the local storage fallback", async () => {
    const { agent } = await loginAs(UserRole.ADMIN);
    const { location } = await createLocationHierarchy();
    const { propertyType, category, purpose } = await createPropertyLookups();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });

    const res = await agent
      .post(`/api/admin/properties/${property.id}/floor-plans`)
      .attach("file", Buffer.from("%PDF-1.4 fake"), { filename: "plan.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/\/uploads\/property_floor_plan\/.+\.pdf$/);

    // Confirm the file actually landed on disk, not just a plausible-looking URL in the response.
    const relativePath = res.body.data.publicId as string;
    const stat = await fs.stat(path.join(process.cwd(), "uploads", relativePath));
    expect(stat.isFile()).toBe(true);
  });

  it("deletes the file from disk when the media row is deleted", async () => {
    const { agent } = await loginAs(UserRole.ADMIN);
    const { location } = await createLocationHierarchy();
    const { propertyType, category, purpose } = await createPropertyLookups();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });

    const uploadRes = await agent
      .post(`/api/admin/properties/${property.id}/media`)
      .attach("file", Buffer.from("fake jpeg bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });
    expect(uploadRes.status).toBe(201);

    const filePath = path.join(process.cwd(), "uploads", uploadRes.body.data.publicId);
    await expect(fs.stat(filePath)).resolves.toBeDefined();

    const deleteRes = await agent.delete(`/api/admin/properties/${property.id}/media/${uploadRes.body.data.id}`);
    expect(deleteRes.status).toBe(200);

    await expect(fs.stat(filePath)).rejects.toThrow();
  });
});

describe("Media routes RBAC", () => {
  it("blocks an Agent not assigned to the property from uploading media to it", async () => {
    const { agent } = await loginAs(UserRole.AGENT);
    const { location } = await createLocationHierarchy();
    const { propertyType, category, purpose } = await createPropertyLookups();
    const property = await createProperty({ locationId: location.id, propertyTypeId: propertyType.id, categoryId: category.id, purposeId: purpose.id });

    const res = await agent
      .post(`/api/admin/properties/${property.id}/media`)
      .attach("file", Buffer.from("fake image bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(403);
  });
});
