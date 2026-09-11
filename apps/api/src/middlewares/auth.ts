import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { verifyAccessToken } from "@/utils/jwt";
import { ApiError } from "@/utils/ApiError";
import { catchAsync } from "@/utils/catchAsync";
import { ACCESS_TOKEN_COOKIE } from "@/utils/cookies";

/**
 * Requires a valid access token and re-checks the user against the DB on every request
 * (rather than trusting the JWT payload alone) so a deactivated admin/agent is locked out
 * immediately instead of waiting for their short-lived access token to expire.
 */
export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Session expired, please sign in again");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, name: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account is inactive or no longer exists");
  }

  req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
  next();
});

/** Restricts a route to specific roles. Must run after `authenticate`. */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
