import type { CandidateSlot } from "../../../../services/candidateService";
import { formatDate } from "../../../../utils/formatDate";

type Props = {
  slots: CandidateSlot[];
  selectedId: string | null;
  onSelect: (slot: CandidateSlot) => void;
  disabled?: boolean;
  /** Ca không chọn được (vd. đổi ca nhưng < 24h) */
  disabledSlotIds?: Set<string>;
  /** Flat 2D — đồng bộ candidate portal */
  flat?: boolean;
};

/** Danh sách ca còn chỗ — chọn 1 ca để giữ chỗ / đổi ca */
function SlotList({
  slots,
  selectedId,
  onSelect,
  disabled,
  disabledSlotIds,
  flat,
}: Props) {
  if (slots.length === 0) {
    return (
      <p
        className={
          flat
            ? "rounded-xl border border-[#E8EAF2] bg-[#F7F8FC] px-4 py-6 text-center text-sm text-[#6B7086]"
            : "rounded-2xl bg-accent/5 px-4 py-6 text-center text-sm text-muted"
        }
      >
        Hiện chưa có ca phỏng vấn nào còn chỗ trong ngày này — chọn ngày khác
        nhé.
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
          <p
            className={
              flat
                ? "mb-2 text-sm font-semibold text-[#191A2C]"
                : "mb-2 text-sm font-semibold text-foreground"
            }
          >
            {formatDate(date)}
          </p>
          <div className="flex flex-wrap gap-3">
            {daySlots.map((slot) => {
              const active = slot._id === selectedId;
              const blocked = disabledSlotIds?.has(slot._id) ?? false;
              if (flat) {
                return (
                  <button
                    key={slot._id}
                    type="button"
                    disabled={disabled || blocked}
                    title={
                      blocked
                        ? "Ca này cách hiện tại chưa đủ 24 giờ"
                        : undefined
                    }
                    onClick={() => onSelect(slot)}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
                      active
                        ? "border-[#7C3AED] bg-[#F1E9FE] ring-2 ring-[#7C3AED]/25"
                        : "border-[#E4E8F0] bg-white hover:border-[#7C3AED]/50"
                    }`}
                  >
                    <span className="text-sm font-bold text-[#191A2C]">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="text-xs text-[#6B7086]">
                      {slot.location}
                    </span>
                    <span className="text-xs font-medium text-[#7C3AED]">
                      {blocked
                        ? "Chưa đủ 24 giờ"
                        : `Còn ${slot.availableSlots} chỗ`}
                    </span>
                  </button>
                );
              }
              return (
                <button
                  key={slot._id}
                  type="button"
                  disabled={disabled || blocked}
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
                    {blocked
                      ? "Chưa đủ 24 giờ"
                      : `Còn ${slot.availableSlots} chỗ`}
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
