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
<<<<<<< HEAD
import { usePageMeta } from "../../hooks/usePageMeta";

function LandingPage() {
  usePageMeta(
    "IU Club (IU PTIT) — Câu lạc bộ CNTT UDU | Shine and Thrive",
    "IU Club (IUPTIT) là câu lạc bộ CNTT định hướng ứng dụng thuộc UDU, thành lập năm 2024. Môi trường Shine and Thrive giúp sinh viên sáng tạo, học hỏi và phát triển tối đa tiềm năng.",
    "/"
  );
=======
import "../../styles/landing-home.css";

function LandingPage() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, []);

>>>>>>> 75e632fc91b6e6020967105ffc0c842c74b0d58d
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
