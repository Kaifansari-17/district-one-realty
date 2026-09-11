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

describe("POST /api/contact", () => {
  it("stores a valid contact message", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Anil Mehta", phone: "9988776655", message: "Please call me back regarding Kharghar listings." });

    expect(res.status).toBe(200);
    expect(await prisma.contactMessage.count()).toBe(1);
  });

  it("silently drops a submission when the honeypot field is filled", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Bot", phone: "9988776655", message: "spam message here", website: "http://spam.example.com" });

    expect(res.status).toBe(200);
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it("rejects a message shorter than the minimum length", async () => {
    const res = await request(app).post("/api/contact").send({ name: "Anil", phone: "9988776655", message: "hi" });
    expect(res.status).toBe(400);
  });
});

describe("Admin messages inbox — Admin/Super Admin only", () => {
  it("blocks an Agent from viewing the contact inbox", async () => {
    const { agent } = await loginAs(UserRole.AGENT);
    const res = await agent.get("/api/admin/messages");
    expect(res.status).toBe(403);
  });

  it("allows an Admin to view and mark a message read", async () => {
    const { agent } = await loginAs(UserRole.ADMIN);
    const message = await prisma.contactMessage.create({
      data: { name: "Anil", phone: "9988776655", message: "Test message" },
    });

    const listRes = await agent.get("/api/admin/messages");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.items).toHaveLength(1);

    const markRead = await agent.patch(`/api/admin/messages/${message.id}/read`).send({ isRead: true });
    expect(markRead.status).toBe(200);
    expect(markRead.body.data.isRead).toBe(true);
  });
});
