import { LookupCrudPage } from "@/pages/lookups/LookupCrudPage";

export function FeaturesPage() {
  return <LookupCrudPage title="Features" singularLabel="Feature" basePath="/admin/features" resourceKey="features" fields={["icon"]} />;
}
