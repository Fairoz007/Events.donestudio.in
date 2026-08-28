import { HeroBanner } from "@/components/home/HeroBanner";
import { ActivitiesShowcase } from "@/components/home/ActivitiesShowcase";
import { FloralParticles } from "@/components/home/FloralParticles";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#080b0e] overflow-hidden">
      <FloralParticles />
      <HeroBanner />
      <ActivitiesShowcase />
    </div>
  );
}
