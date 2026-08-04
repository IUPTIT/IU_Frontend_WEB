import { useEffect, useState } from "react";
import { BOARD_MEMBERS, CURRENT_TERM } from "../mockData";
import type { BoardMember } from "../mockData";

const AUTO_MS = 5000;

// Số card hiển thị cùng lúc theo breakpoint (khớp class w-full sm:w-1/2 lg:w-1/3)
function visibleCount() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase();
}

function MemberCard({ member }: { member: BoardMember }) {
  return (
    <div className="liquid-glass landing-card-solid landing-card-hover h-full rounded-3xl p-6 text-center">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div
          className="landing-display mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold text-white"
          style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          aria-hidden
        >
          {initials(member.name)}
        </div>
      )}
      <h3 className="landing-headline mt-4 text-lg font-semibold text-[hsl(var(--landing-foreground))]">
        {member.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-purple-300">{member.role}</p>
      {member.team && <p className="mt-0.5 text-sm text-[hsl(var(--landing-foreground)/0.6)]">{member.team}</p>}
    </div>
  );
}

function ArrowButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Người trước" : "Người sau"}
      className="landing-btn-secondary liquid-glass h-11 w-11 shrink-0 rounded-full disabled:cursor-default disabled:opacity-30"
    >
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        {direction === "prev" ? (
          <path d="m12 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m8 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function BoardSection() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(visibleCount);

  useEffect(() => {
    const handleResize = () => setVisible(visibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = BOARD_MEMBERS.length;
  const canSlide = total > visible;
  // Clone các card đầu nối vào cuối để trượt xoay vòng liền mạch
  const items = canSlide ? [...BOARD_MEMBERS, ...BOARD_MEMBERS.slice(0, visible)] : BOARD_MEMBERS;

  // Về vị trí đầu khi đổi breakpoint
  useEffect(() => {
    setAnimate(false);
    setIndex(0);
  }, [visible]);

  useEffect(() => {
    if (!animate) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(raf);
    }
  }, [animate]);

  const next = () => setIndex((i) => (i >= total ? i : i + 1));

  const prev = () =>
    setIndex((i) => {
      if (i > 0) return i - 1;
      // Đang ở đầu: nhảy ngầm (không animation) tới bản clone rồi trượt về
      setAnimate(false);
      window.setTimeout(() => setIndex(total - 1), 30);
      return total;
    });

  // Trượt xong tới dải clone thì nhảy ngầm về vị trí thật tương ứng
  const handleTransitionEnd = () => {
    if (index >= total) {
      setAnimate(false);
      setIndex(index - total);
    }
  };

  // Tự chuyển sau 5s, xoay vòng; dừng khi hover
  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSlide, paused, total]);

  return (
    <section id="ban-dieu-hanh" className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
      <div className="text-center">
        <p className="landing-headline text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
          Ban điều hành
        </p>
        <h2 className="landing-headline mt-3 text-4xl font-semibold text-[hsl(var(--landing-foreground))] md:text-5xl">
          Đội ngũ{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, #6366f1, #a855f7, #fcd34d)" }}
          >
            điều hành
          </span>
        </h2>
        <p className="mt-4 text-[hsl(var(--landing-foreground)/0.6)]">{CURRENT_TERM}</p>
      </div>

      <div
        className="mt-14 flex items-center gap-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <ArrowButton direction="prev" onClick={prev} disabled={!canSlide} />

        {/* py tạo chỗ cho card scale khi hover mà không bị overflow-hidden cắt */}
        <div className="-my-6 flex-1 overflow-hidden py-6">
          <div
            className="flex"
            style={{
              transform: `translateX(-${index * (100 / visible)}%)`,
              transition: animate ? "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
              willChange: "transform",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {items.map((member, i) => (
              <div key={`${member.name}-${i}`} className="w-full shrink-0 px-3 sm:w-1/2 lg:w-1/3">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>

        <ArrowButton direction="next" onClick={next} disabled={!canSlide} />
      </div>
    </section>
  );
}

export default BoardSection;
