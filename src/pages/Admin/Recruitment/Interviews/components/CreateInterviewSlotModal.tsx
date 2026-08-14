import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewerRef } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  interviewers: InterviewerRef[];
  onSubmit: (payload: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    locationOrLink: string;
    capacity: number;
    interviewerIds: string[];
  }) => Promise<void>;
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Modal tạo đúng 1 ca PV — ngày, giờ bắt đầu/kết thúc, địa điểm, sức chứa, người PV.
 */
function CreateInterviewSlotModal({
  open,
  onClose,
  defaultDate,
  interviewers,
  onSubmit,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [location, setLocation] = useState("Phòng 302");
  const [capacity, setCapacity] = useState(8);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>(
    [],
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate(defaultDate);
      setName("");
      setStartTime("08:00");
      setEndTime("12:00");
      setLocation("Phòng 302");
      setCapacity(8);
      setSelectedInterviewers([]);
      setPanelOpen(false);
      setError(null);
    }
  }

  if (!open) return null;

  const toggleInterviewer = (id: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên ca phỏng vấn là bắt buộc.");
      return;
    }
    if (!date) {
      setError("Ngày phỏng vấn là bắt buộc.");
      return;
    }
    if (!location.trim()) {
      setError("Địa điểm / link là bắt buộc.");
      return;
    }
    if (toMinutes(endTime) <= toMinutes(startTime)) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }
    const safeCapacity = Math.min(50, Math.max(1, capacity || 8));
    setCapacity(safeCapacity);
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        date,
        startTime,
        endTime,
        locationOrLink: location.trim(),
        capacity: safeCapacity,
        interviewerIds: selectedInterviewers,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tạo ca thất bại — thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-slot-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2
            id="create-slot-title"
            className="font-display text-xl font-extrabold"
          >
            Thêm ca phỏng vấn
          </h2>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="space-y-4 overflow-y-auto p-5">
          <p className="rounded-2xl bg-accent/8 px-4 py-3 text-sm text-muted">
            Tạo <b className="text-foreground">một ca</b> với giờ bắt đầu–kết
            thúc. Ứng viên tự chọn ca còn chỗ; có thể gán người PV ngay hoặc
            sau.
          </p>

          <label className="block space-y-1.5">
            <span className="neu-field-label">Tên ca phỏng vấn *</span>
            <input
              type="text"
              className="neu-input !h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Ca sáng Ban Chuyên môn"
              maxLength={200}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="neu-field-label">Ngày phỏng vấn *</span>
            <input
              type="date"
              className="neu-input !h-11"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="neu-field-label">Bắt đầu *</span>
              <input
                type="time"
                className="neu-input !h-11"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Kết thúc *</span>
              <input
                type="time"
                className="neu-input !h-11"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-1">
              <span className="neu-field-label">Địa điểm / link *</span>
              <input
                type="text"
                className="neu-input !h-11"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Phòng 302 hoặc link Meet"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">Ứng viên tối đa *</span>
              <input
                type="number"
                min={1}
                max={50}
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
                  setCapacity((c) => Math.min(50, Math.max(1, c || 8)))
                }
              />
            </label>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left shadow-extruded-sm transition-all hover:bg-accent/5"
              onClick={() => setPanelOpen((v) => !v)}
            >
              <span className="neu-field-label !mb-0">
                Người phỏng vấn phụ trách ca ({selectedInterviewers.length} đã
                chọn)
              </span>
              <svg
                className={`h-4 w-4 text-muted transition-transform ${panelOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {panelOpen && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl bg-accent/5 p-2">
                {interviewers.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted">
                    Chưa có danh sách người PV — có thể gán sau.
                  </p>
                ) : (
                  interviewers.map((iv) => (
                    <label
                      key={iv.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        selectedInterviewers.includes(iv.id)
                          ? "bg-accent/15 text-accent"
                          : "text-foreground hover:bg-white/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={selectedInterviewers.includes(iv.id)}
                        onChange={() => toggleInterviewer(iv.id)}
                      />
                      <span className="font-medium">{iv.name}</span>
                      {iv.role && (
                        <span className="ml-auto text-xs text-muted capitalize">
                          {iv.role === "bcn" ? "BCN" : iv.role}
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-medium text-rose-500" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Đang tạo..." : "Thêm ca phỏng vấn"}
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default CreateInterviewSlotModal;
