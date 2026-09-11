import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as siteVisitService from "@/services/siteVisit.service";

export const create = catchAsync(async (req: Request, res: Response) => {
  await siteVisitService.createSiteVisit(req.body);
  return sendSuccess(res, null, "Site visit requested — our team will confirm shortly.");
});
