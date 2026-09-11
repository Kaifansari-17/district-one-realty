export type EntityId = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  /** The Media row's own id — this, not `publicId` (the Cloudinary asset id), is what admin APIs expect in the URL for delete/reorder/set-primary. */
  id: string;
  url: string;
  publicId: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "FLOOR_PLAN" | "BROCHURE";
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
}

export interface GeoPoint {
  latitude?: number;
  longitude?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]> | string[] | null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
