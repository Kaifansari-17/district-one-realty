import { Router } from "express";
import * as blogController from "@/controllers/public/blog.controller";

const router = Router();

router.get("/", blogController.list);
router.get("/:slug", blogController.getBySlug);

export { router as blogPublicRoutes };
