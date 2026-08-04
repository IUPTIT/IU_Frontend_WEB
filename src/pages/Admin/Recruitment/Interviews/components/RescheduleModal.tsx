import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewSlot } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  slot: InterviewSlot | null;
  onClose: () => void;
  onSubmit: (slotId: string, date: string, startTime: string, reason: string) => Promise<void>;
};

function RescheduleModal({ open, slot, onClose, onSubmit }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal / đổi slot (adjust state during render)
  const resetKey = open && slot ? slot.id : null;
  const [prevKey, setPrevKey] = useState<string | null>(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    if (resetKey && slot) {
      setDate(slot.date);
      setTime(slot.startTime);
      setReason("");
      setError(null);
    }
  }

  if (!open || !slot) return null;

  const handleSave = async () => {
    if (!date || !time) {
      setError("Khung giờ mới là bắt buộc.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(slot.id, date, time, reason);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" aria-label="Đóng" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-card bg-background shadow-extruded">
        <header className="border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-xl font-extrabold">Đổi lịch phỏng vấn</h2>
          <p className="mt-1 text-sm text-muted">{slot.candidateName}</p>
        </header>
        <div className="space-y-4 p-5">
          <label className="block space-y-1.5">
            <span className="neu-field-label">Ngày mới *</span>
            <input type="date" className="neu-input !h-11" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Giờ bắt đầu *</span>
            <input type="time" className="neu-input !h-11" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Lý do đổi lịch</span>
            <textarea
              className="neu-input !h-auto min-h-[80px] py-3 resize-y text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Không bắt buộc"
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            Lưu lịch mới
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default RescheduleModal;
