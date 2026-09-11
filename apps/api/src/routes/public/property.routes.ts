import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { propertyPublicQuerySchema } from "@/validators/property.validators";
import * as propertyController from "@/controllers/public/property.controller";

const router = Router();

router.get("/", validate(propertyPublicQuerySchema), propertyController.list);
router.get("/:slug", propertyController.getBySlug);

export { router as propertyPublicRoutes };
