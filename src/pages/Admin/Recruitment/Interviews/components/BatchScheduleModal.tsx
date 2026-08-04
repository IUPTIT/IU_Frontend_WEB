import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { Application } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  onClose: () => void;
  candidates: Application[];
  defaultDate: string;
  onSubmit: (payload: {
    date: string;
    startTimes: string[];
    durationMinutes: number;
    locationOrLink: string;
    applicationIds: string[];
  }) => Promise<void>;
};

const TIME_PRESETS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

function BatchScheduleModal({ open, onClose, candidates, defaultDate, onSubmit }: Props) {
  const [date, setDate] = useState(defaultDate);
  const [location, setLocation] = useState("Phòng 302");
  const [duration, setDuration] = useState(45);
  const [times, setTimes] = useState<string[]>(["08:00", "09:00"]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate(defaultDate);
      setSelectedIds(candidates.slice(0, Math.min(4, candidates.length)).map((c) => c.id));
      setError(null);
    }
  }

  if (!open) return null;

  const toggleTime = (t: string) => {
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
  };

  const toggleApp = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
    if (selectedIds.length === 0) {
      setError("Chọn ít nhất một ứng viên.");
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
        applicationIds: selectedIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xếp lịch thất bại — thử lại.");
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
            Xếp lịch hàng loạt
          </h2>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-2">
            <span className="neu-field-label">Danh sách ứng viên *</span>
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {candidates.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted">Không có ứng viên đạt vòng hồ sơ.</li>
              ) : (
                candidates.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/8">
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleApp(c.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{c.fullName}</span>
                        <span className="text-xs text-muted">{c.preferredDepartmentName}</span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            Tạo lịch
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default BatchScheduleModal;
