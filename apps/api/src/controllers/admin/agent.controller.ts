import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as agentService from "@/services/agent.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await agentService.listStaff(req.query);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await agentService.getStaffById(req.params.id));
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const { user, temporaryPassword } = await agentService.createStaff(req.body);
  await logActivity(req.user!.id, "CREATE", "User", user.id, { role: user.role });
  return sendCreated(res, { user, temporaryPassword }, "Staff account created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const user = await agentService.updateStaff(req.params.id, req.body);
  await logActivity(req.user!.id, "UPDATE", "User", user.id);
  return sendSuccess(res, user, "Staff account updated successfully");
});

export const activate = catchAsync(async (req: Request, res: Response) => {
  const user = await agentService.setStaffActive(req.params.id, true);
  await logActivity(req.user!.id, "ACTIVATE", "User", user.id);
  return sendSuccess(res, user, "Account activated");
});

export const deactivate = catchAsync(async (req: Request, res: Response) => {
  const user = await agentService.setStaffActive(req.params.id, false);
  await logActivity(req.user!.id, "DEACTIVATE", "User", user.id);
  return sendSuccess(res, user, "Account deactivated");
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const temporaryPassword = await agentService.resetStaffPassword(req.params.id);
  await logActivity(req.user!.id, "RESET_PASSWORD", "User", req.params.id);
  return sendSuccess(res, { temporaryPassword }, "Password reset successfully");
});

export const getAssignments = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await agentService.getAgentAssignments(req.params.id));
});
