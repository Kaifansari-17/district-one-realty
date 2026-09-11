import path from "node:path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";
import pinoHttp from "pino-http";
import { isAllowedOrigin, isDevelopment, useLocalMediaStorage } from "@/config/env";
import { logger } from "@/utils/logger";
import { apiLimiter } from "@/middlewares/rateLimiters";
import { apiRouter } from "@/routes";
import { generateSitemapXml } from "@/services/sitemap.service";
import { notFoundHandler } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // `callback(null, false)` — not an Error — so a disallowed origin quietly gets no
        // Access-Control-Allow-Origin header (the browser blocks the response client-side) and
        // a normal 2xx locally, instead of surfacing as a 500 that looks like a server bug and
        // pollutes error logs every time a bot or scanner probes from a random origin.
        callback(null, !origin || isAllowedOrigin(origin));
      },
      credentials: true,
    })
  );

  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use(hpp());

  if (isDevelopment) {
    app.use(morgan("dev"));
  } else {
    app.use(pinoHttp({ logger }));
  }

  // Only mounted when Cloudinary isn't configured — see services/storage/. Cloudinary-hosted
  // files never touch this server, so there's nothing to serve when it's actually in use.
  if (useLocalMediaStorage) {
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  }

  // Sitemap data is dynamic (published properties/projects/etc.), so it's generated here rather
  // than as a static file. Conventionally served from the public site's own domain root
  // (www.districtonerealty.com/sitemap.xml) — in production, point that path at this API route
  // via a reverse proxy / CDN rewrite rule (documented in the README).
  app.get("/sitemap.xml", async (_req, res, next) => {
    try {
      const xml = await generateSitemapXml();
      res.type("application/xml").send(xml);
    } catch (err) {
      next(err);
    }
  });

  app.use("/api", apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
