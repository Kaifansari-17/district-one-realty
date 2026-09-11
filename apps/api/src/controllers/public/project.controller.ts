import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as projectService from "@/services/project.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await projectService.listPublicProjects(req.query as never);
  return sendSuccess(res, { items, pagination });
});

export const listGroupedByLocation = catchAsync(async (_req: Request, res: Response) => {
  return sendSuccess(res, await projectService.listPublicProjectsGroupedByLocation());
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await projectService.getProjectBySlug(req.params.slug));
});
