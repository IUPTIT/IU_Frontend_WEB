import { useEffect, useState } from "react";
import type { PublicCampaign } from "../../../services/publicRecruitmentService";

type Phase = "before_open" | "open" | "closed";

function getPhase(campaign: PublicCampaign): Phase {
  const now = Date.now();
  if (now < new Date(campaign.openAt).getTime()) return "before_open";
  if (now < new Date(campaign.closeAt).getTime()) return "open";
  return "closed";
}

function remaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CampaignHeader({ campaign }: { campaign: PublicCampaign }) {
  const [phase, setPhase] = useState<Phase>(() => getPhase(campaign));
  // Trước giờ mở đếm ngược tới openAt, đang mở đếm ngược tới closeAt
  const target = phase === "before_open" ? campaign.openAt : campaign.closeAt;
  const [left, setLeft] = useState(() => remaining(target));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase(getPhase(campaign));
      setLeft(remaining(phase === "before_open" ? campaign.openAt : campaign.closeAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [campaign, phase]);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="landing-headline text-4xl font-semibold text-[hsl(var(--landing-foreground))] md:text-5xl">
        {campaign.name}
      </h1>
      <p className="mt-4 text-[hsl(var(--landing-foreground)/0.7)]">{campaign.description}</p>

      {/* Thời gian mở & đóng đơn */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-[hsl(var(--landing-foreground)/0.65)]">
        <span>
          Mở đơn: <span className="font-medium text-[hsl(var(--landing-foreground))]">{formatDateTime(campaign.openAt)}</span>
        </span>
        <span>
          Đóng đơn: <span className="font-medium text-[hsl(var(--landing-foreground))]">{formatDateTime(campaign.closeAt)}</span>
        </span>
      </div>

      {phase === "closed" ? (
        <p className="mt-6 font-medium text-red-400">Đợt tuyển đã đóng đơn.</p>
      ) : left ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          {[
            { value: left.days, unit: "ngày" },
            { value: left.hours, unit: "giờ" },
            { value: left.minutes, unit: "phút" },
            { value: left.seconds, unit: "giây" },
          ].map(({ value, unit }) => (
            <div key={unit} className="liquid-glass landing-card-glass rounded-2xl px-4 py-3 text-center">
              <p className="landing-headline text-2xl font-semibold text-[hsl(var(--landing-foreground))]">
                {String(value).padStart(2, "0")}
              </p>
              <p className="text-xs text-[hsl(var(--landing-foreground)/0.5)]">{unit}</p>
            </div>
          ))}
          <p className="ml-2 text-sm text-[hsl(var(--landing-foreground)/0.6)]">
            {phase === "before_open" ? "đến khi mở đơn" : "đến khi đóng đơn"}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default CampaignHeader;
