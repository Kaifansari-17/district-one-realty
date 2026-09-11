import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Hero } from "@/components/home/Hero";
import { HandpickedResidences } from "@/components/home/HandpickedResidences";
import { DeveloperNetwork } from "@/components/home/DeveloperNetwork";
import { ExploreLocalities } from "@/components/home/ExploreLocalities";
import { TrustedBuilders } from "@/components/home/TrustedBuilders";
import { WhyDistrictOne } from "@/components/home/WhyDistrictOne";
import { CTASection } from "@/components/common/CTASection";

export function HomePage() {
  useDocumentMeta();

  return (
    <div>
      <Hero />
      <HandpickedResidences />
      <DeveloperNetwork />
      <ExploreLocalities />
      <TrustedBuilders />
      <WhyDistrictOne />
      <CTASection />
    </div>
  );
}
