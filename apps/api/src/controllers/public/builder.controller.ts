import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as builderService from "@/services/builder.service";

export const list = catchAsync(async (_req: Request, res: Response) => {
  return sendSuccess(res, await builderService.listPublicBuilders());
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await builderService.getBuilderBySlug(req.params.slug));
});
