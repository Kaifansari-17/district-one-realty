import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as leadService from "@/services/lead.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await leadService.listLeads(req.query, req.user!);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await leadService.getLeadById(req.params.id, req.user!));
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.updateLead(req.params.id, req.body, req.user!);
  await logActivity(req.user!.id, "UPDATE", "Lead", lead.id, req.body);
  return sendSuccess(res, lead, "Lead updated successfully");
});

export const addNote = catchAsync(async (req: Request, res: Response) => {
  const note = await leadService.addLeadNote(req.params.id, req.body.text, req.user!);
  await logActivity(req.user!.id, "ADD_NOTE", "Lead", req.params.id);
  return sendCreated(res, note, "Note added successfully");
});
