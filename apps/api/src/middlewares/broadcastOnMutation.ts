import type { NextFunction, Request, Response } from "express";
import { broadcastResourceChange } from "@/realtime/adminSocket";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * After any successful write under /api/admin/<resource>/..., tells connected Admin Web clients
 * that `<resource>` changed so they can invalidate and refetch immediately — see
 * realtime/adminSocket.ts. Generic by design: every admin page's `useCrudResource(basePath,
 * resourceKey)` already uses `resourceKey` equal to the first path segment after `/admin/`, so
 * this needs no per-resource wiring and automatically covers new admin resources too.
 */
export function broadcastOnMutation(req: Request, res: Response, next: NextFunction): void {
  if (MUTATING_METHODS.has(req.method)) {
    // Captured now, synchronously, rather than read from `req` inside the "finish" listener:
    // Express mutates req.path/req.url in place as the request descends into nested routers
    // (e.g. lookups.routes.ts's own sub-routing for /amenities, /features, ...), and by the
    // time "finish" fires it no longer reflects this router's view of the path.
    const [resource] = req.path.replace(/^\/+/, "").split("/");
    res.on("finish", () => {
      if (resource && res.statusCode >= 200 && res.statusCode < 300) {
        broadcastResourceChange(resource);
      }
    });
  }
  next();
}
