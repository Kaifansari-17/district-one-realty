import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as locationService from "@/services/location.service";

export const list = catchAsync(async (_req: Request, res: Response) => {
  const locations = await locationService.listPublicLocations();
  return sendSuccess(res, locations);
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const location = await locationService.getLocationBySlug(req.params.slug);
  return sendSuccess(res, location);
});
