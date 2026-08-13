import type { CandidateSlot } from "../../../../services/candidateService";
import { formatDate } from "../../../../utils/formatDate";

type Props = {
  slots: CandidateSlot[];
  selectedId: string | null;
  onSelect: (slot: CandidateSlot) => void;
  disabled?: boolean;
};

/** Danh sách ca còn chỗ, nhóm theo ngày — chọn 1 ca để giữ chỗ */
function SlotList({ slots, selectedId, onSelect, disabled }: Props) {
  if (slots.length === 0) {
    return (
      <p className="rounded-2xl bg-accent/5 px-4 py-6 text-center text-sm text-muted">
        Hiện chưa có ca phỏng vấn nào còn chỗ — quay lại sau nhé.
      </p>
    );
  }

  const byDate = new Map<string, CandidateSlot[]>();
  for (const s of slots) {
    const key = s.date.slice(0, 10);
    byDate.set(key, [...(byDate.get(key) ?? []), s]);
  }

  return (
    <div className="space-y-5">
      {[...byDate.entries()].map(([date, daySlots]) => (
        <div key={date}>
          <p className="mb-2 text-sm font-semibold text-foreground">{formatDate(date)}</p>
          <div className="flex flex-wrap gap-3">
            {daySlots.map((slot) => {
              const active = slot._id === selectedId;
              return (
                <button
                  key={slot._id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(slot)}
                  className={`ui-btn !h-auto flex-col !items-start gap-1 !px-4 !py-3 text-left disabled:opacity-50 ${
                    active ? "!shadow-hairline text-accent" : ""
                  }`}
                >
                  <span className="text-sm font-bold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="text-xs text-muted">{slot.location}</span>
                  <span className="text-xs text-accent-secondary">
                    Còn {slot.availableSlots} chỗ
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SlotList;
