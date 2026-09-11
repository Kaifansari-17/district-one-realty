import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as propertyService from "@/services/property.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await propertyService.listPublicProperties(req.query as never);
  return sendSuccess(res, { items, pagination });
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await propertyService.getPropertyBySlug(req.params.slug));
});
