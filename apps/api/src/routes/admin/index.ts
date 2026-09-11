import { Router } from "express";
import { lookupsAdminRoutes } from "@/routes/admin/lookups.routes";
import { locationAdminRoutes } from "@/routes/admin/location.routes";
import { builderAdminRoutes } from "@/routes/admin/builder.routes";
import { propertyAdminRoutes } from "@/routes/admin/property.routes";
import { projectAdminRoutes } from "@/routes/admin/project.routes";
import { agentAdminRoutes } from "@/routes/admin/agent.routes";
import { leadAdminRoutes } from "@/routes/admin/lead.routes";
import { siteVisitAdminRoutes } from "@/routes/admin/siteVisit.routes";
import { blogAdminRoutes } from "@/routes/admin/blog.routes";
import { messageAdminRoutes } from "@/routes/admin/message.routes";
import { dashboardAdminRoutes } from "@/routes/admin/dashboard.routes";
import { activityLogAdminRoutes } from "@/routes/admin/activityLog.routes";

const router = Router();

router.use("/dashboard", dashboardAdminRoutes);
router.use("/properties", propertyAdminRoutes);
router.use("/projects", projectAdminRoutes);
router.use("/builders", builderAdminRoutes);
router.use(locationAdminRoutes); // mounts its own /locations, /cities, /countries, /states sub-paths
router.use(lookupsAdminRoutes); // mounts /amenities, /features, /property-types, /property-categories, /purposes
router.use("/agents", agentAdminRoutes);
router.use("/leads", leadAdminRoutes);
router.use("/site-visits", siteVisitAdminRoutes);
router.use("/blogs", blogAdminRoutes);
router.use("/messages", messageAdminRoutes);
router.use("/activity-logs", activityLogAdminRoutes);

export { router as adminRoutes };
