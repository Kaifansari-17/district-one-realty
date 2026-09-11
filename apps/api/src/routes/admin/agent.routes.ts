import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as agentController from "@/controllers/admin/agent.controller";
import { createAgentSchema, updateAgentSchema } from "@/validators/agent.validators";

const router = Router();

// Agents cannot manage users at all (per spec) — this entire module is Admin/Super Admin only.
router.use(authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get("/", agentController.list);
router.get("/:id", agentController.getById);
router.get("/:id/assignments", agentController.getAssignments);
// Only a Super Admin creates new Admin/Agent accounts.
router.post("/", authorize(UserRole.SUPER_ADMIN), validate(createAgentSchema), agentController.create);
router.put("/:id", validate(updateAgentSchema), agentController.update);
router.patch("/:id/activate", agentController.activate);
router.patch("/:id/deactivate", agentController.deactivate);
router.post("/:id/reset-password", agentController.resetPassword);

export { router as agentAdminRoutes };
