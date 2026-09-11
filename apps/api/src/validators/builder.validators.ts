import { z } from "zod";

export const builderSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(3000).optional(),
    website: z.string().trim().url().optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().max(20).optional(),
    address: z.string().trim().max(500).optional(),
    establishedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    metaTitle: z.string().trim().max(160).optional(),
    metaDescription: z.string().trim().max(300).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const builderUpdateSchema = z.object({ body: builderSchema.shape.body.partial() });
