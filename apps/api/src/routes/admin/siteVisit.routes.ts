import { Router } from "express";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as siteVisitController from "@/controllers/admin/siteVisit.controller";
import { siteVisitListQuerySchema, updateSiteVisitSchema } from "@/validators/siteVisit.validators";

const router = Router();
router.use(authenticate);

router.get("/", validate(siteVisitListQuerySchema), siteVisitController.list);
router.get("/:id", siteVisitController.getById);
router.put("/:id", validate(updateSiteVisitSchema), siteVisitController.update);

export { router as siteVisitAdminRoutes };
