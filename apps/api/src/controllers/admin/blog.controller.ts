import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as blogService from "@/services/blog.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await blogService.listAdminBlogs(req.query);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await blogService.getAdminBlogById(req.params.id));
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const blog = await blogService.createBlog(req.body, req.user!.id);
  await logActivity(req.user!.id, "CREATE", "Blog", blog.id);
  return sendCreated(res, blog, "Blog post created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const blog = await blogService.updateBlog(req.params.id, req.body);
  await logActivity(req.user!.id, "UPDATE", "Blog", blog.id);
  return sendSuccess(res, blog, "Blog post updated successfully");
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await blogService.deleteBlog(req.params.id);
  await logActivity(req.user!.id, "DELETE", "Blog", req.params.id);
  return sendSuccess(res, null, "Blog post deleted successfully");
});
