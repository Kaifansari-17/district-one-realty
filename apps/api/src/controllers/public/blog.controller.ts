import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as blogService from "@/services/blog.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await blogService.listPublicBlogs(req.query);
  return sendSuccess(res, { items, pagination });
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await blogService.getBlogBySlug(req.params.slug));
});
