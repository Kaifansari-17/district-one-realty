import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { projectPublicQuerySchema } from "@/validators/project.validators";
import * as projectController from "@/controllers/public/project.controller";

const router = Router();

router.get("/", validate(projectPublicQuerySchema), projectController.list);
router.get("/by-location", projectController.listGroupedByLocation);
router.get("/:slug", projectController.getBySlug);

export { router as projectPublicRoutes };
