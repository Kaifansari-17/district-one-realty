export interface PropertyFilterQuery {
  page?: number;
  limit?: number;
  sort?: "latest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
  purpose?: string;
  location?: string;
  builder?: string;
  project?: string;
  propertyType?: string;
  category?: string;
  bhk?: number | number[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  possession?: string;
  amenities?: string[];
  rera?: boolean;
  furnishing?: string;
  status?: string;
  q?: string;
  featured?: boolean;
}

export interface HomeSearchQuery {
  purpose?: string;
  location?: string;
  builder?: string;
  project?: string;
  propertyType?: string;
  minBudget?: number;
  maxBudget?: number;
}
