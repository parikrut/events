import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import {
  HeroSection,
  CustomSolutionsSection,
  RSVPSection,
  PicasaurSection,
  CTASection
} from "@/components/sections/home-sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <CustomSolutionsSection />
      <RSVPSection />
      <PicasaurSection />
      <CTASection />
      <Footer />
    </div>
  );
}
