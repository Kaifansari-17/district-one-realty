import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import * as leadService from "@/services/lead.service";

export const create = catchAsync(async (req: Request, res: Response) => {
  await leadService.createInquiry(req.body);
  return sendSuccess(res, null, "Thank you — our team will get back to you shortly.");
});
