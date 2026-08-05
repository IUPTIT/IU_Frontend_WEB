import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewSlot } from "../../../../../types/recruitment";
import type { EditSlotPatch } from "../../../../../services/recruitmentService";

type Props = {
  open: boolean;
  slot: InterviewSlot | null;
  onClose: () => void;
  onSubmit: (slotId: string, patch: EditSlotPatch) => Promise<void>;
};

/** Sửa ca phỏng vấn: ngày, giờ, thời lượng, địa điểm, sức chứa */
function RescheduleModal({ open, slot, onClose, onSubmit }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(45);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(1);
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
      setDuration(slot.durationMinutes || 45);
      setLocation(slot.locationOrLink);
      setCapacity(slot.capacity ?? 1);
      setError(null);
    }
  }

  if (!open || !slot) return null;

  const handleSave = async () => {
    if (!date || !time) {
      setError("Ngày và giờ là bắt buộc.");
      return;
    }
    if (!location.trim()) {
      setError("Địa điểm/Link là bắt buộc.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(slot.id, {
        date,
        startTime: time,
        durationMinutes: duration,
        locationOrLink: location.trim(),
        capacity,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu ca thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" aria-label="Đóng" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-card bg-background shadow-extruded">
        <header className="border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-xl font-extrabold">Sửa ca phỏng vấn</h2>
          {slot.candidateName && <p className="mt-1 text-sm text-muted">{slot.candidateName}</p>}
        </header>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ngày *</span>
              <input type="date" className="neu-input !h-11" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Giờ bắt đầu *</span>
              <input type="time" className="neu-input !h-11" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Thời lượng (phút) *</span>
              <input
                type="number"
                min={15}
                max={120}
                className="neu-input !h-11"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 45)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ứng viên tối đa / ca *</span>
              <input
                type="number"
                min={1}
                max={20}
                className="neu-input !h-11"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Địa điểm / Link *</span>
            <input
              className="neu-input !h-11"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Phòng 302 hoặc link Meet"
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            Lưu thay đổi
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default RescheduleModal;
