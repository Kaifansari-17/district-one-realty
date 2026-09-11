import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { createLookupController } from "@/controllers/admin/lookupCrud.controller.factory";
import {
  amenityService,
  featureService,
  propertyCategoryService,
  propertyTypeService,
  purposeService,
} from "@/services/lookups";
import {
  amenitySchema,
  amenityUpdateSchema,
  featureSchema,
  featureUpdateSchema,
  propertyCategorySchema,
  propertyCategoryUpdateSchema,
  propertyTypeSchema,
  propertyTypeUpdateSchema,
  purposeSchema,
  purposeUpdateSchema,
} from "@/validators/lookup.validators";

const router = Router();

/**
 * Five simple `{ name, slug, isActive }`-shaped lookup tables share one CRUD
 * pattern end to end (service factory + controller factory) — see
 * lookupCrud.factory.ts and lookupCrud.controller.factory.ts. Only the zod
 * schema and service instance differ per resource.
 */
function mountLookupRoutes(
  path: string,
  service: ReturnType<typeof import("@/services/lookupCrud.factory").createLookupService>,
  entityName: string,
  createSchema: Parameters<typeof validate>[0],
  updateSchema: Parameters<typeof validate>[0]
) {
  const controller = createLookupController(service, entityName);

  const sub = Router();
  sub.get("/", controller.list);
  sub.get("/active", controller.listActive);
  sub.get("/:id", controller.getById);
  sub.post("/", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validate(createSchema), controller.create);
  sub.put("/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), validate(updateSchema), controller.update);
  sub.delete("/:id", authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), controller.remove);

  router.use(path, sub);
}

router.use(authenticate);

mountLookupRoutes("/amenities", amenityService, "Amenity", amenitySchema, amenityUpdateSchema);
mountLookupRoutes("/features", featureService, "Feature", featureSchema, featureUpdateSchema);
mountLookupRoutes(
  "/property-categories",
  propertyCategoryService,
  "PropertyCategory",
  propertyCategorySchema,
  propertyCategoryUpdateSchema
);
mountLookupRoutes("/purposes", purposeService, "Purpose", purposeSchema, purposeUpdateSchema);
mountLookupRoutes(
  "/property-types",
  propertyTypeService,
  "PropertyType",
  propertyTypeSchema,
  propertyTypeUpdateSchema
);

export { router as lookupsAdminRoutes };
