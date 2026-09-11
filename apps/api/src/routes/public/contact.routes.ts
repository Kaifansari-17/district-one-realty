import { Router } from "express";
import { validate } from "@/middlewares/validate";
import { publicFormLimiter } from "@/middlewares/rateLimiters";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { contactMessageSchema } from "@/validators/contact.validators";
import * as contactService from "@/services/contact.service";

const router = Router();

router.post(
  "/",
  publicFormLimiter,
  validate(contactMessageSchema),
  catchAsync(async (req, res) => {
    await contactService.createContactMessage(req.body);
    return sendSuccess(res, null, "Thank you for reaching out — we'll be in touch shortly.");
  })
);

export { router as contactRoutes };
