import { TopNavBar } from "@/components/features/landing/TopNavBar";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { FeaturesSection } from "@/components/features/landing/FeaturesSection";
import { Footer } from "@/components/features/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative">
      <TopNavBar />
      <div className="pt-16 flex-grow">
        <HeroSection />
        <FeaturesSection />
      </div>
      <Footer />
    </main>
  );
}
