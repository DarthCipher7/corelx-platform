import HeroSection from "@/components/sections/HeroSection";
import FeaturedCreators from "@/components/sections/FeaturedCreators";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CollabsSection from "@/components/sections/CollabsSection";
import CTASection from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedCreators />
      <ShowcaseSection />
      <CollabsSection />
      <CTASection />
    </>
  );
}
