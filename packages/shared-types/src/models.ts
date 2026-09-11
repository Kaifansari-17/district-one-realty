import {
  UserRole,
  PublishStatus,
  PropertyStatus,
  FurnishingType,
  FacingDirection,
  LeadSource,
  LeadStatus,
  LeadPriority,
  SiteVisitStatus,
} from "./enums";
import { EntityId, Timestamps, MediaAsset, SeoFields, GeoPoint } from "./common";

export interface Country extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
}

export interface State extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  countryId: EntityId;
}

export interface City extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  stateId: EntityId;
}

export interface Location extends Timestamps, SeoFields, GeoPoint {
  id: EntityId;
  name: string;
  slug: string;
  cityId: EntityId;
  description?: string;
  image?: MediaAsset;
  pincode?: string;
  propertyCount?: number;
  isActive: boolean;
}

export interface Builder extends Timestamps, SeoFields {
  id: EntityId;
  name: string;
  slug: string;
  logo?: MediaAsset;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  establishedYear?: number;
  isActive: boolean;
}

export interface Amenity extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

export interface Feature extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
}

export interface PropertyType extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  category: "RESIDENTIAL" | "COMMERCIAL";
  isActive: boolean;
}

export interface PropertyCategory extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Purpose extends Timestamps {
  id: EntityId;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Project extends Timestamps, SeoFields, GeoPoint {
  id: EntityId;
  name: string;
  slug: string;
  builderId: EntityId | Builder;
  locationId: EntityId | Location;
  status: PropertyStatus;
  description?: string;
  reraNumber?: string;
  launchDate?: string;
  possessionDate?: string;
  startingPrice?: number;
  configurations?: string[];
  totalTowers?: number;
  totalFloors?: number;
  totalUnits?: number;
  brochure?: MediaAsset;
  masterPlan?: MediaAsset;
  gallery: MediaAsset[];
  amenities: EntityId[] | Amenity[];
  assignedAgents: EntityId[] | Agent[];
  isFeatured: boolean;
  isPublished: boolean;
}

export interface Property extends Timestamps, SeoFields, GeoPoint {
  id: EntityId;
  title: string;
  slug: string;
  projectId?: EntityId | Project | null;
  builderId?: EntityId | Builder | null;
  locationId: EntityId | Location;
  propertyTypeId: EntityId | PropertyType;
  categoryId: EntityId | PropertyCategory;
  purposeId: EntityId | Purpose;
  description?: string;
  price: number;
  priceUnit?: "TOTAL" | "PER_SQFT";
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floorNumber?: number;
  totalFloors?: number;
  parking?: number;
  facing?: FacingDirection;
  furnishing?: FurnishingType;
  propertyAge?: number;
  possessionDate?: string;
  reraNumber?: string;
  status: PropertyStatus;
  publishStatus: PublishStatus;
  featured: boolean;
  verified: boolean;
  images: MediaAsset[];
  videos: MediaAsset[];
  floorPlans: MediaAsset[];
  documents: MediaAsset[];
  amenities: EntityId[] | Amenity[];
  features: EntityId[] | Feature[];
  assignedAgents: EntityId[] | Agent[];
}

export interface User extends Timestamps {
  id: EntityId;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  photo?: MediaAsset;
  designation?: string;
  bio?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export type Agent = User;

export interface Lead extends Timestamps {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  propertyId?: EntityId | Property | null;
  projectId?: EntityId | Project | null;
  agentId?: EntityId | Agent | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  message?: string;
  notes: LeadNote[];
}

export interface LeadNote {
  text: string;
  createdBy: EntityId;
  createdAt: string;
}

export interface SiteVisit extends Timestamps {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  propertyId?: EntityId | Property | null;
  projectId?: EntityId | Project | null;
  agentId?: EntityId | Agent | null;
  leadId?: EntityId | Lead | null;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: SiteVisitStatus;
}

export interface Blog extends Timestamps, SeoFields {
  id: EntityId;
  title: string;
  slug: string;
  featuredImage?: MediaAsset;
  excerpt?: string;
  content: string;
  authorId: EntityId | User;
  isPublished: boolean;
  publishedAt?: string;
}

export interface ContactMessage extends Timestamps {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  message: string;
  isRead: boolean;
}

export interface ActivityLog extends Timestamps {
  id: EntityId;
  userId: EntityId | User;
  action: string;
  entity: string;
  entityId?: EntityId;
  metadata?: Record<string, unknown>;
}
