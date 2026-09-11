import { useParams } from "react-router-dom";
import { Phone, FileText } from "lucide-react";
import { formatIndianPrice } from "@district-one/shared-utils";
import { usePublicDetail } from "@/lib/usePublicData";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useJsonLd } from "@/lib/useJsonLd";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ImageGallery } from "@/components/property/ImageGallery";
import { PropertyMeta } from "@/components/property/PropertyMeta";
import { AmenityGrid } from "@/components/property/AmenityGrid";
import { PropertyCard } from "@/components/property/PropertyCard";
import { InquiryForm } from "@/components/common/InquiryForm";
import { SiteVisitForm } from "@/components/common/SiteVisitForm";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { EmptyState } from "@/components/common/EmptyState";
import type { PropertyDetail } from "@/types/api";
import { env } from "@/config/env";
import { buildTelLink } from "@district-one/shared-utils";

export function PropertyDetailPage() {
  const { slug } = useParams();
  const { data: property, isLoading, isError } = usePublicDetail<PropertyDetail>("property", "/properties", slug);

  useDocumentMeta(property?.metaTitle ?? property?.title, property?.metaDescription ?? property?.description ?? undefined);

  useJsonLd(
    "property",
    property
      ? {
          "@context": "https://schema.org",
          "@type": "Residence",
          name: property.title,
          description: property.description ?? undefined,
          url: `${env.siteUrl}/properties/${property.slug}`,
          image: property.images.map((img) => img.url),
          address: {
            "@type": "PostalAddress",
            addressLocality: property.location.name,
            addressRegion: "Maharashtra",
            addressCountry: "IN",
          },
          numberOfRooms: property.bedrooms ?? undefined,
          floorSize: property.carpetArea
            ? { "@type": "QuantitativeValue", value: property.carpetArea, unitCode: "FTK" }
            : undefined,
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }
      : null
  );

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-text-muted">Loading property...</div>;
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Property not found" message="This listing may have been removed or unpublished." />
      </div>
    );
  }

  const heading = property.bedrooms ? `${property.bedrooms} BHK in ${property.location.name}` : property.title;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
      />

      <div className="mt-4">
        <ImageGallery images={property.images} title={property.title} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="font-serif text-3xl text-navy">{heading}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                {property.location.name}
                {property.project && <> &middot; {property.project.name}</>}
                {property.builder && <> &middot; {property.builder.name}</>}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-navy">{formatIndianPrice(Number(property.price))}</p>
              {property.priceUnit === "PER_SQFT" && <p className="text-xs text-text-muted">Per Sq.ft.</p>}
            </div>
          </div>

          <div className="mt-6">
            <PropertyMeta property={property} />
          </div>

          {property.description && (
            <div className="mt-10">
              <h2 className="mb-3 font-serif text-xl text-navy">About This Property</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{property.description}</p>
            </div>
          )}

          {property.amenities.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Amenities</h2>
              <AmenityGrid amenities={property.amenities} />
            </div>
          )}

          {property.features.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Features</h2>
              <AmenityGrid amenities={property.features} />
            </div>
          )}

          {property.floorPlans.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Floor Plans</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {property.floorPlans.map((plan) => (
                  <img key={plan.id} src={plan.url} alt={plan.alt ?? "Floor plan"} loading="lazy" className="rounded-lg border border-border" />
                ))}
              </div>
            </div>
          )}

          {property.documents.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Documents</h2>
              <div className="flex flex-wrap gap-3">
                {property.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm text-navy hover:border-navy"
                  >
                    <FileText size={15} /> {doc.caption ?? "View Document"}
                  </a>
                ))}
              </div>
            </div>
          )}

          {(property.latitude || property.longitude) && (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Location</h2>
              <iframe
                title="Property location"
                className="h-72 w-full rounded-lg border border-border"
                loading="lazy"
                src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
              />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-border p-5">
              <p className="mb-3 text-sm font-medium text-navy">Interested in this property?</p>
              <div className="flex gap-3">
                <a
                  href={buildTelLink(env.contactPhone)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-navy py-3 text-sm font-medium text-white hover:bg-navy-secondary"
                >
                  <Phone size={15} /> Call
                </a>
                <WhatsAppButton propertyName={property.title} location={property.location.name} />
              </div>
            </div>

            <div className="rounded-xl border border-border p-5">
              <p className="mb-3 text-sm font-medium text-navy">Request a Callback</p>
              <InquiryForm source="PROPERTY" propertyId={property.id} compact />
            </div>

            <div className="rounded-xl border border-border p-5">
              <p className="mb-3 text-sm font-medium text-navy">Schedule a Site Visit</p>
              <SiteVisitForm propertyId={property.id} />
            </div>
          </div>
        </aside>
      </div>

      {property.similarProperties.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 font-serif text-2xl text-navy">Similar Properties</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {property.similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
