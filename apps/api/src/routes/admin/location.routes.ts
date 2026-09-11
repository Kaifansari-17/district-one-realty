import { Router } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { sendCreated, sendSuccess } from "@/utils/ApiResponse";
import * as locationController from "@/controllers/admin/location.controller";
import { buildMediaRouter } from "@/routes/admin/media.routes";
import { citySchema, cityUpdateSchema, locationSchema, locationUpdateSchema } from "@/validators/location.validators";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { ApiError } from "@/utils/ApiError";
import { logActivity } from "@/services/activityLog.service";

const router = Router();
router.use(authenticate);

// Countries/states are effectively static seed data — read-only for now.
router.get(
  "/countries",
  catchAsync(async (_req, res) => sendSuccess(res, await prisma.country.findMany({ orderBy: { name: "asc" } })))
);
router.get(
  "/states",
  catchAsync(async (_req, res) => sendSuccess(res, await prisma.state.findMany({ orderBy: { name: "asc" } })))
);

// Cities: full CRUD so the platform isn't hardcoded to Navi Mumbai forever.
router.get(
  "/cities",
  catchAsync(async (_req, res) =>
    sendSuccess(res, await prisma.city.findMany({ include: { state: true }, orderBy: { name: "asc" } }))
  )
);
router.post(
  "/cities",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(citySchema),
  catchAsync(async (req, res) => {
    const state = await prisma.state.findUnique({ where: { id: req.body.stateId } });
    if (!state) throw ApiError.badRequest("Invalid stateId");
    const slug = await generateUniqueSlug(req.body.name, async (candidate) => {
      const existing = await prisma.city.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });
    const city = await prisma.city.create({ data: { name: req.body.name, stateId: req.body.stateId, slug } });
    await logActivity(req.user!.id, "CREATE", "City", city.id);
    return sendCreated(res, city, "City created successfully");
  })
);
router.put(
  "/cities/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(cityUpdateSchema),
  catchAsync(async (req, res) => {
    const city = await prisma.city.update({ where: { id: req.params.id }, data: req.body });
    await logActivity(req.user!.id, "UPDATE", "City", city.id);
    return sendSuccess(res, city, "City updated successfully");
  })
);

// Locations: full CRUD.
router.get("/locations", locationController.list);
router.get("/locations/:id", locationController.getById);
router.post(
  "/locations",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(locationSchema),
  locationController.create
);
router.put(
  "/locations/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(locationUpdateSchema),
  locationController.update
);
router.delete("/locations/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), locationController.remove);

router.use(
  "/locations/:id/media",
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  buildMediaRouter("LOCATION_IMAGE")
);

export { router as locationAdminRoutes };
