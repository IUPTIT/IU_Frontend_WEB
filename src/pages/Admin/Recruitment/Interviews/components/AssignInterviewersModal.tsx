import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewSlot, InterviewerRef } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  slot: InterviewSlot | null;
  interviewers: InterviewerRef[];
  onClose: () => void;
  onSubmit: (slotId: string, selected: InterviewerRef[]) => Promise<void>;
};

function AssignInterviewersModal({ open, slot, interviewers, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetKey = open && slot ? slot.id : null;
  const [prevKey, setPrevKey] = useState<string | null>(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    if (resetKey && slot) {
      setSelected(slot.interviewers.map((i) => i.id));
      setError(null);
    }
  }

  if (!open || !slot) return null;

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      setError("Chọn ít nhất một người phỏng vấn cho ca.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const list = interviewers.filter((i) => selected.includes(i.id));
      await onSubmit(slot.id, list);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Phân công thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const capacity = slot.capacity ?? 1;
  const booked = slot.bookedCount ?? 0;

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
        className="relative z-10 w-full max-w-md overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-xl font-extrabold">
            Phân công người phỏng vấn
          </h2>
          <p className="mt-1 text-sm text-muted">
            Ca {slot.startTime} · {slot.locationOrLink} · {booked}/{capacity} chỗ — panel
            chung cho mọi ứng viên trong ca
          </p>
        </header>
        <div className="space-y-2 p-5 max-h-[50vh] overflow-y-auto">
          {interviewers.map((iv) => (
            <label
              key={iv.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                selected.includes(iv.id)
                  ? "bg-accent/15 text-accent shadow-inset-sm"
                  : "shadow-extruded-sm text-foreground hover:bg-accent/5"
              }`}
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={selected.includes(iv.id)}
                onChange={() => toggle(iv.id)}
              />
              <span className="font-medium">{iv.name}</span>
            </label>
          ))}
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            Lưu phân công
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default AssignInterviewersModal;
