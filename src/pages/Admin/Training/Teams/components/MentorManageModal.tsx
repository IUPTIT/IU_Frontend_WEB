import { useEffect, useState } from "react";
import Button from "../../../../../components/ui/Button";
import {
  getMentorCandidates,
  setMentorFlag,
  type MentorCandidate,
} from "../../../../../services/trainingService";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Gọi khi có thay đổi để trang cha reload danh sách mentor */
  onChanged: () => void;
};

/** BCN đẩy/gỡ quyền mentor cho member — mentor dẫn team vòng training */
function MentorManageModal({ open, onClose, onChanged }: Props) {
  const [candidates, setCandidates] = useState<MentorCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    void getMentorCandidates()
      .then((list) => alive && setCandidates(list))
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được danh sách");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open]);

  if (!open) return null;

  const toggle = async (c: MentorCandidate) => {
    setBusyId(c.id);
    setError(null);
    try {
      await setMentorFlag(c.id, !c.isMentor);
      setCandidates((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, isMentor: !c.isMentor } : x)),
      );
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-manage-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-soft"
      >
        <header className="border-b border-black/5 px-5 py-4">
          <h2 id="mentor-manage-title" className="font-display text-xl font-extrabold">
            Quản lý mentor
          </h2>
          <p className="mt-1 text-sm text-muted">
            Đẩy quyền Mentor training cho Member CLB — mentor tự tạo lộ trình và
            dẫn team tân binh. Quyền này độc lập với Leader Ban.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-accent/5" aria-busy="true" />
          ) : (
            <ul className="space-y-1">
              {candidates.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {c.name}{" "}
                      <span className="text-xs font-normal text-muted">({c.roleLabel})</span>
                    </p>
                    <p className="truncate text-xs text-muted">{c.email}</p>
                  </div>
                  <Button
                    variant={c.isMentor ? "secondary" : "primary"}
                    size="sm"
                    className="!h-9 shrink-0"
                    disabled={busyId === c.id}
                    onClick={() => void toggle(c)}
                  >
                    {c.isMentor ? "Gỡ mentor" : "Đẩy làm mentor"}
                  </Button>
                </li>
              ))}
              {candidates.length === 0 && (
                <li className="px-3 py-10 text-center text-sm text-muted">
                  Chưa có thành viên CLB chính thức trong hệ thống.
                </li>
              )}
            </ul>
          )}
          {error && <p className="px-3 pt-2 text-sm text-rose-500">{error}</p>}
        </div>

        <footer className="flex justify-end border-t border-black/5 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default MentorManageModal;
