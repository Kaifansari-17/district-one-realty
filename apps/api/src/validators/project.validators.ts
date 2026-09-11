import { z } from "zod";
import { PropertyStatus } from "@prisma/client";

export const projectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200),
    builderId: z.string().min(1, "builderId is required"),
    locationId: z.string().min(1, "locationId is required"),
    status: z.nativeEnum(PropertyStatus),
    description: z.string().trim().max(5000).optional(),
    reraNumber: z.string().trim().max(60).optional(),
    launchDate: z.string().datetime().optional(),
    possessionDate: z.string().datetime().optional(),
    startingPrice: z.number().positive().optional(),
    configurations: z.array(z.string()).optional(),
    totalTowers: z.number().int().positive().optional(),
    totalFloors: z.number().int().positive().optional(),
    totalUnits: z.number().int().positive().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    metaTitle: z.string().trim().max(160).optional(),
    metaDescription: z.string().trim().max(300).optional(),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    amenityIds: z.array(z.string()).optional(),
    agentIds: z.array(z.string()).optional(),
  }),
});

export const projectUpdateSchema = z.object({ body: projectSchema.shape.body.partial() });

export const projectPublicQuerySchema = z.object({
  query: z.object({
    location: z.string().optional(),
    builder: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    featured: z.enum(["true", "false"]).optional(),
  }),
});
