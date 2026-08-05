import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewerRef } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  interviewers: InterviewerRef[];
  onSubmit: (payload: {
    date: string;
    startTimes: string[];
    durationMinutes: number;
    locationOrLink: string;
    capacity: number;
    interviewerIds: string[];
  }) => Promise<void>;
};

const TIME_PRESETS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

/**
 * Tạo ca phỏng vấn — admin gắn nhiều người PV cho CẢ CA
 * (chung cho mọi ứng viên đặt vào ca, không 1-1 ứng viên–interviewer).
 */
function BatchScheduleModal({
  open,
  onClose,
  defaultDate,
  interviewers,
  onSubmit,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [location, setLocation] = useState("Phòng 302");
  const [duration, setDuration] = useState(45);
  const [capacity, setCapacity] = useState(1);
  const [times, setTimes] = useState<string[]>(["08:00", "09:00"]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate(defaultDate);
      setError(null);
      setSelectedInterviewers([]);
    }
  }

  if (!open) return null;

  const toggleTime = (t: string) => {
    setTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort(),
    );
  };

  const toggleInterviewer = (id: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
    // Panel có thể để trống — phân công người PV sau trên card ca
    const safeDuration = Math.min(120, Math.max(15, duration || 45));
    const safeCapacity = Math.min(20, Math.max(1, capacity || 1));
    setDuration(safeDuration);
    setCapacity(safeCapacity);
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        startTimes: times,
        durationMinutes: safeDuration,
        locationOrLink: location.trim(),
        capacity: safeCapacity,
        interviewerIds: selectedInterviewers,
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
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
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
            Ca áp dụng cho <b className="text-foreground">tất cả ứng viên đã pass vòng đơn</b> —
            họ tự chọn ca. Người PV bạn chọn phụ trách <b className="text-foreground">cả ca</b>{" "}
            (nhiều người cùng phỏng vấn hết số chỗ), không gắn 1 ứng viên – 1 người.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ngày phỏng vấn *</span>
              <input
                type="date"
                className="neu-input !h-11"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Thời lượng (phút) *</span>
              <input
                type="number"
                min={15}
                max={120}
                inputMode="numeric"
                className="neu-input !h-11"
                value={Number.isFinite(duration) && duration > 0 ? duration : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setDuration(0);
                    return;
                  }
                  const n = Number(raw);
                  if (!Number.isNaN(n)) setDuration(n);
                }}
                onBlur={() =>
                  setDuration((d) => Math.min(120, Math.max(15, d || 45)))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ứng viên tối đa / ca *</span>
              <input
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                className="neu-input !h-11"
                value={Number.isFinite(capacity) && capacity > 0 ? capacity : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setCapacity(0);
                    return;
                  }
                  const n = Number(raw);
                  if (!Number.isNaN(n)) setCapacity(n);
                }}
                onBlur={() =>
                  setCapacity((c) => Math.min(20, Math.max(1, c || 1)))
                }
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
                      on
                        ? "bg-accent/20 text-accent shadow-inset-sm"
                        : "shadow-extruded-sm text-muted"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="neu-field-label">
              Người phỏng vấn phụ trách ca ({selectedInterviewers.length} đã chọn)
            </span>
            <p className="text-xs text-muted">
              Có thể bỏ trống và phân công sau. Ứng viên chỉ đặt được ca đã có ≥1
              người PV.
            </p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {interviewers.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted">
                  Chưa có danh sách người PV (Leader / BCN).
                </p>
              ) : (
                interviewers.map((iv) => (
                  <label
                    key={iv.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      selectedInterviewers.includes(iv.id)
                        ? "bg-accent/15 text-accent"
                        : "hover:bg-accent/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={selectedInterviewers.includes(iv.id)}
                      onChange={() => toggleInterviewer(iv.id)}
                    />
                    <span className="text-sm font-medium">{iv.name}</span>
                  </label>
                ))
              )}
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
