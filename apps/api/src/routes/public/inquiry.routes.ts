import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { publicFormLimiter } from "@/middlewares/rateLimiters";
import { createInquirySchema } from "@/validators/lead.validators";
import * as inquiryController from "@/controllers/public/inquiry.controller";

const router = Router();

router.post("/", publicFormLimiter, validate(createInquirySchema), inquiryController.create);

export { router as inquiryRoutes };
