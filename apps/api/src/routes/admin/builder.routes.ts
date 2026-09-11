import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as builderController from "@/controllers/admin/builder.controller";
import { buildMediaRouter } from "@/routes/admin/media.routes";
import { builderSchema, builderUpdateSchema } from "@/validators/builder.validators";

const router = Router();
router.use(authenticate);

router.get("/", builderController.list);
router.get("/:id", builderController.getById);
router.post("/", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validate(builderSchema), builderController.create);
router.put(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(builderUpdateSchema),
  builderController.update
);
// Agents cannot delete builders (per spec) — Admin/Super Admin only.
router.delete("/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), builderController.remove);

router.use("/:id/media", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), buildMediaRouter("BUILDER_LOGO"));

export { router as builderAdminRoutes };
