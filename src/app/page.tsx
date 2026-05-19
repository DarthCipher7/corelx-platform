import HeroSection from "@/components/sections/HeroSection";
import FeaturedCreators from "@/components/sections/FeaturedCreators";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CollabsSection from "@/components/sections/CollabsSection";
import CTASection from "@/components/sections/CTASection";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: postsCount },
    { count: followsCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("feed_posts").select("*", { count: "exact", head: true }),
    supabase.from("follows").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <HeroSection 
        usersCount={usersCount || 0}
        postsCount={postsCount || 0}
        followsCount={followsCount || 0}
      />
      <FeaturesSection />
      <FeaturedCreators />
      <ShowcaseSection />
      <CollabsSection />
      <CTASection />
    </>
  );
}
