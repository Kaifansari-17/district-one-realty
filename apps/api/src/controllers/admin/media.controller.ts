import type { Request, Response } from "express";
import { MediaFileType, type MediaOwnerType } from "@prisma/client";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import * as mediaService from "@/services/media.service";

/**
 * Builds the { upload, list, remove, updateMeta, setPrimary, reorder } handler set for a
 * given MediaOwnerType. Mount it under a resource's admin router, e.g.
 * `router.use("/:id/media", assertPropertyAccess, createMediaController("PROPERTY_IMAGE").router)`.
 * Ownership/RBAC checks happen in the resource's own middleware before these handlers run —
 * this controller only knows how to manage rows for a given (ownerType, ownerId) pair.
 */
export function createMediaController(ownerType: MediaOwnerType, ownerParam = "id") {
  const resolveOwnerId = (req: Request) => req.params[ownerParam];

  const list = catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.listMedia(ownerType, resolveOwnerId(req));
    return sendSuccess(res, media);
  });

  const upload = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const isDocument = file.mimetype === "application/pdf";
    const media = await mediaService.uploadMedia({
      ownerType,
      ownerId: resolveOwnerId(req),
      buffer: file.buffer,
      mimetype: file.mimetype,
      folder: ownerType.toLowerCase(),
      fileType: isDocument ? MediaFileType.DOCUMENT : MediaFileType.IMAGE,
      resourceType: isDocument ? "raw" : "image",
      alt: req.body.alt,
      caption: req.body.caption,
      makePrimary: req.body.makePrimary === "true",
    });

    return sendCreated(res, media, "Uploaded successfully");
  });

  const remove = catchAsync(async (req: Request, res: Response) => {
    await mediaService.deleteMedia(req.params.mediaId, ownerType, resolveOwnerId(req));
    return sendSuccess(res, null, "Deleted successfully");
  });

  const updateMeta = catchAsync(async (req: Request, res: Response) => {
    const media = await mediaService.updateMediaMeta(req.params.mediaId, ownerType, resolveOwnerId(req), {
      alt: req.body.alt,
      caption: req.body.caption,
    });
    return sendSuccess(res, media, "Updated successfully");
  });

  const setPrimary = catchAsync(async (req: Request, res: Response) => {
    await mediaService.setPrimaryMedia(req.params.mediaId, ownerType, resolveOwnerId(req));
    return sendSuccess(res, null, "Primary image updated");
  });

  const reorder = catchAsync(async (req: Request, res: Response) => {
    const { orderedIds } = req.body as { orderedIds: string[] };
    await mediaService.reorderMedia(ownerType, resolveOwnerId(req), orderedIds);
    return sendSuccess(res, null, "Reordered successfully");
  });

  return { list, upload, remove, updateMeta, setPrimary, reorder };
}
