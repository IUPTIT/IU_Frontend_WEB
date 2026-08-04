import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import type { InterviewCriterion, InterviewSlot } from "../../../../../types/recruitment";

type Props = {
  open: boolean;
  slot: InterviewSlot | null;
  criteria: InterviewCriterion[];
  onClose: () => void;
  onSave: (payload: {
    scores: Record<string, string>;
    comment: string;
  }) => Promise<void>;
  onPassFail: (result: "pass" | "fail") => Promise<void>;
};

function InterviewScoreModal({ open, slot, criteria, onClose, onSave, onPassFail }: Props) {
  const [scores, setScores] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset điểm mỗi lần mở modal / đổi slot (adjust state during render)
  const resetKey = open ? (slot?.id ?? "none") : null;
  const [prevKey, setPrevKey] = useState<string | null>(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    if (resetKey) {
      const init: Record<string, string> = {};
      for (const c of criteria) init[c.id] = "";
      setScores(init);
      setComment("");
      setError(null);
    }
  }

  if (!open || !slot) return null;

  const validate = () => {
    for (const c of criteria) {
      const v = Number.parseFloat(scores[c.id] ?? "");
      if (Number.isNaN(v) || v < 0 || v > c.maxScore) {
        setError(`Điểm "${c.name}" bắt buộc (0–${c.maxScore}).`);
        return false;
      }
    }
    if (!comment.trim()) {
      setError("Nhận xét là bắt buộc.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ scores, comment });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu điểm thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (result: "pass" | "fail") => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ scores, comment });
      await onPassFail(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật kết quả thất bại — thử lại.");
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-xl font-extrabold">Nhập điểm phỏng vấn</h2>
          <p className="mt-1 text-sm text-muted">
            {slot.candidateName} · {slot.startTime} · {slot.date}
          </p>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {criteria.map((c) => (
              <label key={c.id} className="flex flex-col items-center gap-2 text-center">
                <span className="text-sm font-medium">
                  {c.name} <span className="text-muted">({c.maxScore})</span>
                </span>
                <input
                  type="number"
                  min={0}
                  max={c.maxScore}
                  step={0.5}
                  className="neu-input !h-11 max-w-[90px] text-center font-semibold"
                  value={scores[c.id] ?? ""}
                  onChange={(e) => setScores((p) => ({ ...p, [c.id]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="neu-field-label">Nhận xét *</span>
            <textarea
              className="neu-input !h-auto min-h-[100px] py-3 resize-y text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhận xét sau buổi phỏng vấn..."
            />
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="soft" disabled={saving} onClick={() => void handleSave()}>
            Lưu điểm
          </Button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleDecision("fail")}
            className="inline-flex h-12 items-center rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white shadow-extruded-sm disabled:opacity-50"
          >
            Không đạt
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleDecision("pass")}
            className="inline-flex h-12 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-white shadow-extruded-sm disabled:opacity-50"
          >
            Đạt (Pass)
          </button>
        </footer>
      </div>
    </div>
  );
}

export default InterviewScoreModal;
