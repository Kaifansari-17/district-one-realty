export interface StorageUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface MediaStorageProvider {
  upload(buffer: Buffer, folder: string, mimetype: string, resourceType: "image" | "raw"): Promise<StorageUploadResult>;
  delete(publicId: string, resourceType: "image" | "raw"): Promise<void>;
}
