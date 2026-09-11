import { z } from "zod";
import { PropertyTypeCategory } from "@prisma/client";

const nameField = z.string().trim().min(2, "Name must be at least 2 characters").max(120);
const isActiveField = z.boolean().default(true);

export const amenitySchema = z.object({
  body: z.object({
    name: nameField,
    icon: z.string().trim().optional(),
    description: z.string().trim().max(500).optional(),
    isActive: isActiveField,
  }),
});

export const amenityUpdateSchema = z.object({ body: amenitySchema.shape.body.partial() });

export const featureSchema = z.object({
  body: z.object({
    name: nameField,
    icon: z.string().trim().optional(),
    isActive: isActiveField,
  }),
});

export const featureUpdateSchema = z.object({ body: featureSchema.shape.body.partial() });

export const propertyCategorySchema = z.object({
  body: z.object({ name: nameField, isActive: isActiveField }),
});
export const propertyCategoryUpdateSchema = z.object({ body: propertyCategorySchema.shape.body.partial() });

export const purposeSchema = z.object({
  body: z.object({ name: nameField, isActive: isActiveField }),
});
export const purposeUpdateSchema = z.object({ body: purposeSchema.shape.body.partial() });

export const propertyTypeSchema = z.object({
  body: z.object({
    name: nameField,
    category: z.nativeEnum(PropertyTypeCategory),
    isActive: isActiveField,
  }),
});
export const propertyTypeUpdateSchema = z.object({ body: propertyTypeSchema.shape.body.partial() });
