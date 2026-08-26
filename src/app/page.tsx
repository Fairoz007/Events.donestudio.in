import { HeroBanner } from "@/components/home/HeroBanner";
import { UpcomingEventsSection } from "@/components/home/UpcomingEventsSection";
import { WhyJoinSection } from "@/components/home/WhyJoinSection";
import { PlatformStatsSection } from "@/components/home/PlatformStatsSection";
import { CreatorSpotlightSection } from "@/components/home/CreatorSpotlightSection";
import { FloralParticles } from "@/components/home/FloralParticles";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#080b0e] overflow-hidden">
      {/* Floating Kerala Marigold Petals */}
      <FloralParticles />

      {/* 1. Cinematic Onam 2026 Hero Banner (Image 3) */}
      <HeroBanner />

      {/* 2. Upcoming Events Grid with Badges & Avatars (Image 3) */}
      <UpcomingEventsSection />

      {/* 3. Why Join D-One Studio Events (Image 3) */}
      <WhyJoinSection />

      {/* 4. Creator Spotlight Hub */}
      <CreatorSpotlightSection />

      {/* 5. Platform Live Real-Time Stats */}
      <PlatformStatsSection />
    </div>
  );
}
