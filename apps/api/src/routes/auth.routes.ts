import { Router } from "express";
import * as authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { authLimiter, publicFormLimiter } from "@/middlewares/rateLimiters";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/validators/auth.validators";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

router.post("/forgot-password", publicFormLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);

export { router as authRoutes };
