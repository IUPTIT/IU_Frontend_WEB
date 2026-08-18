import { useEffect } from "react";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import StorySection from "./components/StorySection";
import ValuesSection from "./components/ValuesSection";
import JourneySection from "./components/JourneySection";
import MentorsSection from "./components/MentorsSection";
import ActivitiesSection from "./components/ActivitiesSection";
import NumbersSection from "./components/NumbersSection";
import HighlightsSection from "./components/HighlightsSection";
import AchievementsSection from "./components/AchievementsSection";
import NewsSection from "./components/NewsSection";
import FaqSection from "./components/FaqSection";
import FinalCtaSection from "./components/FinalCtaSection";
import "../../styles/landing.css";
import "../../styles/landing-home.css";

function LandingPage() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, []);

  return (
    <div className="landing-theme lp-home relative min-h-screen">
      <BackgroundVideo />
      <div className="lp-page-veil" />
      <div className="relative z-10">
        <LandingNavBar />
        <main id="main">
        <HeroSection />
        <AboutSection />
        <StorySection />
        <ValuesSection />
        <JourneySection />
        <MentorsSection />
        <ActivitiesSection />
        <NumbersSection />
        <HighlightsSection />
        <AchievementsSection />
        <NewsSection />
        <FaqSection />
        <FinalCtaSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}

export default LandingPage;
