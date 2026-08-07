import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { getActiveCampaign } from "../../../services/publicRecruitmentService";
import type { PublicCampaign } from "../../../services/publicRecruitmentService";

type Breakdown = { days: number; hours: number; minutes: number; seconds: number };
type CountdownState =
  | { kind: "loading" }
  | { kind: "none" } // không có đợt nào
  | { kind: "ended" } // đã đóng đơn
  | ({ kind: "before" } & Breakdown) // đếm ngược đến khi MỞ
  | ({ kind: "running" } & Breakdown); // đếm ngược đến khi ĐÓNG

type Active = Extract<CountdownState, { kind: "before" | "running" }>;

function breakdown(diff: number): Breakdown {
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function computeState(campaign: PublicCampaign | null): CountdownState {
  if (!campaign) return { kind: "none" };
  const now = Date.now();
  const open = new Date(campaign.openAt).getTime();
  const close = new Date(campaign.closeAt).getTime();
  // Trước giờ mở → đếm ngược đến khi MỞ (vẫn có dữ liệu, không để trống)
  if (Number.isFinite(open) && now < open) {
    return { kind: "before", ...breakdown(open - now) };
  }
  // Đã qua giờ đóng (hoặc dữ liệu lỗi) → kết thúc
  if (!Number.isFinite(close) || now >= close) return { kind: "ended" };
  return { kind: "running", ...breakdown(close - now) };
}

// Text & độ khẩn theo số ngày còn lại tới hạn ĐÓNG
function phaseInfo(days: number): {
  tier: "open" | "soon" | "final";
  title: string;
  hurry: string;
} {
  if (days === 0)
    return { tier: "final", title: "Giờ chót — chốt sổ hôm nay", hurry: "24h cuối!" };
  if (days <= 2)
    return { tier: "soon", title: "Sắp hết hạn rồi", hurry: "đừng bỏ lỡ!" };
  if (days <= 7) return { tier: "soon", title: "Sắp đóng đơn", hurry: "nhanh tay!" };
  return { tier: "open", title: "Cổng đăng ký đang mở", hurry: "tham gia ngay" };
}

function useCountdown() {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [state, setState] = useState<CountdownState>({ kind: "loading" });

  useEffect(() => {
    getActiveCampaign()
      .then((c) => {
        setCampaign(c);
        setState(computeState(c));
      })
      .catch(() => setState({ kind: "none" }));
  }, []);

  useEffect(() => {
    if (state.kind === "loading") return;
    const timer = window.setInterval(() => setState(computeState(campaign)), 1000);
    return () => window.clearInterval(timer);
  }, [campaign, state.kind]);

  // DEV preview: ?cd=<ngày> (đang mở) · ?cdb=<ngày> (sắp mở)
  const params = import.meta.env.DEV
    ? new URLSearchParams(window.location.search)
    : null;
  const cd = params?.get("cd");
  const cdb = params?.get("cdb");
  let shown: CountdownState = state;
  if (cd != null) shown = { kind: "running", days: Number(cd), hours: 6, minutes: 42, seconds: 30 };
  else if (cdb != null) shown = { kind: "before", days: Number(cdb), hours: 6, minutes: 42, seconds: 30 };

  return { campaign, state: shown };
}

function TimeBox({ value, unit, pop }: { value: number; unit: string; pop?: boolean }) {
  const text = String(Math.max(0, value)).padStart(2, "0");
  return (
    <div className="flash-box">
      <span key={pop ? text : undefined} className={pop ? "flash-num flash-pop" : "flash-num"}>
        {text}
      </span>
      <span className="flash-unit">{unit}</span>
    </div>
  );
}

function CountdownCard({
  state,
  campaign,
  variant,
}: {
  state: Active;
  campaign: PublicCampaign | null;
  variant: "compact" | "full";
}) {
  const isBefore = state.kind === "before";
  const info = isBefore
    ? { tier: "open" as const, title: "Sắp mở đăng ký", hurry: "chuẩn bị nhé!" }
    : phaseInfo(state.days);
  const full = variant === "full";
  const progressPct =
    !isBefore && campaign
      ? Math.min(
          100,
          Math.max(
            0,
            ((Date.now() - new Date(campaign.openAt).getTime()) /
              (new Date(campaign.closeAt).getTime() -
                new Date(campaign.openAt).getTime())) *
              100,
          ),
        )
      : 0;

  return (
    <div
      className={`flash-sale ${full ? "is-full" : ""} ${info.tier === "final" ? "is-urgent" : ""} ${info.tier === "open" ? "is-calm" : ""}`}
      role="timer"
      aria-label={isBefore ? "Đếm ngược đến khi mở đơn" : "Đếm ngược đến khi đóng đơn"}
    >
      <div className="flash-head">
        <Flame className="flash-flame" size={15} strokeWidth={2.4} />
        <span className="flash-title">{info.title}</span>
        <span className="flash-live" aria-hidden />
        <span className="flash-hurry">{info.hurry}</span>
      </div>

      <div className="flash-timer">
        {state.days > 0 && (
          <>
            <TimeBox value={state.days} unit="Ngày" />
            <span className="flash-colon">:</span>
          </>
        )}
        <TimeBox value={state.hours} unit="Giờ" />
        <span className="flash-colon">:</span>
        <TimeBox value={state.minutes} unit="Phút" />
        <span className="flash-colon">:</span>
        <TimeBox value={state.seconds} unit="Giây" pop />
      </div>

      {full && (
        <>
          {!isBefore && (
            <div className="flash-progress" aria-hidden>
              <div className="flash-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          )}
          <Link to="/tuyen-thanh-vien" className="flash-cta">
            {isBefore ? "Xem thông tin tuyển" : "Đăng ký ngay"}
            <ArrowRight size={16} strokeWidth={2.6} />
          </Link>
        </>
      )}
    </div>
  );
}

/** Bộ đếm gọn trong hero — đếm ngược cả trước khi mở lẫn khi đang mở. */
function HeroCountdown() {
  const { campaign, state } = useCountdown();

  if (state.kind === "loading") return null;

  if (state.kind === "none" || state.kind === "ended") {
    return (
      <div className="liquid-glass landing-card-solid rounded-2xl px-5 py-3">
        <p className="text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]">
          {state.kind === "ended" ? "Đợt tuyển đã đóng" : "Chưa có đợt tuyển"}
        </p>
      </div>
    );
  }

  return <CountdownCard state={state} campaign={campaign} variant="compact" />;
}

/** Section riêng cuối trang — hiện khi có đợt sắp mở hoặc đang mở; ẩn khi không. */
export function CountdownSection() {
  const { campaign, state } = useCountdown();
  if (state.kind !== "before" && state.kind !== "running") return null;
  const isBefore = state.kind === "before";

  return (
    <section id="dang-ky" className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center">
      <p className="landing-headline text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">
        Tuyển thành viên
      </p>
      <h2 className="landing-headline mt-3 text-3xl font-semibold text-[hsl(var(--landing-foreground))] md:text-4xl">
        {isBefore ? "Đợt tuyển " : "Đăng ký ngay "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(to right, #a855f7, #e0348c)" }}
        >
          {isBefore ? "sắp mở!" : "kẻo lỡ!"}
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.7)] md:text-base">
        {isBefore
          ? "Chuẩn bị hồ sơ sẵn sàng — cổng đăng ký sẽ mở sau:"
          : "Đợt tuyển đang mở — hoàn tất hồ sơ trước khi cổng đăng ký đóng lại."}
      </p>
      <div className="mx-auto mt-8 max-w-md">
        <CountdownCard state={state} campaign={campaign} variant="full" />
      </div>
    </section>
  );
}

export default HeroCountdown;
