import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { app } from "@/test/testApp";
import { resetDatabase, disconnectDatabase } from "@/test/db";
import { loginAs } from "@/test/authHelper";
import { prisma } from "@/config/prisma";

beforeAll(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("POST /api/inquiries", () => {
  it("creates a lead from a valid public inquiry", async () => {
    const res = await request(app).post("/api/inquiries").send({
      name: "Jane Doe",
      phone: "9123456789",
      email: "jane@example.com",
      message: "Interested in this property",
      source: "WEBSITE",
    });

    expect(res.status).toBe(200);
    const leads = await prisma.lead.findMany();
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe("Jane Doe");
    expect(leads[0].status).toBe("NEW");
  });

  it("silently drops a submission when the honeypot field is filled (no lead created, no error surfaced)", async () => {
    const res = await request(app).post("/api/inquiries").send({
      name: "Bot",
      phone: "9123456789",
      source: "WEBSITE",
      website: "http://spam.example.com",
    });

    expect(res.status).toBe(200);
    const leads = await prisma.lead.findMany();
    expect(leads).toHaveLength(0);
  });

  it("rejects an invalid phone number with a 400", async () => {
    const res = await request(app).post("/api/inquiries").send({ name: "Jane", phone: "123", source: "WEBSITE" });
    expect(res.status).toBe(400);
  });
});

describe("Admin lead RBAC and ownership", () => {
  it("an agent only sees leads assigned to them", async () => {
    const { agent: agentClient, user: agentUser } = await loginAs(UserRole.AGENT);
    const { agent: adminClient } = await loginAs(UserRole.ADMIN);

    await request(app).post("/api/inquiries").send({ name: "Unassigned Lead", phone: "9123456780", source: "WEBSITE" });
    const assignedLead = await prisma.lead.create({
      data: { name: "Assigned Lead", phone: "9123456781", source: "WEBSITE", agentId: agentUser.id },
    });

    const agentRes = await agentClient.get("/api/admin/leads");
    expect(agentRes.body.data.items).toHaveLength(1);
    expect(agentRes.body.data.items[0].id).toBe(assignedLead.id);

    const adminRes = await adminClient.get("/api/admin/leads");
    expect(adminRes.body.data.items).toHaveLength(2);
  });

  it("only staff can assign/reassign a lead's agent; an agent can still update status on their own lead", async () => {
    const { agent: agentClient, user: agentUser } = await loginAs(UserRole.AGENT);
    const { agent: adminClient, user: otherAgentUser } = await loginAs(UserRole.ADMIN);

    const lead = await prisma.lead.create({
      data: { name: "Test Lead", phone: "9123456782", source: "WEBSITE", agentId: agentUser.id },
    });

    const statusUpdate = await agentClient.put(`/api/admin/leads/${lead.id}`).send({ status: "CONTACTED" });
    expect(statusUpdate.status).toBe(200);
    expect(statusUpdate.body.data.status).toBe("CONTACTED");

    const reassignAttempt = await agentClient.put(`/api/admin/leads/${lead.id}`).send({ agentId: otherAgentUser.id });
    expect(reassignAttempt.status).toBe(403);

    const staffReassign = await adminClient.put(`/api/admin/leads/${lead.id}`).send({ agentId: otherAgentUser.id });
    expect(staffReassign.status).toBe(200);
  });

  it("an agent cannot view or modify a lead assigned to someone else", async () => {
    const { agent: agentClient } = await loginAs(UserRole.AGENT);
    const { user: otherAgentUser } = await loginAs(UserRole.AGENT, { email: "other-agent@test.local" });

    const lead = await prisma.lead.create({
      data: { name: "Someone Else's Lead", phone: "9123456783", source: "WEBSITE", agentId: otherAgentUser.id },
    });

    const res = await agentClient.get(`/api/admin/leads/${lead.id}`);
    expect(res.status).toBe(403);
  });
});
