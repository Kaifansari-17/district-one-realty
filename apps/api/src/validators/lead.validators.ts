import { z } from "zod";
import { LeadPriority, LeadSource, LeadStatus } from "@prisma/client";

const phoneField = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number");

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    phone: phoneField,
    email: z.string().trim().toLowerCase().email().optional(),
    propertyId: z.string().optional(),
    projectId: z.string().optional(),
    message: z.string().trim().max(1000).optional(),
    source: z.nativeEnum(LeadSource).default(LeadSource.WEBSITE),
    // Honeypot — accept any value so a filled-in field never surfaces a validation error to a
    // bot; createInquiry() silently drops the submission when this is non-empty.
    website: z.string().optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    status: z.nativeEnum(LeadStatus).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
    agentId: z.string().nullable().optional(),
  }),
});

export const addLeadNoteSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1).max(2000),
  }),
});

export const leadListQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
    agentId: z.string().optional(),
    projectId: z.string().optional(),
    propertyId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});
