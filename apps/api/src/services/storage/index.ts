import { uploadsDir, useLocalMediaStorage } from "@/config/env";
import { logger } from "@/utils/logger";
import { cloudinaryStorage } from "@/services/storage/cloudinaryStorage";
import { localStorage } from "@/services/storage/localStorage";
import type { MediaStorageProvider } from "@/services/storage/types";

if (useLocalMediaStorage) {
  logger.warn(
    `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are not fully configured — falling back to local disk storage ` +
      `under ${uploadsDir}. Set all three Cloudinary env vars to use Cloudinary instead.`
  );
}

export const mediaStorage: MediaStorageProvider = useLocalMediaStorage ? localStorage : cloudinaryStorage;
