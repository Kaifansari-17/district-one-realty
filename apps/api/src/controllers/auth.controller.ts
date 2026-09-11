import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/utils/cookies";
import * as authService from "@/services/auth.service";
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "@/validators/auth.validators";

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const { accessToken, refreshToken, user } = await authService.login(email, password);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, { user }, "Signed in successfully");
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const existingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!existingRefreshToken) {
    throw ApiError.unauthorized("No active session found");
  }

  const { accessToken, refreshToken } = await authService.refreshSession(existingRefreshToken);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, null, "Session refreshed");
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const existingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  await authService.logout(existingRefreshToken);
  clearAuthCookies(res);
  return sendSuccess(res, null, "Signed out successfully");
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.id);
  return sendSuccess(res, profile);
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.forgotPassword(email);
  return sendSuccess(res, null, "If an account exists for that email, a reset link has been sent");
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, password);
  return sendSuccess(res, null, "Password reset successfully. Please sign in.");
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  return sendSuccess(res, null, "Password changed successfully");
});
