import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as locationService from "@/services/location.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await locationService.listAdminLocations(req.query);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const location = await locationService.getAdminLocationById(req.params.id);
  return sendSuccess(res, location);
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const location = await locationService.createLocation(req.body);
  await logActivity(req.user!.id, "CREATE", "Location", location.id);
  return sendCreated(res, location, "Location created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const location = await locationService.updateLocation(req.params.id, req.body);
  await logActivity(req.user!.id, "UPDATE", "Location", location.id);
  return sendSuccess(res, location, "Location updated successfully");
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await locationService.deleteLocation(req.params.id);
  await logActivity(req.user!.id, "DELETE", "Location", req.params.id);
  return sendSuccess(res, null, "Location deleted successfully");
});
