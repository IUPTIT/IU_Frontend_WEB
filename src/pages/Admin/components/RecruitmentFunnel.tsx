import type { FunnelStage, Tone } from "../../../types/admin";

const stageTone: Record<Tone, string> = {
  accent: "bg-accent/25 text-foreground",
  purple: "bg-accent-light/30 text-foreground",
  green: "bg-accent-secondary/25 text-foreground",
  muted: "bg-muted/20 text-foreground",
};

function RecruitmentFunnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <article className="ui-card">
      <h3 className="text-lg">Phễu Tuyển dụng</h3>
      <p className="mt-1 text-sm text-muted">Tỷ lệ chuyển đổi qua các vòng</p>

      <div className="mt-8 flex flex-col items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.id} className="w-full flex flex-col items-center">
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl px-4 h-12 shadow-soft-sm transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-soft ${stageTone[stage.tone]}`}
              style={{ width: `${100 - i * 14}%`, minWidth: "60%" }}
            >
              <span className="text-sm font-medium truncate">{stage.label}</span>
              <span className="font-display font-bold">{stage.value}</span>
            </div>
            <span className="my-1.5 text-xs text-muted">{stage.percent}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default RecruitmentFunnel;
