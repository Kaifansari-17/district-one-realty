import { Router } from "express";
import * as locationController from "@/controllers/public/location.controller";
import { cacheControl } from "@/middlewares/cacheControl";

const router = Router();

router.get("/", cacheControl(60), locationController.list);
router.get("/:slug", cacheControl(30), locationController.getBySlug);

export { router as locationPublicRoutes };
