import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Opaque, high-entropy token for refresh/reset flows (not a JWT). */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

/** SHA-256 the opaque token before storing it — only the hash ever touches the DB. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
