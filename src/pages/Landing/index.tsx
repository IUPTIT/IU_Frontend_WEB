import BackgroundVideo from "../../components/LandingBackgroundVideo";
import HeroContent from "./components/HeroContent";
import AboutSection from "./components/AboutSection";
import AdvisorsSection from "./components/AdvisorsSection";
import BoardSection from "./components/BoardSection";
import LandingNavBar from "../../components/LandingNavBar";
import HeroCountdown from "./components/HeroCountdown";
import heroPhoto from "../../assets/DinhChan.png";
import "../../styles/landing.css";

function LandingPage() {
  return (
    <div className="landing-theme relative min-h-screen">
      {/* Video nền fixed — phủ toàn bộ trang, các section cuộn phía trên */}
      <BackgroundVideo />

      <div className="relative z-10">
        <LandingNavBar />

        <div className="flex min-h-[calc(100vh-90px)] flex-col">
          <section className="relative flex flex-1 items-center justify-center overflow-visible px-4 py-10 md:px-8">
            {/* Banner: một khối duy nhất chứa cả trái + phải, che hẳn background */}
            <div className="liquid-glass landing-card-solid relative mx-auto grid w-full max-w-6xl items-center gap-10 overflow-hidden rounded-[2.5rem] px-8 py-14 md:px-14 lg:grid-cols-[1fr_auto]">
              <HeroContent />
              <div className="relative hidden lg:block">
                {/* Quầng sáng gradient làm nền đỡ cho ảnh */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[110%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[70px]"
                  style={{ background: "radial-gradient(closest-side, #a855f7 0%, #6366f1 45%, transparent 100%)" }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-50 blur-[50px]"
                  style={{ background: "#fcd34d" }}
                  aria-hidden
                />
                <img
                  src={heroPhoto}
                  alt="Thành viên IU Club nhận giải Quán quân Web Data Showdown"
                  className="relative mx-auto w-full max-w-sm drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                />
                <div className="absolute -left-6 bottom-6">
                  <HeroCountdown />
                </div>
              </div>
            </div>
          </section>
        </div>

        <AboutSection />
        <AdvisorsSection />
        <BoardSection />
      </div>
    </div>
  );
}

export default LandingPage;
