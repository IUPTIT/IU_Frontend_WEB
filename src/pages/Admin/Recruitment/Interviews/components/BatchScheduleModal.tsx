import { useMemo, useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewerRef } from "../../../../../types/recruitment";

export type SessionSlotPayload = {
  label: "morning" | "afternoon";
  startTime: string;
  endTime: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  interviewers: InterviewerRef[];
  onSubmit: (payload: {
    date: string;
    sessions: SessionSlotPayload[];
    locationOrLink: string;
    capacity: number;
    interviewerIds: string[];
  }) => Promise<void>;
};

type AmPmRanges = {
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

const STORAGE_KEY = "iuclub.interview.amPmRanges";

const DEFAULT_RANGES: AmPmRanges = {
  morningStart: "08:00",
  morningEnd: "12:00",
  afternoonStart: "13:00",
  afternoonEnd: "17:00",
};

function loadRanges(): AmPmRanges {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RANGES };
    const parsed = JSON.parse(raw) as Partial<AmPmRanges>;
    return { ...DEFAULT_RANGES, ...parsed };
  } catch {
    return { ...DEFAULT_RANGES };
  }
}

function saveRanges(ranges: AmPmRanges) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
  } catch {
    /* ignore quota */
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Mỗi ngày tối đa 2 ca: sáng + chiều.
 * Cấu hình giờ bắt đầu–kết thúc từng buổi (không chia nhỏ theo thời lượng).
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
  const [capacity, setCapacity] = useState(8);
  const [includeMorning, setIncludeMorning] = useState(true);
  const [includeAfternoon, setIncludeAfternoon] = useState(true);
  const [ranges, setRanges] = useState<AmPmRanges>(() => loadRanges());
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDate(defaultDate);
      setError(null);
      setSelectedInterviewers([]);
      setRanges(loadRanges());
      setIncludeMorning(true);
      setIncludeAfternoon(true);
    }
  }

  const sessions = useMemo((): SessionSlotPayload[] => {
    const out: SessionSlotPayload[] = [];
    if (includeMorning) {
      out.push({
        label: "morning",
        startTime: ranges.morningStart,
        endTime: ranges.morningEnd,
      });
    }
    if (includeAfternoon) {
      out.push({
        label: "afternoon",
        startTime: ranges.afternoonStart,
        endTime: ranges.afternoonEnd,
      });
    }
    return out;
  }, [includeMorning, includeAfternoon, ranges]);

  if (!open) return null;

  const updateRange = (patch: Partial<AmPmRanges>) => {
    setRanges((prev) => {
      const next = { ...prev, ...patch };
      saveRanges(next);
      return next;
    });
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
    if (!includeMorning && !includeAfternoon) {
      setError("Chọn ít nhất Ca sáng hoặc Ca chiều.");
      return;
    }
    for (const s of sessions) {
      if (toMinutes(s.endTime) <= toMinutes(s.startTime)) {
        setError(
          s.label === "morning"
            ? "Ca sáng: giờ kết thúc phải sau giờ bắt đầu."
            : "Ca chiều: giờ kết thúc phải sau giờ bắt đầu.",
        );
        return;
      }
    }
    const safeCapacity = Math.min(50, Math.max(1, capacity || 8));
    setCapacity(safeCapacity);
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        date,
        sessions,
        locationOrLink: location.trim(),
        capacity: safeCapacity,
        interviewerIds: selectedInterviewers,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tạo lịch thất bại — thử lại.",
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
        aria-labelledby="batch-schedule-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2
            id="batch-schedule-title"
            className="font-display text-xl font-extrabold"
          >
            Tạo ca phỏng vấn
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

        <div className="space-y-5 overflow-y-auto p-5">
          <p className="rounded-2xl bg-accent/8 px-4 py-3 text-sm text-muted">
            Mỗi ngày tối đa <b className="text-foreground">2 ca</b>: sáng và
            chiều. Ứng viên đã pass vòng đơn tự chọn ca. Người PV phụ trách{" "}
            <b className="text-foreground">cả ca</b>.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <span className="neu-field-label">Ứng viên tối đa / ca *</span>
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

          <div className="space-y-3">
            <span className="neu-field-label">Buổi *</span>
            <div className="grid gap-3">
              <div
                className={`min-w-0 rounded-2xl p-4 transition-all ${
                  includeMorning
                    ? "bg-accent/15 shadow-inset-sm"
                    : "shadow-extruded-sm opacity-70"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={includeMorning}
                    onChange={() => setIncludeMorning((v) => !v)}
                  />
                  <span className="font-semibold text-foreground">Ca sáng</span>
                </label>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <label className="min-w-0 space-y-1">
                    <span className="text-[11px] text-muted">Bắt đầu</span>
                    <input
                      type="time"
                      className="neu-input !h-10 !w-full min-w-0"
                      disabled={!includeMorning}
                      value={ranges.morningStart}
                      onChange={(e) =>
                        updateRange({ morningStart: e.target.value })
                      }
                      aria-label="Ca sáng bắt đầu"
                    />
                  </label>
                  <span className="pt-5 text-muted text-sm">đến</span>
                  <label className="min-w-0 space-y-1">
                    <span className="text-[11px] text-muted">Kết thúc</span>
                    <input
                      type="time"
                      className="neu-input !h-10 !w-full min-w-0"
                      disabled={!includeMorning}
                      value={ranges.morningEnd}
                      onChange={(e) =>
                        updateRange({ morningEnd: e.target.value })
                      }
                      aria-label="Ca sáng kết thúc"
                    />
                  </label>
                </div>
              </div>

              <div
                className={`min-w-0 rounded-2xl p-4 transition-all ${
                  includeAfternoon
                    ? "bg-accent/15 shadow-inset-sm"
                    : "shadow-extruded-sm opacity-70"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={includeAfternoon}
                    onChange={() => setIncludeAfternoon((v) => !v)}
                  />
                  <span className="font-semibold text-foreground">Ca chiều</span>
                </label>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <label className="min-w-0 space-y-1">
                    <span className="text-[11px] text-muted">Bắt đầu</span>
                    <input
                      type="time"
                      className="neu-input !h-10 !w-full min-w-0"
                      disabled={!includeAfternoon}
                      value={ranges.afternoonStart}
                      onChange={(e) =>
                        updateRange({ afternoonStart: e.target.value })
                      }
                      aria-label="Ca chiều bắt đầu"
                    />
                  </label>
                  <span className="pt-5 text-muted text-sm">đến</span>
                  <label className="min-w-0 space-y-1">
                    <span className="text-[11px] text-muted">Kết thúc</span>
                    <input
                      type="time"
                      className="neu-input !h-10 !w-full min-w-0"
                      disabled={!includeAfternoon}
                      value={ranges.afternoonEnd}
                      onChange={(e) =>
                        updateRange({ afternoonEnd: e.target.value })
                      }
                      aria-label="Ca chiều kết thúc"
                    />
                  </label>
                </div>
              </div>
            </div>

            <p className="rounded-2xl bg-background px-3 py-2 text-sm text-muted shadow-inset-sm">
              {sessions.length === 0 ? (
                <>Chọn ít nhất một buổi.</>
              ) : (
                <>
                  Sẽ tạo{" "}
                  <b className="text-foreground">{sessions.length} ca</b>
                  {sessions.map((s) => (
                    <span key={s.label}>
                      {" · "}
                      {s.label === "morning" ? "Sáng" : "Chiều"}{" "}
                      <b className="text-foreground">
                        {s.startTime}–{s.endTime}
                      </b>
                    </span>
                  ))}
                </>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="neu-field-label">
              Người phỏng vấn phụ trách ca ({selectedInterviewers.length} đã
              chọn)
            </span>
            <p className="text-xs text-muted">
              Có thể bỏ trống và phân công sau. Ứng viên chỉ đặt được ca đã có ≥1
              người PV.
            </p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {interviewers.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted">
                  Chưa có danh sách người PV (BCN / Leader / Member).
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
                    {iv.role && (
                      <span className="ml-auto text-xs text-muted capitalize">
                        {iv.role === "bcn" ? "BCN" : iv.role}
                      </span>
                    )}
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
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            Tạo ca phỏng vấn
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default BatchScheduleModal;
