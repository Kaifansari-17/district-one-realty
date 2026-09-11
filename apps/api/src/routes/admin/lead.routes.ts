import { Router } from "express";
import { authenticate } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import * as leadController from "@/controllers/admin/lead.controller";
import { addLeadNoteSchema, leadListQuerySchema, updateLeadSchema } from "@/validators/lead.validators";

const router = Router();
router.use(authenticate);

router.get("/", validate(leadListQuerySchema), leadController.list);
router.get("/:id", leadController.getById);
router.put("/:id", validate(updateLeadSchema), leadController.update);
router.post("/:id/notes", validate(addLeadNoteSchema), leadController.addNote);

export { router as leadAdminRoutes };
