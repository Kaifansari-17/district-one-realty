import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as builderService from "@/services/builder.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await builderService.listAdminBuilders(req.query);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await builderService.getAdminBuilderById(req.params.id));
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const builder = await builderService.createBuilder(req.body);
  await logActivity(req.user!.id, "CREATE", "Builder", builder.id);
  return sendCreated(res, builder, "Builder created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const builder = await builderService.updateBuilder(req.params.id, req.body);
  await logActivity(req.user!.id, "UPDATE", "Builder", builder.id);
  return sendSuccess(res, builder, "Builder updated successfully");
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await builderService.deleteBuilder(req.params.id);
  await logActivity(req.user!.id, "DELETE", "Builder", req.params.id);
  return sendSuccess(res, null, "Builder deleted successfully");
});
