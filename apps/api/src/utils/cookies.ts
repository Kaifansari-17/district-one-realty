import type { Response } from "express";
import { env, isProduction } from "@/config/env";
import { parseDurationToMs } from "@/utils/duration";

export const ACCESS_TOKEN_COOKIE = "d1r_access_token";
export const REFRESH_TOKEN_COOKIE = "d1r_refresh_token";

/** Refresh cookie is scoped to the refresh/logout endpoints only — it never needs to leave that path. */
const REFRESH_COOKIE_PATH = "/api/auth";

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  };
}

export function setAccessTokenCookie(res: Response, token: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN),
  });
}

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseCookieOptions(), path: REFRESH_COOKIE_PATH });
}
