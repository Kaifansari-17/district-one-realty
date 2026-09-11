import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { WhyDistrictOne } from "@/components/home/WhyDistrictOne";
import { CTASection } from "@/components/common/CTASection";

export function AboutPage() {
  useDocumentMeta("About Us", "Learn about District One Realty, a real estate consultancy serving Navi Mumbai.");

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Breadcrumbs items={[{ label: "About" }]} />

        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">About Us</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-navy md:text-5xl">District One Realty</h1>
            <p className="mt-6 text-sm leading-relaxed text-text-secondary">
              District One Realty is a real estate consultancy helping customers discover exceptional residential
              and commercial properties across Navi Mumbai. We work closely with trusted developers to bring
              verified, well-documented listings to homebuyers and investors.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Our approach is straightforward: transparent pricing, verified listings, and guidance at every step
              — from your first site visit to closing the deal.
            </p>

            <div className="mt-8 rounded-xl border border-border p-6">
              <p className="font-serif text-lg text-navy">Affan Shaikh</p>
              <p className="text-sm text-gold">Real Estate Consultant</p>
              <p className="mt-3 text-sm text-text-secondary">Navi Mumbai, Maharashtra, India</p>
            </div>
          </div>

          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-grey-light">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop"
              alt="Navi Mumbai skyline"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="bg-warm-white">
        <WhyDistrictOne />
      </div>

      <CTASection />
    </div>
  );
}
