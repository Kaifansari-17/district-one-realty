import { Router } from "express";
import { authenticate } from "@/middlewares/auth";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { getDashboardStats } from "@/services/dashboard.service";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  catchAsync(async (req, res) => sendSuccess(res, await getDashboardStats(req.user!)))
);

export { router as dashboardAdminRoutes };
