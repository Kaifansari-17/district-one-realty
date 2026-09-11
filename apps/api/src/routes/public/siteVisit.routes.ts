import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { publicFormLimiter } from "@/middlewares/rateLimiters";
import { createSiteVisitSchema } from "@/validators/siteVisit.validators";
import * as siteVisitController from "@/controllers/public/siteVisit.controller";

const router = Router();

router.post("/", publicFormLimiter, validate(createSiteVisitSchema), siteVisitController.create);

export { router as siteVisitPublicRoutes };
