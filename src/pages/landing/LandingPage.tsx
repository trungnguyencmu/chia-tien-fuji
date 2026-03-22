import { LandingNavbar } from './landing-navbar';
import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { HowItWorksSection } from './how-it-works-section';
import { AppPreviewSection } from './app-preview-section';
import { TestimonialsSection } from './testimonials-section';
import { CtaSection } from './cta-section';
import { LandingFooter } from './landing-footer';
import './landing-page.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AppPreviewSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
