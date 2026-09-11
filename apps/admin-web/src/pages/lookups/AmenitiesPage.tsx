import { LookupCrudPage } from "@/pages/lookups/LookupCrudPage";

export function AmenitiesPage() {
  return (
    <LookupCrudPage
      title="Amenities"
      singularLabel="Amenity"
      basePath="/admin/amenities"
      resourceKey="amenities"
      fields={["icon", "description"]}
    />
  );
}
