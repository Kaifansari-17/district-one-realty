import { z } from "zod";

export const citySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    stateId: z.string().min(1, "stateId is required"),
  }),
});
export const cityUpdateSchema = z.object({ body: citySchema.shape.body.partial() });

export const locationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    cityId: z.string().min(1, "cityId is required"),
    description: z.string().trim().max(2000).optional(),
    pincode: z.string().trim().max(10).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    metaTitle: z.string().trim().max(160).optional(),
    metaDescription: z.string().trim().max(300).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const locationUpdateSchema = z.object({ body: locationSchema.shape.body.partial() });

export const locationListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    isActive: z.enum(["true", "false"]).optional(),
    q: z.string().optional(),
  }),
});
