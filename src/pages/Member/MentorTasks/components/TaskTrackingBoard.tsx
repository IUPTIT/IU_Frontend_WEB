import { useState } from "react";
import { Eye } from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { formatDate } from "../../../../utils/formatDate";
import { reviewMentorTask } from "../../../../services/trainingService";
import {
  ROW_STATUS_CLASS,
  ROW_STATUS_LABEL,
  type TrackRow,
} from "./taskTracking";

type Props = {
  rows: TrackRow[];
  onReviewed: () => void;
};

export default function TaskTrackingBoard({ rows, onReviewed }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = rows.find((r) => r.key === openKey) ?? null;

  return (
    <section className="ui-card !p-5 space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Bảng theo dõi task</h2>
        <p className="text-xs text-muted">
          Hiển thị {rows.length} assignment từ dữ liệu thật
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Chưa có task nào — giao task ở form bên trái để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-muted">
                <th className="pb-3 font-semibold">Thành viên</th>
                <th className="pb-3 font-semibold">Task hiện tại</th>
                <th className="pb-3 font-semibold">Hạn chót</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
                <th className="pb-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map((r) => (
                <tr key={r.key} className="align-middle">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.assignment.traineeName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {r.assignment.traineeName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {r.assignment.traineeEmail ?? r.groupName ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="font-medium line-clamp-2">{r.taskTitle}</p>
                    {r.groupName && (
                      <p className="text-xs text-muted">{r.groupName}</p>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-muted">
                    {r.deadline ? formatDate(r.deadline) : "—"}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${ROW_STATUS_CLASS[r.rowStatus]}`}
                    >
                      {ROW_STATUS_LABEL[r.rowStatus]}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="icon"
                      size="sm"
                      aria-label="Xem / chấm"
                      onClick={() => setOpenKey(r.key)}
                    >
                      <Icon icon={Eye} size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <ReviewDrawer
          row={open}
          onClose={() => setOpenKey(null)}
          onReviewed={() => {
            setOpenKey(null);
            onReviewed();
          }}
        />
      )}
    </section>
  );
}

function ReviewDrawer({
  row,
  onClose,
  onReviewed,
}: {
  row: TrackRow;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const a = row.assignment;
  const [score, setScore] = useState(a.score != null ? String(a.score) : "");
  const [feedback, setFeedback] = useState(a.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canReview = a.status === "submitted" || a.status === "approved";

  const handleReview = async (status: "approved" | "rejected") => {
    const parsed = score.trim() === "" ? undefined : Number.parseFloat(score);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 10)) {
      setError("Điểm phải từ 0 đến 10.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await reviewMentorTask(row.taskId, a.traineeId, {
        status,
        feedback: feedback.trim() || undefined,
        score: parsed,
      });
      onReviewed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chấm bài thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
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
        className="relative z-10 flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-soft"
      >
        <header className="border-b border-black/5 px-5 py-4">
          <h3 className="font-display text-xl font-extrabold">{row.taskTitle}</h3>
          <p className="text-sm text-muted">
            {a.traineeName}
            {row.deadline ? ` · Hạn ${formatDate(row.deadline)}` : ""}
          </p>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 text-sm">
          {row.description && (
            <p className="text-muted whitespace-pre-wrap">{row.description}</p>
          )}
          {row.attachmentUrl && (
            <a
              className="text-accent underline"
              href={row.attachmentUrl}
              target="_blank"
              rel="noreferrer"
            >
              Tài liệu đính kèm
            </a>
          )}
          {a.submissionUrl && (
            <p>
              Bài nộp:{" "}
              <a
                className="text-accent underline"
                href={a.submissionUrl}
                target="_blank"
                rel="noreferrer"
              >
                {a.submissionUrl}
              </a>
            </p>
          )}
          {a.submissionNote && (
            <p className="text-muted">Ghi chú: {a.submissionNote}</p>
          )}
          {a.status === "approved" && a.score != null && (
            <p>
              Điểm hiện tại: <b className="text-accent">{a.score}/10</b>
            </p>
          )}

          {canReview ? (
            <div className="space-y-2 border-t border-black/5 pt-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="ui-input !h-10 w-24"
                  placeholder="Điểm"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
                <input
                  className="ui-input !h-10 flex-1"
                  placeholder="Nhận xét..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => void handleReview("approved")}
                >
                  Duyệt
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 !text-rose-600"
                  disabled={saving}
                  onClick={() => void handleReview("rejected")}
                >
                  Trả lại
                </Button>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-background px-3 py-2 text-xs text-muted shadow-hairline">
              Tân binh chưa nộp bài — chờ submission trước khi chấm.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
