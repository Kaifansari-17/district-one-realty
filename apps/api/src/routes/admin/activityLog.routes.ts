import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { prisma } from "@/config/prisma";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";

const router = Router();
// Full activity history is a Super Admin/Admin concern, not agent-scoped.
router.use(authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { page, limit, skip, take } = parsePagination(req.query);
    const where: Record<string, unknown> = {};
    if (req.query.userId) where.userId = String(req.query.userId);
    if (req.query.entity) where.entity = String(req.query.entity);

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return sendSuccess(res, { items, pagination: buildPaginationMeta(page, limit, total) });
  })
);

export { router as activityLogAdminRoutes };
