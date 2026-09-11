import type { MediaAsset } from "@district-one/shared-types";

export interface LocationSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: MediaAsset | null;
  city: string;
  state: string;
  country?: string;
  propertyCount: number;
}

export interface Builder {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logo?: MediaAsset | null;
}

export interface PropertyType {
  id: string;
  name: string;
  slug: string;
  category: "RESIDENTIAL" | "COMMERCIAL";
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Feature {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  price: string | number;
  priceUnit: "TOTAL" | "PER_SQFT";
  carpetArea?: number | null;
  bedrooms?: number | null;
  status: string;
  possessionDate?: string | null;
  location: { id: string; name: string; slug: string; city?: { name: string } };
  builder?: { id: string; name: string; slug: string } | null;
  project?: { id: string; name: string; slug: string } | null;
  propertyType: PropertyType;
  primaryImage?: MediaAsset | null;
}

export interface PropertyDetail extends PropertyListItem {
  description?: string | null;
  bathrooms?: number | null;
  balconies?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  parking?: number | null;
  facing?: string | null;
  furnishing?: string | null;
  propertyAge?: number | null;
  reraNumber?: string | null;
  builtUpArea?: number | null;
  superBuiltUpArea?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  amenities: Amenity[];
  features: Feature[];
  images: MediaAsset[];
  videos: MediaAsset[];
  floorPlans: MediaAsset[];
  documents: MediaAsset[];
  similarProperties: PropertyListItem[];
}

export interface ProjectListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  startingPrice?: string | number | null;
  configurations?: string[] | null;
  possessionDate?: string | null;
  location: { id: string; name: string; slug: string };
  builder: Builder;
  primaryImage?: MediaAsset | null;
}

export interface ProjectDetail extends ProjectListItem {
  description?: string | null;
  reraNumber?: string | null;
  launchDate?: string | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  totalUnits?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  amenities: Amenity[];
  gallery: MediaAsset[];
  brochure?: MediaAsset | null;
  masterPlan?: MediaAsset | null;
  availableUnits: PropertyListItem[];
}

export interface LocationDetail extends LocationSummary {
  metaTitle?: string | null;
  metaDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  projects: ProjectListItem[];
  builders: Builder[];
  popularConfigurations: { bedrooms: number | null; count: number }[];
}

export interface BuilderDetail extends Builder {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  establishedYear?: number | null;
  projects: ProjectListItem[];
  propertyCount: number;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: MediaAsset | null;
  publishedAt?: string | null;
  author: { name: string };
}

export interface BlogDetail extends BlogListItem {
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
