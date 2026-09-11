import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createAgentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().max(20).optional(),
    designation: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(1000).optional(),
    role: z.nativeEnum(UserRole).default(UserRole.AGENT),
    // Optional — if omitted, a random password is generated and returned once in the response.
    password: z.string().min(8).optional(),
  }),
});

export const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(20).optional(),
    designation: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const assignAgentsSchema = z.object({
  body: z.object({
    agentIds: z.array(z.string()).default([]),
  }),
});
