import { Pencil, Plus, Trash2, Users } from "lucide-react";
import Icon from "../../../../../components/ui/Icon";
import type { InterviewSlot } from "../../../../../types/recruitment";

type Props = {
  slot: InterviewSlot;
  onAssign: (slot: InterviewSlot) => void;
  onReschedule: (slot: InterviewSlot) => void;
  onDelete: (slot: InterviewSlot) => void;
  onOpenCandidates: (slot: InterviewSlot) => void;
  /** Leader xem ca được phân — ẩn sửa/xoá/phân công */
  readOnly?: boolean;
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function InterviewSlotCard({
  slot,
  onAssign,
  onReschedule,
  onDelete,
  onOpenCandidates,
  readOnly = false,
}: Props) {
  const filled = slot.interviewers.length;
  const missing = filled === 0;
  const capacity = slot.capacity ?? 1;
  const booked = slot.bookedCount ?? 0;
  const barClass = missing ? "bg-rose-400" : "bg-emerald-400";

  return (
    <article className="ui-card !p-0 overflow-hidden flex">
      <div className={`w-1.5 shrink-0 ${barClass}`} aria-hidden />
      <div className="flex flex-1 flex-wrap items-stretch gap-4 p-4 sm:p-5">
        <div className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl bg-background px-2 py-3 shadow-hairline text-center">
          <span className="text-lg font-bold text-foreground">{slot.startTime}</span>
          <span className="text-[11px] text-muted">{slot.durationMinutes} phút</span>
        </div>

        <div className="min-w-[120px] flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Chỗ trong ca
          </p>
          <p className="font-display text-2xl font-extrabold text-accent">
            {booked}
            <span className="text-base font-semibold text-muted">/{capacity}</span>
          </p>
          <p className="text-xs text-muted">ứng viên đã đặt lịch</p>
        </div>

        <div className="min-w-[180px] flex-[1.4] space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Người phỏng vấn ({filled})
          </p>
          {filled === 0 ? (
            readOnly ? (
              <p className="text-xs text-muted">Chưa có người PV</p>
            ) : (
              <button
                type="button"
                onClick={() => onAssign(slot)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/8 transition-colors"
              >
                <Icon icon={Plus} size={16} /> Thêm người PV
              </button>
            )
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {slot.interviewers.map((iv) => (
                <span
                  key={iv.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-2 py-1 text-xs shadow-soft-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {initials(iv.name)}
                  </span>
                  {iv.name}
                </span>
              ))}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onAssign(slot)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Sửa panel
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
            {missing ? "Thiếu người PV" : slot.status === "done" ? "Đã xong" : "Đã xếp"}
          </span>
          <p className="flex items-center gap-1 text-xs text-muted">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path
                d="M10 17s5-4.2 5-8a5 5 0 1 0-10 0c0 3.8 5 8 5 8Z"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="9" r="1.5" />
            </svg>
            {slot.locationOrLink}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              title="Danh sách ứng viên trong ca"
              aria-label="Danh sách ứng viên trong ca"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted shadow-soft-sm transition-all duration-300 ease-out hover:text-accent active:shadow-hairline focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background"
              onClick={() => onOpenCandidates(slot)}
            >
              <Icon icon={Users} size={15} />
            </button>
            {!readOnly && (
              <>
                <button
                  type="button"
                  title="Sửa ca"
                  aria-label="Sửa ca"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted shadow-soft-sm transition-all duration-300 ease-out hover:text-accent active:shadow-hairline focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background"
                  onClick={() => onReschedule(slot)}
                >
                  <Icon icon={Pencil} size={15} />
                </button>
                <button
                  type="button"
                  title="Xoá ca"
                  aria-label="Xoá ca"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 shadow-soft-sm transition-all duration-300 ease-out hover:text-rose-600 active:shadow-hairline focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background"
                  onClick={() => onDelete(slot)}
                >
                  <Icon icon={Trash2} size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default InterviewSlotCard;
