import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { assertCanAccessProperty } from "@/utils/ownership";
import * as propertyController from "@/controllers/admin/property.controller";
import { buildMediaRouter } from "@/routes/admin/media.routes";
import { propertySchema, propertyUpdateSchema } from "@/validators/property.validators";

const router = Router();
router.use(authenticate);

const assertPropertyAccess = catchAsync(async (req, _res, next) => {
  await assertCanAccessProperty(req.user!, req.params.id);
  next();
});

router.get("/", propertyController.list);
router.get("/:id", propertyController.getById);
router.post("/", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validate(propertySchema), propertyController.create);
router.put("/:id", validate(propertyUpdateSchema), propertyController.update);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), propertyController.remove);

router.patch("/:id/publish", assertPropertyAccess, propertyController.publish);
router.patch("/:id/unpublish", assertPropertyAccess, propertyController.unpublish);
router.patch("/:id/archive", assertPropertyAccess, propertyController.archive);
router.patch("/:id/featured", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), propertyController.setFeatured);
router.patch("/:id/verified", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), propertyController.setVerified);

router.use("/:id/media", assertPropertyAccess, buildMediaRouter("PROPERTY_IMAGE"));
router.use("/:id/videos", assertPropertyAccess, buildMediaRouter("PROPERTY_VIDEO"));
router.use("/:id/floor-plans", assertPropertyAccess, buildMediaRouter("PROPERTY_FLOOR_PLAN", "document"));
router.use("/:id/documents", assertPropertyAccess, buildMediaRouter("PROPERTY_DOCUMENT", "document"));

export { router as propertyAdminRoutes };
