import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import HeroCountdown from "./HeroCountdown";

// Một font tech (mono, có hỗ trợ tiếng Việt) cho hiệu ứng gõ máy
const TECH_FONT = "'JetBrains Mono', 'Space Grotesk', monospace";

// title = chữ gõ máy bên trái; image = ảnh (để trống, fill sau bằng cách thêm src)
type Slide = { title: string; image?: string };
const SLIDES: Slide[] = [
  { title: "Hoạt động vui chơi của thành viên" },
  { title: "Quán quân Web Data Showdown" },
  { title: "Training & Mentoring xuyên suốt" },
  { title: "Kết nạp thành viên mới" },
  { title: "Dự án & sản phẩm công nghệ" },
];

const INTERVAL = 3800;

// Gõ máy: hiện dần từng ký tự theo kiểu terminal
function useTypewriter(text: string, speed = 52) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return count;
}

function AnimatedHeadline({ text }: { text: string }) {
  const count = useTypewriter(text);
  const done = count >= text.length;
  return (
    <p className="hero-headline" style={{ fontFamily: TECH_FONT }} aria-label={text}>
      <span className="hero-typed">{text.slice(0, count) || "​"}</span>
      <span className={`hero-caret ${done ? "is-blink" : ""}`} aria-hidden />
    </p>
  );
}

function FanDeck({ active }: { active: number }) {
  const n = SLIDES.length;
  return (
    <div className="fan-deck" aria-hidden>
      {SLIDES.map((slide, i) => {
        // offset vòng tròn quanh card đang chọn → xòe đối xứng, đảo chỗ mượt
        let off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        const isActive = off === 0;
        const rot = off * 8;
        const tx = off * 48;
        const ty = Math.abs(off) * 16 + (isActive ? -8 : 10);
        const scale = isActive ? 1.1 : 1 - Math.abs(off) * 0.08;
        const z = 50 - Math.abs(off) * 10;
        return (
          <div
            key={i}
            className={`fan-card ${isActive ? "is-active" : ""}`}
            style={{
              transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
              zIndex: z,
            }}
          >
            {slide.image ? (
              <img src={slide.image} alt="" className="fan-card-img" />
            ) : (
              <div className="fan-card-ph">
                <ImageIcon size={26} strokeWidth={1.5} />
                <span>Ảnh cập nhật sau</span>
              </div>
            )}
            <div className="fan-card-cap">{slide.title}</div>
          </div>
        );
      })}
    </div>
  );
}

function HeroShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((v) => (v + 1) % SLIDES.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
        {/* Tên CLB to — nhận diện thương hiệu */}
        <h1 className="hero-brand">IU CLUB</h1>

        {/* Tagline gõ máy, ô chữ fix cứng để không nhảy layout */}
        <div className="hero-headline-box mt-2 w-full">
          <AnimatedHeadline key={active} text={SLIDES[active].title} />
        </div>

        <div className="hero-sub-wrap mt-4">
          <p
            className="hero-sub text-lg font-medium leading-snug tracking-[-0.01em] text-[hsl(var(--landing-foreground))] md:text-xl"
            style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
          >
            Kết nối{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to right, #a855f7, #E0348C)" }}
            >
              đam mê
            </span>
            , kiến tạo{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to right, #E0348C, #6366f1)" }}
            >
              tương lai
            </span>
          </p>
          <span className="hero-sparkle hero-sparkle-a" aria-hidden />
          <span className="hero-sparkle hero-sparkle-b" aria-hidden />
          <span className="hero-sparkle hero-sparkle-c" aria-hidden />
        </div>

        <button className="landing-btn-secondary liquid-glass mt-6 px-6 py-3 text-sm">
          Xem tin mới nhất
        </button>
      </div>

      <div className="hidden flex-col items-center gap-5 lg:flex">
        <div className="relative w-full">
          <div className="fan-glow" aria-hidden />
          <FanDeck active={active} />
        </div>
        <HeroCountdown />
      </div>
    </div>
  );
}

export default HeroShowcase;
