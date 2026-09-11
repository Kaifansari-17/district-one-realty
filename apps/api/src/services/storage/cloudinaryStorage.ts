import { cloudinary } from "@/config/cloudinary";
import { ApiError } from "@/utils/ApiError";
import type { MediaStorageProvider, StorageUploadResult } from "@/services/storage/types";

function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "raw"): Promise<StorageUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `district-one-realty/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.internal(error?.message ?? "Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

export const cloudinaryStorage: MediaStorageProvider = {
  upload: (buffer, folder, _mimetype, resourceType) => uploadBuffer(buffer, folder, resourceType),
  delete: async (publicId, resourceType) => {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },
};
