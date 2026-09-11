import { prisma } from "@/config/prisma";
import { createLookupService } from "@/services/lookupCrud.factory";

export const amenityService = createLookupService(prisma.amenity, "Amenity");
export const featureService = createLookupService(prisma.feature, "Feature");
export const propertyCategoryService = createLookupService(prisma.propertyCategory, "PropertyCategory");
export const purposeService = createLookupService(prisma.purpose, "Purpose");
export const propertyTypeService = createLookupService(prisma.propertyType, "PropertyType");
