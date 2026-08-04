import BackgroundVideo from "./components/BackgroundVideo";
import NavBar from "./components/NavBar";
import HeroContent from "./components/HeroContent";
import "./landing.css";

function LandingPage() {
  return (
    <div className="landing-theme relative min-h-screen overflow-hidden">
      <BackgroundVideo />

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />

        <section className="relative flex flex-1 items-center justify-center overflow-visible">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[527px] w-[984px] -translate-x-1/2 -translate-y-1/2 bg-gray-950 opacity-90 blur-[82px]" />
          <div className="relative">
            <HeroContent />
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
