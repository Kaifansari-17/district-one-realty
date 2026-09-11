import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as blogController from "@/controllers/admin/blog.controller";
import { buildMediaRouter } from "@/routes/admin/media.routes";
import { blogSchema, blogUpdateSchema } from "@/validators/blog.validators";

const router = Router();
router.use(authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get("/", blogController.list);
router.get("/:id", blogController.getById);
router.post("/", validate(blogSchema), blogController.create);
router.put("/:id", validate(blogUpdateSchema), blogController.update);
router.delete("/:id", blogController.remove);

router.use("/:id/featured-image", buildMediaRouter("BLOG_FEATURED_IMAGE"));

export { router as blogAdminRoutes };
