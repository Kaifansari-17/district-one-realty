import { Router } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendSuccess } from "@/utils/ApiResponse";
import { cacheControl } from "@/middlewares/cacheControl";
import {
  amenityService,
  featureService,
  propertyCategoryService,
  propertyTypeService,
  purposeService,
} from "@/services/lookups";

const router = Router();

// Active-only lookup lists for public filter dropdowns/autocomplete — never paginated, always
// small, and change rarely (an admin adding an amenity), so a short public cache is safe.
router.use(cacheControl(300));

router.get(
  "/amenities",
  catchAsync(async (_req, res) => sendSuccess(res, await amenityService.listActive()))
);
router.get(
  "/features",
  catchAsync(async (_req, res) => sendSuccess(res, await featureService.listActive()))
);
router.get(
  "/property-categories",
  catchAsync(async (_req, res) => sendSuccess(res, await propertyCategoryService.listActive()))
);
router.get(
  "/purposes",
  catchAsync(async (_req, res) => sendSuccess(res, await purposeService.listActive()))
);
router.get(
  "/property-types",
  catchAsync(async (_req, res) => sendSuccess(res, await propertyTypeService.listActive()))
);

export { router as metaRoutes };
