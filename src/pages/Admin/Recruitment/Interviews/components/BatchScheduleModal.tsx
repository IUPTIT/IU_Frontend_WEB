import { useState } from "react";
import Button from "../../../../../components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  onSubmit: (payload: {
    date: string;
    startTimes: string[];
    durationMinutes: number;
    locationOrLink: string;
    capacity: number;
  }) => Promise<void>;
};

const TIME_PRESETS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

/**
 * Tạo ca phỏng vấn TRỐNG cho tất cả ứng viên đã pass vòng đơn tự đặt lịch —
 * không gán sẵn ứng viên, không yêu cầu người phỏng vấn (phân công sau).
 */
function BatchScheduleModal({ open, onClose, defaultDate, onSubmit }: Props) {
  const [date, setDate] = useState(defaultDate);
  const [location, setLocation] = useState("Phòng 302");
  const [duration, setDuration] = useState(45);
  const [capacity, setCapacity] = useState(1);
  const [times, setTimes] = useState<string[]>(["08:00", "09:00"]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate(defaultDate);
      setError(null);
    }
  }

  if (!open) return null;

  const toggleTime = (t: string) => {
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
  };

  const handleSave = async () => {
    if (!date) {
      setError("Ngày phỏng vấn là bắt buộc.");
      return;
    }
    if (!location.trim()) {
      setError("Địa điểm/Link là bắt buộc.");
      return;
    }
    if (times.length === 0) {
      setError("Chọn ít nhất một khung giờ.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        startTimes: times,
        durationMinutes: duration,
        locationOrLink: location.trim(),
        capacity,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo lịch thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-schedule-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 id="batch-schedule-title" className="font-display text-xl font-extrabold">
            Tạo ca phỏng vấn
          </h2>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          <p className="rounded-2xl bg-accent/8 px-4 py-3 text-sm text-muted">
            Ca tạo ra áp dụng cho <b className="text-foreground">tất cả ứng viên đã pass vòng đơn</b> —
            ứng viên tự vào tài khoản chọn ca. Người phỏng vấn phân công sau trên từng ca.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ngày phỏng vấn *</span>
              <input type="date" className="neu-input !h-11" value={date} onChange={(e) => setDate(e.target.value)} />
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

          <div className="space-y-1.5">
            <span className="neu-field-label">Khung giờ *</span>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((t) => {
                const on = times.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTime(t)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      on ? "bg-accent/20 text-accent shadow-inset-sm" : "shadow-extruded-sm text-muted"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
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
            Tạo ca phỏng vấn
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default BatchScheduleModal;
