import type { NextFunction, Request, Response } from "express";

/**
 * Sets a public Cache-Control header for read-mostly public endpoints (lookup lists, builder/
 * location directories). `stale-while-revalidate` lets a CDN/browser serve a slightly stale
 * response instantly while refetching in the background, so an admin edit doesn't need to wait
 * out the full maxAge before anyone sees it reflected.
 */
export function cacheControl(maxAgeSeconds: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`);
    next();
  };
}
