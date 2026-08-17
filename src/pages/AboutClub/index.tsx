import { useEffect } from "react";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import {
  AboutHero,
  BoardSection,
  ContinuitySection,
  FoundersSection,
  GenerationsSection,
  NextSection,
  OriginSection,
  PeopleSection,
  StructureSection,
} from "./sections";
import "../../styles/landing.css";
import "../../styles/landing-home.css";
import "../../styles/about-club.css";

function AboutClubPage() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    window.setTimeout(() => {
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "auto" });
    }, 40);
  }, []);

  return (
    <div className="landing-theme lp-home relative min-h-screen">
      <BackgroundVideo />
      <div className="lp-page-veil" />
      <div className="relative z-10">
        <LandingNavBar />
        <main id="main">
        <AboutHero />
        <OriginSection />
        <FoundersSection />
        <ContinuitySection />
        <BoardSection />
        <StructureSection />
        <GenerationsSection />
        <PeopleSection />
        <NextSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}

export default AboutClubPage;
