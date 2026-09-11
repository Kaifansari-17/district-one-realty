import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/test/testApp";
import { resetDatabase, disconnectDatabase } from "@/test/db";
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

describe("POST /api/site-visits", () => {
  it("creates both a site visit and a linked lead from a valid request", async () => {
    const res = await request(app).post("/api/site-visits").send({
      name: "Priya Shah",
      phone: "9123456789",
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      preferredTime: "11:00 AM",
    });

    expect(res.status).toBe(200);

    const visits = await prisma.siteVisit.findMany();
    expect(visits).toHaveLength(1);
    expect(visits[0].status).toBe("REQUESTED");
    expect(visits[0].leadId).not.toBeNull();

    const leads = await prisma.lead.findMany();
    expect(leads).toHaveLength(1);
    expect(leads[0].source).toBe("SITE_VISIT");
  });

  it("silently drops a submission when the honeypot field is filled", async () => {
    const res = await request(app).post("/api/site-visits").send({
      name: "Bot",
      phone: "9123456789",
      preferredDate: new Date().toISOString(),
      preferredTime: "10:00 AM",
      website: "http://spam.example.com",
    });

    expect(res.status).toBe(200);
    expect(await prisma.siteVisit.count()).toBe(0);
  });

  it("rejects a request missing the required preferred date", async () => {
    const res = await request(app).post("/api/site-visits").send({ name: "Priya", phone: "9123456789", preferredTime: "11:00 AM" });
    expect(res.status).toBe(400);
  });
});
