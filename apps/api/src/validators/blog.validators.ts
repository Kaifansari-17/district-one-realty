import { z } from "zod";

export const blogSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(200),
    excerpt: z.string().trim().max(500).optional(),
    content: z.string().trim().min(20),
    isPublished: z.boolean().default(false),
    metaTitle: z.string().trim().max(160).optional(),
    metaDescription: z.string().trim().max(300).optional(),
  }),
});

export const blogUpdateSchema = z.object({ body: blogSchema.shape.body.partial() });
