import { z } from "zod";

export const contactMessageSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
    email: z.string().trim().toLowerCase().email().optional(),
    message: z.string().trim().min(5).max(2000),
    // Honeypot — accept any value so a filled-in field never surfaces a validation error to a
    // bot; createContactMessage() silently drops the submission when this is non-empty.
    website: z.string().optional(),
  }),
});
