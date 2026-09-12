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
// Applied per-route (not via a router-level `router.use()`) because this router is itself
// mounted at "/" in routes/index.ts — a path-unscoped `use()` here would run for every request
// that falls through to it, including unrelated /admin/* routes further down the chain.
const publicLookupCache = cacheControl(300);

router.get(
  "/amenities",
  publicLookupCache,
  catchAsync(async (_req, res) => sendSuccess(res, await amenityService.listActive()))
);
router.get(
  "/features",
  publicLookupCache,
  catchAsync(async (_req, res) => sendSuccess(res, await featureService.listActive()))
);
router.get(
  "/property-categories",
  publicLookupCache,
  catchAsync(async (_req, res) => sendSuccess(res, await propertyCategoryService.listActive()))
);
router.get(
  "/purposes",
  publicLookupCache,
  catchAsync(async (_req, res) => sendSuccess(res, await purposeService.listActive()))
);
router.get(
  "/property-types",
  publicLookupCache,
  catchAsync(async (_req, res) => sendSuccess(res, await propertyTypeService.listActive()))
);

export { router as metaRoutes };
