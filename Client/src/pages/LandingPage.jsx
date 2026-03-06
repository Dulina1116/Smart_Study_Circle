import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import LiveCircles from "../components/LiveCircles";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LiveCircles />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
