import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { apiPublicUrl } from "@/config/env";
import type { MediaStorageProvider } from "@/services/storage/types";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

/**
 * Fallback used automatically when no Cloudinary credentials are configured (see
 * `services/storage/index.ts`) — writes uploads straight to disk under `apps/api/uploads/` and
 * serves them back via the `/uploads` static route registered in `app.ts`. Fine for local
 * development and small self-hosted deployments; swap in an S3-compatible provider the same way
 * this file wraps the filesystem, without touching `media.service.ts`.
 */
export const localStorage: MediaStorageProvider = {
  async upload(buffer, folder, mimetype) {
    const extension = EXTENSION_BY_MIME[mimetype] ?? "";
    const filename = `${crypto.randomUUID()}${extension}`;
    const relativePath = `${folder}/${filename}`;
    const absoluteDir = path.join(UPLOADS_ROOT, folder);

    await fs.mkdir(absoluteDir, { recursive: true });
    await fs.writeFile(path.join(absoluteDir, filename), buffer);

    return {
      url: `${apiPublicUrl}/uploads/${relativePath}`,
      publicId: relativePath,
      bytes: buffer.byteLength,
    };
  },

  async delete(publicId) {
    // publicId is the relative path under uploads/ produced by upload() above.
    await fs.unlink(path.join(UPLOADS_ROOT, publicId)).catch((err) => {
      if (err.code !== "ENOENT") throw err;
    });
  },
};
