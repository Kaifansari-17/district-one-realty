import type { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";

interface LookupServiceLike {
  list: (query: Request["query"]) => Promise<{ items: unknown[]; pagination: unknown }>;
  listActive: () => Promise<unknown[]>;
  getById: (id: string) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<{ id: string }>;
  update: (id: string, data: Record<string, unknown>) => Promise<{ id: string }>;
  remove: (id: string) => Promise<void>;
}

export function createLookupController(service: LookupServiceLike, entityName: string) {
  const list = catchAsync(async (req: Request, res: Response) => {
    const { items, pagination } = await service.list(req.query);
    return sendSuccess(res, { items, pagination });
  });

  const listActive = catchAsync(async (_req: Request, res: Response) => {
    const items = await service.listActive();
    return sendSuccess(res, items);
  });

  const getById = catchAsync(async (req: Request, res: Response) => {
    const item = await service.getById(req.params.id);
    return sendSuccess(res, item);
  });

  const create = catchAsync(async (req: Request, res: Response) => {
    const item = await service.create(req.body);
    await logActivity(req.user!.id, "CREATE", entityName, item.id);
    return sendCreated(res, item, `${entityName} created successfully`);
  });

  const update = catchAsync(async (req: Request, res: Response) => {
    const item = await service.update(req.params.id, req.body);
    await logActivity(req.user!.id, "UPDATE", entityName, item.id);
    return sendSuccess(res, item, `${entityName} updated successfully`);
  });

  const remove = catchAsync(async (req: Request, res: Response) => {
    await service.remove(req.params.id);
    await logActivity(req.user!.id, "DELETE", entityName, req.params.id);
    return sendSuccess(res, null, `${entityName} deleted successfully`);
  });

  return { list, listActive, getById, create, update, remove };
}
