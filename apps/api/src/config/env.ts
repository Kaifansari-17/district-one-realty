import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (MySQL connection string)"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  // Refresh tokens are opaque, high-entropy strings stored hashed in the DB (not JWTs) so they
  // can be revoked/rotated immediately without needing a blacklist. See utils/hash.ts.
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  COOKIE_DOMAIN: z.string().optional(),

  PUBLIC_WEB_URL: z.string().url(),
  ADMIN_WEB_URL: z.string().url(),
  DEV_PUBLIC_WEB_URL: z.string().url().optional(),
  DEV_ADMIN_WEB_URL: z.string().url().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),

  // Base URL this API is reachable at — only needed to build absolute URLs for the local-disk
  // media storage fallback (see services/storage/). Irrelevant when Cloudinary is configured,
  // since Cloudinary returns its own absolute URLs.
  API_PUBLIC_URL: z.string().url().optional(),

  MAPS_API_KEY: z.string().optional().default(""),

  RECAPTCHA_SECRET_KEY: z.string().optional().default(""),

  WHATSAPP_NUMBER: z.string().default("919324702438"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),

  PASSWORD_RESET_TOKEN_TTL_MIN: z.coerce.number().default(60),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check your .env file against .env.example.");
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

export const allowedOrigins = [
  env.PUBLIC_WEB_URL,
  env.ADMIN_WEB_URL,
  ...(isDevelopment ? [env.DEV_PUBLIC_WEB_URL, env.DEV_ADMIN_WEB_URL] : []),
].filter((origin): origin is string => Boolean(origin));

const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

/**
 * Vite auto-increments its dev port (5173 -> 5174 -> ...) whenever the preferred one is already
 * taken by another running dev server — a single hardcoded DEV_PUBLIC_WEB_URL/DEV_ADMIN_WEB_URL
 * breaks the moment that happens, and the failure mode (CORS silently drops the response) looks
 * from the frontend like "no data" rather than a network error. In development only, accept any
 * localhost/127.0.0.1 origin regardless of port; production still only ever matches the exact
 * configured PUBLIC_WEB_URL/ADMIN_WEB_URL.
 */
export function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  return isDevelopment && LOCALHOST_ORIGIN_PATTERN.test(origin);
}

/** True unless all three Cloudinary credentials are set — see services/storage/index.ts. */
export const useLocalMediaStorage = !(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

export const apiPublicUrl = env.API_PUBLIC_URL ?? (isDevelopment ? `http://localhost:${env.PORT}` : "");
