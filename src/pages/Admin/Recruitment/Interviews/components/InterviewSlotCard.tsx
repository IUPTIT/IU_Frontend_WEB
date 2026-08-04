import { Plus } from "lucide-react";
import Icon from "../../../../../components/ui/Icon";
import type { InterviewSlot } from "../../../../../types/recruitment";

type Props = {
  slot: InterviewSlot;
  onAssign: (slot: InterviewSlot) => void;
  onReschedule: (slot: InterviewSlot) => void;
  onScore: (slot: InterviewSlot) => void;
  onDelete: (slot: InterviewSlot) => void;
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function InterviewSlotCard({ slot, onAssign, onReschedule, onScore, onDelete }: Props) {
  const filled = slot.interviewers.length;
  const need = slot.requiredInterviewers;
  const missing = filled < need;
  const barClass = missing ? "bg-rose-400" : "bg-emerald-400";

  return (
    <article className="neu-card !p-0 overflow-hidden flex">
      <div className={`w-1.5 shrink-0 ${barClass}`} aria-hidden />
      <div className="flex flex-1 flex-wrap items-stretch gap-4 p-4 sm:p-5">
        <div className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl bg-background px-2 py-3 shadow-inset-sm text-center">
          <span className="text-lg font-bold text-foreground">{slot.startTime}</span>
          <span className="text-[11px] text-muted">{slot.durationMinutes} phút</span>
        </div>

        <div className="min-w-[140px] flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Ứng viên</p>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {initials(slot.candidateName ?? "?")}
            </span>
            <div>
              <p className="font-semibold text-foreground">{slot.candidateName ?? "—"}</p>
              <p className="text-xs text-muted">{slot.candidateDepartment}</p>
            </div>
          </div>
        </div>

        <div className="min-w-[160px] flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Người phỏng vấn ({filled}/{need})
          </p>
          {filled === 0 ? (
            <button
              type="button"
              onClick={() => onAssign(slot)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/8 transition-colors"
            >
              <Icon icon={Plus} size={16} /> Thêm người PV
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {slot.interviewers.map((iv) => (
                <span
                  key={iv.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-2 py-1 text-xs shadow-extruded-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {initials(iv.name)}
                  </span>
                  {iv.name}
                </span>
              ))}
              {missing && (
                <button
                  type="button"
                  onClick={() => onAssign(slot)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  + Thêm
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between gap-2 sm:min-w-[120px]">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              missing
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                : slot.status === "done"
                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {missing ? "Thiếu người" : slot.status === "done" ? "Đã xong" : "Đã xếp"}
          </span>
          <p className="flex items-center gap-1 text-xs text-muted">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M10 17s5-4.2 5-8a5 5 0 1 0-10 0c0 3.8 5 8 5 8Z" strokeLinejoin="round" />
              <circle cx="10" cy="9" r="1.5" />
            </svg>
            {slot.locationOrLink}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              className="text-xs font-medium text-muted hover:text-accent"
              onClick={() => onReschedule(slot)}
            >
              Sửa
            </button>
            <span className="text-muted/40">·</span>
            <button
              type="button"
              className="text-xs font-medium text-muted hover:text-accent"
              onClick={() => onScore(slot)}
            >
              Chấm điểm
            </button>
            <span className="text-muted/40">·</span>
            <button
              type="button"
              className="text-xs font-medium text-rose-500 hover:text-rose-600"
              onClick={() => onDelete(slot)}
            >
              Xoá
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default InterviewSlotCard;
