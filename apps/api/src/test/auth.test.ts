import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { app } from "@/test/testApp";
import { resetDatabase, disconnectDatabase } from "@/test/db";
import { createUser, TEST_PASSWORD } from "@/test/fixtures";
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

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials and sets both cookies", async () => {
    const user = await createUser(UserRole.SUPER_ADMIN);

    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user).not.toHaveProperty("passwordHash");

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("d1r_access_token="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("d1r_refresh_token="))).toBe(true);
  });

  it("rejects an incorrect password without revealing whether the email exists", async () => {
    const user = await createUser(UserRole.ADMIN);

    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects login for a deactivated account", async () => {
    const user = await createUser(UserRole.AGENT, { isActive: false });

    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });

  it("returns a 400 validation error for a malformed email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email", password: "x" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});

describe("GET /api/auth/me", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user's profile when authenticated", async () => {
    const user = await createUser(UserRole.ADMIN);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    const res = await agent.get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("locks out a deactivated user immediately, even with a still-valid access token", async () => {
    const user = await createUser(UserRole.AGENT);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    // Deactivate out-of-band (e.g. an admin action) — the access token itself is still unexpired.
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh and /api/auth/logout", () => {
  it("rotates the refresh token and revokes the old one", async () => {
    const user = await createUser(UserRole.SUPER_ADMIN);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    const beforeCount = await prisma.refreshToken.count({ where: { userId: user.id, revokedAt: null } });
    expect(beforeCount).toBe(1);

    const refreshRes = await agent.post("/api/auth/refresh");
    expect(refreshRes.status).toBe(200);

    const activeTokens = await prisma.refreshToken.findMany({ where: { userId: user.id } });
    expect(activeTokens).toHaveLength(2);
    expect(activeTokens.filter((t) => t.revokedAt === null)).toHaveLength(1);
    expect(activeTokens.filter((t) => t.revokedAt !== null)).toHaveLength(1);
  });

  it("logs out, clears the session, and further /me calls are rejected", async () => {
    const user = await createUser(UserRole.ADMIN);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });

    const logoutRes = await agent.post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(401);
  });
});
