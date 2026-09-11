import { Router } from "express";
import { authRoutes } from "@/routes/auth.routes";
import { propertyPublicRoutes } from "@/routes/public/property.routes";
import { projectPublicRoutes } from "@/routes/public/project.routes";
import { builderPublicRoutes } from "@/routes/public/builder.routes";
import { locationPublicRoutes } from "@/routes/public/location.routes";
import { metaRoutes } from "@/routes/public/meta.routes";
import { inquiryRoutes } from "@/routes/public/inquiry.routes";
import { siteVisitPublicRoutes } from "@/routes/public/siteVisit.routes";
import { contactRoutes } from "@/routes/public/contact.routes";
import { blogPublicRoutes } from "@/routes/public/blog.routes";
import { adminRoutes } from "@/routes/admin";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

router.use("/auth", authRoutes);

router.use("/properties", propertyPublicRoutes);
router.use("/projects", projectPublicRoutes);
router.use("/builders", builderPublicRoutes);
router.use("/locations", locationPublicRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/site-visits", siteVisitPublicRoutes);
router.use("/contact", contactRoutes);
router.use("/blog", blogPublicRoutes);
router.use("/", metaRoutes); // /amenities, /features, /property-types, /property-categories, /purposes

router.use("/admin", adminRoutes);

export { router as apiRouter };
