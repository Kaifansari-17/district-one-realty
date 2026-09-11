import request from "supertest";
import type { UserRole } from "@prisma/client";
import { app } from "@/test/testApp";
import { createUser, TEST_PASSWORD } from "@/test/fixtures";

/**
 * Creates a user of the given role and returns a supertest agent already logged in as them —
 * `request.agent()` persists cookies across calls, so every subsequent `.get()/.post()` on the
 * returned agent carries that session automatically, exactly like a real authenticated client.
 */
export async function loginAs(role: UserRole, overrides?: Parameters<typeof createUser>[1]) {
  const user = await createUser(role, overrides);
  const agent = request.agent(app);

  const res = await agent.post("/api/auth/login").send({ email: user.email, password: TEST_PASSWORD });
  if (res.status !== 200) {
    throw new Error(`Test login failed for ${user.email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { agent, user };
}
