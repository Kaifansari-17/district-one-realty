import { prisma } from "@/config/prisma";
import { env, isDevelopment } from "@/config/env";
import { ApiError } from "@/utils/ApiError";
import { comparePassword, generateOpaqueToken, hashPassword, hashToken } from "@/utils/hash";
import { signAccessToken } from "@/utils/jwt";
import { addDuration } from "@/utils/duration";
import { sendPasswordResetEmail } from "@/emails/sendPasswordResetEmail";
import type { AuthenticatedUser } from "@/types/express";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  designation: true,
  bio: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function issueTokens(user: AuthenticatedUser): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const refreshToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  return { accessToken, refreshToken };
}

export async function login(email: string, password: string): Promise<AuthTokens & { user: AuthenticatedUser }> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.activityLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
  });

  const authUser: AuthenticatedUser = { id: user.id, email: user.email, role: user.role, name: user.name };
  const tokens = await issueTokens(authUser);

  return { ...tokens, user: authUser };
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const tokenHash = hashToken(refreshToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date() || !existing.user.isActive) {
    throw ApiError.unauthorized("Session expired, please sign in again");
  }

  // Rotate: revoke the used refresh token and issue a brand new pair.
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });

  const authUser: AuthenticatedUser = {
    id: existing.user.id,
    email: existing.user.email,
    role: existing.user.role,
    name: existing.user.name,
  };

  return issueTokens(authUser);
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always resolve successfully — never reveal whether an email exists in the system.
  if (!user || !user.isActive) return;

  const token = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: addDuration(new Date(), `${env.PASSWORD_RESET_TOKEN_TTL_MIN}m`),
    },
  });

  const baseUrl = isDevelopment ? "http://localhost:5174" : env.ADMIN_WEB_URL;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest("This password reset link is invalid or has expired");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    // Force re-login everywhere once the password changes.
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const passwordMatches = await comparePassword(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
