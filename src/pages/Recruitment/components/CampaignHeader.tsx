import { useEffect, useState } from "react";
import type { RecruitmentCampaign } from "../types";

function remaining(closeAt: string) {
  const diff = new Date(closeAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

function CampaignHeader({ campaign }: { campaign: RecruitmentCampaign }) {
  const [left, setLeft] = useState(() => remaining(campaign.closeAt));

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(remaining(campaign.closeAt)), 60_000);
    return () => window.clearInterval(timer);
  }, [campaign.closeAt]);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="landing-headline text-4xl font-semibold text-[hsl(var(--landing-foreground))] md:text-5xl">
        {campaign.name}
      </h1>
      <p className="mt-4 text-[hsl(var(--landing-foreground)/0.7)]">{campaign.description}</p>

      {left ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          {[
            { value: left.days, unit: "ngày" },
            { value: left.hours, unit: "giờ" },
            { value: left.minutes, unit: "phút" },
          ].map(({ value, unit }) => (
            <div key={unit} className="liquid-glass landing-card-solid rounded-2xl px-4 py-3 text-center">
              <p className="landing-headline text-2xl font-semibold text-[hsl(var(--landing-foreground))]">
                {String(value).padStart(2, "0")}
              </p>
              <p className="text-xs text-[hsl(var(--landing-foreground)/0.5)]">{unit}</p>
            </div>
          ))}
          <p className="ml-2 text-sm text-[hsl(var(--landing-foreground)/0.6)]">đến khi đóng đơn</p>
        </div>
      ) : (
        <p className="mt-6 font-medium text-red-400">Đợt tuyển đã đóng đơn.</p>
      )}
    </div>
  );
}

export default CampaignHeader;
