import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as propertyService from "@/services/property.service";

export const list = catchAsync(async (req: Request, res: Response) => {
  const { items, pagination } = await propertyService.listAdminProperties(req.query, req.user!);
  return sendSuccess(res, { items, pagination });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  return sendSuccess(res, await propertyService.getAdminPropertyById(req.params.id, req.user!));
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.createProperty(req.body);
  await logActivity(req.user!.id, "CREATE", "Property", property.id);
  return sendCreated(res, property, "Property created successfully");
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.user!);
  await logActivity(req.user!.id, "UPDATE", "Property", property.id);
  return sendSuccess(res, property, "Property updated successfully");
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await propertyService.deleteProperty(req.params.id);
  await logActivity(req.user!.id, "DELETE", "Property", req.params.id);
  return sendSuccess(res, null, "Property deleted successfully");
});

export const publish = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.publishProperty(req.params.id, req.user!);
  await logActivity(req.user!.id, "PUBLISH", "Property", property.id);
  return sendSuccess(res, property, "Property published");
});

export const unpublish = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.unpublishProperty(req.params.id, req.user!);
  await logActivity(req.user!.id, "UNPUBLISH", "Property", property.id);
  return sendSuccess(res, property, "Property unpublished");
});

export const archive = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.archiveProperty(req.params.id, req.user!);
  await logActivity(req.user!.id, "ARCHIVE", "Property", property.id);
  return sendSuccess(res, property, "Property archived");
});

export const setFeatured = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.setPropertyFeatured(req.params.id, Boolean(req.body.featured));
  await logActivity(req.user!.id, "SET_FEATURED", "Property", property.id, { featured: req.body.featured });
  return sendSuccess(res, property, "Property updated");
});

export const setVerified = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.setPropertyVerified(req.params.id, Boolean(req.body.verified));
  await logActivity(req.user!.id, "SET_VERIFIED", "Property", property.id, { verified: req.body.verified });
  return sendSuccess(res, property, "Property updated");
});
