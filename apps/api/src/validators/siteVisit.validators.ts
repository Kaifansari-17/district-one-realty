import { z } from "zod";
import { SiteVisitStatus } from "@prisma/client";

export const createSiteVisitSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
    email: z.string().trim().toLowerCase().email().optional(),
    propertyId: z.string().optional(),
    projectId: z.string().optional(),
    preferredDate: z.string().datetime(),
    preferredTime: z.string().trim().min(1).max(20),
    message: z.string().trim().max(1000).optional(),
    // Honeypot — accept any value so a filled-in field never surfaces a validation error to a
    // bot; createSiteVisit() silently drops the submission when this is non-empty.
    website: z.string().optional(),
  }),
});

export const updateSiteVisitSchema = z.object({
  body: z.object({
    status: z.nativeEnum(SiteVisitStatus).optional(),
    agentId: z.string().nullable().optional(),
    preferredDate: z.string().datetime().optional(),
    preferredTime: z.string().trim().min(1).max(20).optional(),
  }),
});

export const siteVisitListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.nativeEnum(SiteVisitStatus).optional(),
    agentId: z.string().optional(),
  }),
});
