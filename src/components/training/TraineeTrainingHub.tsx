import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { formatDate } from "../../utils/formatDate";
import {
  submitMentorTask,
  type MyMentorTask,
  type MyTraining,
} from "../../services/trainingService";

const TASK_STATUS_LABEL: Record<MyMentorTask["status"], string> = {
  assigned: "Chưa nộp",
  submitted: "Đã nộp — chờ chấm",
  approved: "Đã duyệt",
  rejected: "Bị trả lại — nộp lại",
};

const TASK_STATUS_TONE: Record<
  MyMentorTask["status"],
  "violet" | "accent" | "success" | "danger"
> = {
  assigned: "violet",
  submitted: "accent",
  approved: "success",
  rejected: "danger",
};

/** Thẻ task nộp bài — dùng chung Candidate / Member (kế thừa soft-UI Admin) */
export function TrainingTaskCard({
  task,
  onSubmitted,
}: {
  task: MyMentorTask;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(task.submissionUrl ?? "");
  const [note, setNote] = useState(task.submissionNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = task.status === "assigned" || task.status === "rejected";

  const handleSubmit = async () => {
    if (!url.trim() && !note.trim()) {
      setError("Nhập link bài nộp hoặc ghi chú.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await submitMentorTask(task.id, {
        submissionUrl: url.trim() || undefined,
        submissionNote: note.trim() || undefined,
      });
      setOpen(false);
      onSubmitted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nộp bài thất bại — thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="neu-card !p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold">{task.title}</h3>
        <Badge tone={TASK_STATUS_TONE[task.status]}>
          {TASK_STATUS_LABEL[task.status]}
        </Badge>
      </div>
      {task.description && (
        <p className="text-sm text-muted">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        {task.deadline && <span>Hạn nộp: {formatDate(task.deadline)}</span>}
        {task.attachmentUrl && (
          <a
            className="text-accent underline"
            href={task.attachmentUrl}
            target="_blank"
            rel="noreferrer"
          >
            Tài liệu đính kèm
          </a>
        )}
      </div>

      {(task.status === "approved" ||
        task.status === "rejected" ||
        task.status === "submitted") &&
        (task.score != null || task.feedback) && (
          <div className="rounded-2xl bg-accent/8 p-3 text-sm shadow-inset-sm">
            {task.score != null && (
              <p>
                Điểm: <b className="text-accent">{task.score}/10</b>
              </p>
            )}
            {task.feedback && (
              <p className="mt-1 text-muted">Nhận xét: {task.feedback}</p>
            )}
          </div>
        )}

      {task.submissionUrl && !open && (
        <p className="text-xs text-muted">
          Bài đã nộp:{" "}
          <a
            className="text-accent underline"
            href={task.submissionUrl}
            target="_blank"
            rel="noreferrer"
          >
            {task.submissionUrl}
          </a>
        </p>
      )}

      {canSubmit &&
        (open ? (
          <div className="space-y-2">
            <input
              className="neu-input !h-10 text-sm"
              placeholder="Link bài nộp (Drive, GitHub...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <textarea
              className="neu-input !h-auto min-h-[70px] resize-y py-2 text-sm"
              placeholder="Ghi chú thêm (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={saving}
                onClick={() => void handleSubmit()}
              >
                {saving ? "Đang nộp..." : "Xác nhận nộp"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpen(true)}
            leftIcon={<Icon icon={Send} size={14} />}
          >
            {task.status === "rejected" ? "Nộp lại" : "Nộp bài"}
          </Button>
        ))}
    </article>
  );
}

export function TrainingTeamPanel({ training }: { training: MyTraining }) {
  const { trainee, group } = training;
  return (
    <section className="neu-card !p-6 space-y-4">
      <h2 className="font-display text-lg font-bold">Team của bạn</h2>
      {group ? (
        <>
          <p className="font-bold text-accent">{group.name}</p>
          <div className="rounded-2xl bg-background px-3 py-3 shadow-inset-sm flex items-center gap-3">
            <Avatar name={group.mentorName ?? "?"} size="md" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Mentor phụ trách
              </p>
              <p className="text-sm font-semibold">
                {group.mentorName ?? trainee.mentorName ?? "—"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Ban: {group.specialtyLabel || trainee.departmentName} · Thành viên:{" "}
            {group.memberIds.length}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">
          Chưa được chia team — chờ Ban Chủ nhiệm chia đội.
        </p>
      )}
    </section>
  );
}

export function TrainingRoadmapPanel({ training }: { training: MyTraining }) {
  const { program } = training;
  return (
    <section className="neu-card !p-6 space-y-3">
      <h2 className="font-display text-lg font-bold">Lộ trình đào tạo</h2>
      {program ? (
        <>
          <p className="text-sm font-semibold text-accent">{program.name}</p>
          <ol className="space-y-2">
            {[...program.stages]
              .sort((a, b) => a.order - b.order)
              .map((s) => {
                const lessons = program.lessons.filter(
                  (l) => l.stageId === s.id,
                );
                return (
                  <li
                    key={s.id}
                    className="rounded-2xl bg-background p-3 shadow-inset-sm"
                  >
                    <p className="text-sm font-semibold">
                      {s.order}. {s.name}
                      {s.weekLabel && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {s.weekLabel}
                        </span>
                      )}
                    </p>
                    {lessons.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {lessons.map((l) => (
                          <li key={l.id} className="text-xs text-muted">
                            •{" "}
                            {l.attachmentUrl ? (
                              <a
                                className="text-accent underline"
                                href={l.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {l.title}
                              </a>
                            ) : (
                              l.title
                            )}
                            {l.durationLabel && ` (${l.durationLabel})`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ol>
        </>
      ) : (
        <p className="text-sm text-muted">Mentor chưa gán lộ trình cho team.</p>
      )}
    </section>
  );
}

/** Hub đầy đủ: nhóm + lộ trình + task — layout 2 cột như Admin soft-UI */
export function TraineeTrainingHub({
  title,
  subtitle,
  training,
  tasks,
  onReload,
  emptyMessage,
}: {
  title: string;
  subtitle?: string;
  training: MyTraining | null;
  tasks: MyMentorTask[];
  onReload: () => void;
  emptyMessage?: string;
}) {
  if (!training) {
    return (
      <section className="neu-card !p-8 text-center">
        <p className="text-muted">
          {emptyMessage ??
            "Bạn chưa vào chương trình đào tạo thành viên mới. Khi trúng tuyển và được bàn giao training, nội dung sẽ hiện tại đây."}
        </p>
      </section>
    );
  }

  const { trainee } = training;

  return (
    <>
      <section className="space-y-2">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Training của tôi</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="text-muted">
          {subtitle ??
            `${trainee.cohortLabel ?? "Tân binh"} · Ban ${trainee.departmentName}`}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <TrainingTeamPanel training={training} />
          <TrainingRoadmapPanel training={training} />
        </div>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">
            Task mentor giao ({tasks.length})
          </h2>
          {tasks.length === 0 ? (
            <div className="neu-card !p-8 text-center">
              <p className="text-sm text-muted">Mentor chưa giao task nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {tasks.map((t) => (
                <TrainingTaskCard
                  key={t.id}
                  task={t}
                  onSubmitted={onReload}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
