import BackgroundVideo from "../../components/LandingBackgroundVideo";
import HeroShowcase from "./components/HeroShowcase";
import { CountdownSection } from "./components/HeroCountdown";
import AboutSection from "./components/AboutSection";
import AdvisorsSection from "./components/AdvisorsSection";
import BoardSection from "./components/BoardSection";
import LandingNavBar from "../../components/LandingNavBar";
import LandingFooter from "../../components/LandingFooter";
import "../../styles/landing.css";
import { usePageMeta } from "../../hooks/usePageMeta";

function LandingPage() {
  usePageMeta(
    "IU Club (IU PTIT) — Câu lạc bộ CNTT UDU | Shine and Thrive",
    "IU Club (IUPTIT) là câu lạc bộ CNTT định hướng ứng dụng thuộc UDU, thành lập năm 2024. Môi trường Shine and Thrive giúp sinh viên sáng tạo, học hỏi và phát triển tối đa tiềm năng.",
    "/"
  );
  return (
    <div className="landing-theme relative min-h-screen">
      {/* Video nền fixed — phủ toàn bộ trang, các section cuộn phía trên */}
      <BackgroundVideo />

      <div className="relative z-10" style={{ zoom: 0.87 }}>
        <LandingNavBar />

        <div className="flex min-h-[calc(100vh-90px)] flex-col">
          <section className="relative flex flex-1 items-center justify-center overflow-visible px-4 py-6 md:px-8">
            {/* Banner: một khối duy nhất chứa cả trái + phải, che hẳn background */}
            <div className="liquid-glass glass-shine relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] px-8 py-11 md:px-12">
              <HeroShowcase />
            </div>
          </section>
        </div>

        <AboutSection />
        <AdvisorsSection />
        <BoardSection />

        {/* Khu vực đếm ngược đầy đủ — chỉ hiện khi đang mở đợt tuyển */}
        <CountdownSection />

        <LandingFooter />
      </div>
    </div>
  );
}

export default LandingPage;
