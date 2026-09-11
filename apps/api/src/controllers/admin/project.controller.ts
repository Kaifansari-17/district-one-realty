import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as projectService from "@/services/project.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await projectService.listAdminProjects(req.query, req.user!);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await projectService.getAdminProjectById(req.params.id, req.user!));
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body);
  await logActivity(req.user!.id, "CREATE", "Project", project.id);
  return sendCreated(res, project, "Project created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user!);
  await logActivity(req.user!.id, "UPDATE", "Project", project.id);
  return sendSuccess(res, project, "Project updated successfully");
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id);
  await logActivity(req.user!.id, "DELETE", "Project", req.params.id);
  return sendSuccess(res, null, "Project deleted successfully");
});

export const publish = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.publishProject(req.params.id, req.user!);
  await logActivity(req.user!.id, "PUBLISH", "Project", project.id);
  return sendSuccess(res, project, "Project published");
});

export const unpublish = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.unpublishProject(req.params.id, req.user!);
  await logActivity(req.user!.id, "UNPUBLISH", "Project", project.id);
  return sendSuccess(res, project, "Project unpublished");
});

export const setFeatured = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.setProjectFeatured(req.params.id, Boolean(req.body.isFeatured));
  await logActivity(req.user!.id, "SET_FEATURED", "Project", project.id, { isFeatured: req.body.isFeatured });
  return sendSuccess(res, project, "Project updated");
});
