import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Hourglass,
} from "lucide-react";
import Icon from "../../../../components/ui/Icon";

type Props = {
  total: number;
  doing: number;
  done: number;
  overdue: number;
  passRate: number | null;
  review: number;
};

export default function MentorTaskKpis({
  total,
  doing,
  done,
  overdue,
  passRate,
  review,
}: Props) {
  const cards = [
    {
      label: "Tổng số task",
      value: total,
      hint: review > 0 ? `${review} chờ review` : "Mọi assignment",
      icon: ClipboardList,
      tone: "text-sky-600 bg-sky-500/15",
    },
    {
      label: "Đang triển khai",
      value: doing,
      hint: `${doing} đang làm`,
      icon: Hourglass,
      tone: "text-emerald-600 bg-emerald-500/15",
    },
    {
      label: "Đã hoàn thành",
      value: done,
      hint: passRate != null ? `${passRate}% đạt (≥5)` : "Chưa có điểm",
      icon: CheckCircle2,
      tone: "text-accent bg-accent/15",
    },
    {
      label: "Quá hạn",
      value: overdue,
      hint: overdue > 0 ? "Cần chú ý" : "Ổn",
      icon: AlertTriangle,
      tone: "text-rose-600 bg-rose-500/15",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <article key={c.label} className="neu-card !p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {c.label}
            </p>
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${c.tone}`}
            >
              <Icon icon={c.icon} size={18} />
            </span>
          </div>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            {c.value}
          </p>
          <p className="text-xs text-muted">{c.hint}</p>
        </article>
      ))}
    </div>
  );
}
