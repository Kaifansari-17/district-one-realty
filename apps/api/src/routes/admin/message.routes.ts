import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { logActivity } from "@/services/activityLog.service";
import * as contactService from "@/services/contact.service";

const router = Router();
// Contact messages are company-wide correspondence, not agent-scoped — Admin/Super Admin only.
router.use(authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { items, pagination } = await contactService.listContactMessages(req.query);
    return sendSuccess(res, { items, pagination });
  })
);

router.patch(
  "/:id/read",
  catchAsync(async (req, res) => {
    const message = await contactService.markContactMessageRead(req.params.id, req.body.isRead ?? true);
    await logActivity(req.user!.id, "MARK_READ", "ContactMessage", message.id);
    return sendSuccess(res, message, "Updated successfully");
  })
);

export { router as messageAdminRoutes };
