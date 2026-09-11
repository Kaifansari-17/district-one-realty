import multer from "multer";
import { ApiError } from "@/utils/ApiError";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const DOCUMENT_MIME_TYPES = new Set(["application/pdf", ...IMAGE_MIME_TYPES]);

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only JPG, JPEG, PNG, and WEBP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!DOCUMENT_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only PDF, JPG, JPEG, PNG, and WEBP files are allowed"));
      return;
    }
    cb(null, true);
  },
});
