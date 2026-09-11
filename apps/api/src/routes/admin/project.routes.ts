import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { assertCanAccessProject } from "@/utils/ownership";
import * as projectController from "@/controllers/admin/project.controller";
import { buildMediaRouter } from "@/routes/admin/media.routes";
import { projectSchema, projectUpdateSchema } from "@/validators/project.validators";

const router = Router();
router.use(authenticate);

const assertProjectAccess = catchAsync(async (req, _res, next) => {
  await assertCanAccessProject(req.user!, req.params.id);
  next();
});

router.get("/", projectController.list);
router.get("/:id", projectController.getById);
router.post("/", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validate(projectSchema), projectController.create);
router.put("/:id", validate(projectUpdateSchema), projectController.update);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), projectController.remove);

router.patch("/:id/publish", assertProjectAccess, projectController.publish);
router.patch("/:id/unpublish", assertProjectAccess, projectController.unpublish);
router.patch("/:id/featured", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), projectController.setFeatured);

router.use("/:id/gallery", assertProjectAccess, buildMediaRouter("PROJECT_GALLERY"));
router.use("/:id/brochure", assertProjectAccess, buildMediaRouter("PROJECT_BROCHURE", "document"));
router.use("/:id/master-plan", assertProjectAccess, buildMediaRouter("PROJECT_MASTER_PLAN", "document"));

export { router as projectAdminRoutes };
