import { Fragment } from "react";
import { ChevronRight, GitBranch } from "lucide-react";
import Icon from "../../../components/ui/Icon";
import type { FunnelStage } from "../../../types/admin";

// Bảng màu theo giai đoạn — tint nhạt hợp nền airy, đọc rõ cả light/dark
const palette = [
  { tint: "bg-blue-500/10", ink: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  { tint: "bg-violet-500/10", ink: "text-violet-600 dark:text-violet-300", dot: "bg-violet-500" },
  { tint: "bg-amber-500/10", ink: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  { tint: "bg-emerald-500/10", ink: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  { tint: "bg-accent/10", ink: "text-accent", dot: "bg-accent" },
];

type Cell = { id: string; label: string; value: number; sub: string };

/**
 * Signature "Hành trình thành viên" — phễu tuyển dụng & đào tạo dạng dải ngang,
 * kết ở giai đoạn "Thành viên" (tổng thành viên chính thức của CLB).
 */
function JourneyStrip({
  stages,
  periodLabel,
  totalMembers,
}: {
  stages: FunnelStage[];
  periodLabel: string;
  totalMembers: number;
}) {
  const cells: Cell[] = [
    ...stages.map((s) => ({ id: s.id, label: s.label, value: s.value, sub: `${s.percent}%` })),
    { id: "member", label: "Thành viên", value: totalMembers, sub: "Toàn CLB" },
  ];

  return (
    <article className="ui-card !p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg">Hành trình thành viên</h3>
          <p className="mt-1 text-sm text-muted">
            Phễu tuyển dụng &amp; đào tạo — {periodLabel}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-muted shadow-hairline">
          <Icon icon={GitBranch} size={14} />
          {cells.length} giai đoạn
        </span>
      </div>

      <div className="mt-6 flex items-stretch gap-2 overflow-x-auto pb-1">
        {cells.map((cell, i) => {
          const p = palette[i % palette.length];
          return (
            <Fragment key={cell.id}>
              <div className={`min-w-[124px] flex-1 rounded-2xl p-4 ${p.tint}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.dot}`} aria-hidden />
                  <span className="truncate text-xs font-semibold text-muted">{cell.label}</span>
                </div>
                <p className={`stat-num mt-2 text-3xl ${p.ink}`}>{cell.value}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">{cell.sub}</p>
              </div>
              {i < cells.length - 1 && (
                <div className="flex shrink-0 items-center px-0.5">
                  <Icon icon={ChevronRight} size={18} className="text-muted/50" />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </article>
  );
}

export default JourneyStrip;
