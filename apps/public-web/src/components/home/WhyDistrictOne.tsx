import { ShieldCheck, Handshake, Users, MapPinned, FileCheck2, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/common/FadeIn";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";

const REASONS = [
  { icon: ShieldCheck, title: "Verified Properties", description: "Every listing is reviewed before it reaches you." },
  { icon: Handshake, title: "Trusted Developers", description: "We work only with reputable development partners." },
  { icon: Users, title: "Expert Guidance", description: "Personal guidance at every step of your search." },
  { icon: MapPinned, title: "Site Visit Assistance", description: "We coordinate and accompany your property visits." },
  { icon: FileCheck2, title: "Transparent Deals", description: "Clear pricing and documentation, no hidden surprises." },
  { icon: TrendingUp, title: "Investment Support", description: "Guidance for both end-use and investment decisions." },
];

export function WhyDistrictOne() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <FadeIn>
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl text-navy md:text-4xl">Why District One Realty</h2>
        </div>
      </FadeIn>

      <StaggerGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason) => (
          <StaggerItem key={reason.title}>
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft/50 text-navy">
                <reason.icon size={20} />
              </div>
              <div>
                <h3 className="font-medium text-navy">{reason.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{reason.description}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
