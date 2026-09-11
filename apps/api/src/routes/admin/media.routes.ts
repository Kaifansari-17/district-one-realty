import { Router } from "express";
import type { MediaOwnerType } from "@prisma/client";
import type { RequestHandler } from "express";
import { createMediaController } from "@/controllers/admin/media.controller";
import { uploadDocument, uploadImage } from "@/middlewares/upload";

/**
 * Builds a mountable media sub-router for one owner type, e.g.:
 *   router.use("/:id/media", assertPropertyAccess, buildMediaRouter("PROPERTY_IMAGE"))
 * `mergeParams` lets it read the parent route's `:id` param.
 */
export function buildMediaRouter(ownerType: MediaOwnerType, kind: "image" | "document" = "image"): Router {
  const router = Router({ mergeParams: true });
  const controller = createMediaController(ownerType);
  const uploader: RequestHandler = (kind === "document" ? uploadDocument : uploadImage).single("file");

  router.get("/", controller.list);
  router.post("/", uploader, controller.upload);
  router.patch("/reorder", controller.reorder);
  router.patch("/:mediaId", controller.updateMeta);
  router.patch("/:mediaId/primary", controller.setPrimary);
  router.delete("/:mediaId", controller.remove);

  return router;
}
