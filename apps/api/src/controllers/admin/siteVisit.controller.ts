import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as siteVisitService from "@/services/siteVisit.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await siteVisitService.listSiteVisits(req.query, req.user!);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await siteVisitService.getSiteVisitById(req.params.id, req.user!));
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const visit = await siteVisitService.updateSiteVisit(req.params.id, req.body, req.user!);
  await logActivity(req.user!.id, "UPDATE", "SiteVisit", visit.id, req.body);
  return sendSuccess(res, visit, "Site visit updated successfully");
});
