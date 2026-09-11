import { Router } from "express";
import * as builderController from "@/controllers/public/builder.controller";
import { cacheControl } from "@/middlewares/cacheControl";

const router = Router();

router.get("/", cacheControl(60), builderController.list);
router.get("/:slug", cacheControl(30), builderController.getBySlug);

export { router as builderPublicRoutes };
