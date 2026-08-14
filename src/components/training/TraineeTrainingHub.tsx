import { useMemo, useRef, useState, type RefObject } from "react";
import {
  Check,
  Code2,
  FileText,
  Lock,
  Paperclip,
  Rocket,
  Send,
  Upload,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { formatDate } from "../../utils/formatDate";
import { ensureHttpUrl } from "../../utils/url";
import {
  submitMentorTask,
  type MyMentorTask,
  type MyTraining,
} from "../../services/trainingService";
import type { TrainingProgram } from "../../types/training";
import TrainingChatPanel from "./TrainingChatPanel";
import TrainingChatWidget from "./TrainingChatWidget";

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

/** Thẻ task nộp bài — dùng chung Candidate / Member */
export function TrainingTaskCard({
  task,
  onSubmitted,
  onOpenDetail,
}: {
  task: MyMentorTask;
  onSubmitted: () => void;
  onOpenDetail?: () => void;
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
        submissionUrl: url.trim() ? ensureHttpUrl(url) : undefined,
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
    <article className="ui-card !p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        {onOpenDetail ? (
          <button
            type="button"
            className="text-left font-display text-lg font-bold hover:text-accent"
            onClick={onOpenDetail}
          >
            {task.title}
          </button>
        ) : (
          <h3 className="font-display text-lg font-bold">{task.title}</h3>
        )}
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
          <div className="rounded-2xl bg-accent/8 p-3 text-sm shadow-hairline">
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

      <div className="flex flex-wrap gap-2">
        {onOpenDetail && (
          <Button variant="secondary" size="sm" onClick={onOpenDetail}>
            Cập nhật tiến độ
          </Button>
        )}
        {canSubmit &&
          (open ? null : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setOpen(true)}
              leftIcon={<Icon icon={Send} size={14} />}
            >
              {task.status === "rejected" ? "Nộp lại" : "Nộp bài"}
            </Button>
          ))}
      </div>

      {canSubmit && open && (
        <div className="space-y-2">
          <input
            className="ui-input !h-10 text-sm"
            placeholder="Link bài nộp (Drive, GitHub...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            className="ui-input !h-auto min-h-[70px] resize-y py-2 text-sm"
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
      )}
    </article>
  );
}

export function TrainingTeamPanel({ training }: { training: MyTraining }) {
  const { trainee, group } = training;
  return (
    <section className="ui-card !p-5 space-y-4">
      <h2 className="font-display text-lg font-bold">Nhóm & Mentor</h2>
      {group ? (
        <>
          <div className="rounded-2xl bg-background px-3 py-3 shadow-hairline flex items-center gap-3">
            <Avatar name={group.mentorName ?? "?"} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {group.mentorName ?? trainee.mentorName ?? "—"}
                </p>
                <Badge tone="violet">MENTOR</Badge>
              </div>
              <p className="text-xs text-muted">{group.name}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Thành viên ({group.memberIds.length})
            </p>
            <p className="mt-1 text-xs text-muted">
              Ban: {group.specialtyLabel || trainee.departmentName}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">
          Chưa được chia team — chờ Ban Chủ nhiệm chia đội.
        </p>
      )}
    </section>
  );
}

/** Horizontal stage stepper — tiến độ suy ra từ % task duyệt (không fake XP) */
export function RoadmapStageStepper({
  program,
  percentComplete,
}: {
  program: TrainingProgram | null;
  percentComplete: number;
}) {
  const stages = useMemo(() => {
    if (!program?.stages?.length) return [];
    return [...program.stages].sort((a, b) => a.order - b.order);
  }, [program]);

  if (stages.length === 0) {
    return (
      <section className="ui-card !p-6">
        <p className="text-sm text-muted">
          Mentor chưa gán lộ trình cho team.
        </p>
      </section>
    );
  }

  const activeIdx = Math.min(
    stages.length - 1,
    Math.floor(
      (Math.min(100, Math.max(0, percentComplete)) / 100) * stages.length,
    ),
  );

  const icons = [Check, Code2, FileText, Rocket];

  return (
    <section className="ui-card !p-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-lg font-bold">
          {program?.name ?? "Lộ trình training"}
        </h2>
        <p className="text-xs font-semibold text-accent">
          Tiến độ task: {percentComplete}%
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {stages.map((s, i) => {
          const done = i < activeIdx || percentComplete >= 100;
          const active = i === activeIdx && percentComplete < 100;
          const locked = i > activeIdx;
          const IconComp = locked ? Lock : icons[i % icons.length];
          return (
            <div
              key={s.id}
              className={`flex min-w-[140px] flex-1 flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center ${
                active
                  ? "bg-accent/15 shadow-soft-sm"
                  : done
                    ? "bg-emerald-500/10"
                    : "bg-background shadow-hairline opacity-70"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-accent text-white"
                      : "bg-black/5 text-muted"
                }`}
              >
                <Icon icon={IconComp} size={18} />
              </span>
              <p className="text-xs font-bold line-clamp-2">{s.name}</p>
              <p className="text-[10px] text-muted">
                {done ? "Hoàn thành" : active ? "Đang học" : "Chưa mở"}
                {s.weekLabel ? ` · ${s.weekLabel}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TrainingRoadmapPanel({ training }: { training: MyTraining }) {
  const { program } = training;
  return (
    <section className="ui-card !p-6 space-y-3">
      <h2 className="font-display text-lg font-bold">Lộ trình đào tạo</h2>
      {program ? (
        <>
          <p className="font-semibold text-accent">{program.name}</p>
          <ol className="space-y-3">
            {[...program.stages]
              .sort((a, b) => a.order - b.order)
              .map((stage) => {
                const lessons = program.lessons.filter(
                  (l) => l.stageId === stage.id,
                );
                return (
                  <li key={stage.id} className="space-y-1">
                    <p className="text-sm font-semibold">
                      {stage.order}. {stage.name}
                      {stage.weekLabel ? (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {stage.weekLabel}
                        </span>
                      ) : null}
                    </p>
                    {lessons.length > 0 && (
                      <ul className="ml-3 space-y-0.5 border-l border-black/10 pl-3 text-xs text-muted">
                        {lessons.map((l) => (
                          <li key={l.id}>
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

function SubmitPanel({
  task,
  onSubmitted,
  panelRef,
  urlInputRef,
}: {
  task: MyMentorTask | null;
  onSubmitted: () => void;
  panelRef?: RefObject<HTMLElement | null>;
  urlInputRef?: RefObject<HTMLInputElement | null>;
}) {
  const [url, setUrl] = useState(task?.submissionUrl ?? "");
  const [note, setNote] = useState(task?.submissionNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task) {
    return (
      <section
        ref={panelRef}
        id="trainee-submit-panel"
        className="ui-card !p-6 text-center text-sm text-muted"
      >
        Chọn một task bên trái để nộp bài.
      </section>
    );
  }

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
        submissionUrl: url.trim() ? ensureHttpUrl(url) : undefined,
        submissionNote: note.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nộp bài thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      ref={panelRef}
      id="trainee-submit-panel"
      className="ui-card !p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Nộp bài làm</h2>
        <Badge tone={TASK_STATUS_TONE[task.status]}>
          {TASK_STATUS_LABEL[task.status]}
        </Badge>
      </div>
      <p className="text-sm font-semibold">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      {canSubmit ? (
        <>
          <div className="ui-well rounded-2xl px-4 py-6 text-center">
            <Icon icon={Upload} size={28} className="mx-auto text-muted" />
            <p className="mt-2 text-sm font-medium">Dán link bài làm</p>
            <p className="text-xs text-muted">
              Drive, GitHub, Figma… (không upload file trực tiếp)
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="ui-field-label">Link bài làm</span>
            <input
              ref={urlInputRef}
              className="ui-input !h-11"
              placeholder="https://github.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="ui-field-label">Ghi chú cho mentor</span>
            <textarea
              className="ui-input !h-auto min-h-[72px] resize-y py-2 text-sm"
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button
            variant="primary"
            className="w-full"
            disabled={saving}
            onClick={() => void handleSubmit()}
            leftIcon={<Icon icon={Send} size={16} />}
          >
            {saving ? "Đang nộp..." : "Xác nhận nộp bài"}
          </Button>
        </>
      ) : (
        <div className="space-y-2 text-sm">
          {task.submissionUrl && (
            <p>
              Đã nộp:{" "}
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
          {task.score != null && (
            <p>
              Điểm: <b className="text-accent">{task.score}/10</b>
            </p>
          )}
          {task.feedback && (
            <p className="text-muted">Nhận xét: {task.feedback}</p>
          )}
        </div>
      )}
    </section>
  );
}

/** Hub tân binh: lộ trình ngang + task + nộp bài + nhóm/chat — data thật */
export function TraineeTrainingHub({
  title,
  subtitle,
  training,
  tasks,
  onReload,
  emptyMessage,
  progressPercent = 0,
  onOpenTaskDetail,
}: {
  title: string;
  subtitle?: string;
  training: MyTraining | null;
  tasks: MyMentorTask[];
  onReload: () => void;
  emptyMessage?: string;
  progressPercent?: number;
  onOpenTaskDetail?: (taskId: string) => void;
}) {
  const submitPanelRef = useRef<HTMLElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const openTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === "assigned" ||
          t.status === "rejected" ||
          t.status === "submitted",
      ),
    [tasks],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    tasks.find((t) => t.id === selectedId) ??
    openTasks[0] ??
    tasks[0] ??
    null;

  const focusSubmit = () => {
    const firstOpen = tasks.find(
      (t) => t.status === "assigned" || t.status === "rejected",
    );
    if (firstOpen) setSelectedId(firstOpen.id);
    window.requestAnimationFrame(() => {
      submitPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      window.setTimeout(() => urlInputRef.current?.focus(), 280);
    });
  };

  if (!training) {
    return (
      <section className="ui-card !p-8 text-center">
        <p className="text-muted">
          {emptyMessage ??
            "Bạn chưa vào chương trình đào tạo thành viên mới. Khi trúng tuyển và được bàn giao training, nội dung sẽ hiện tại đây."}
        </p>
      </section>
    );
  }

  const { trainee, program, group } = training;
  const incomplete = tasks.filter((t) => t.status !== "approved").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted">
            Đào tạo ›{" "}
            <span className="text-foreground/80">Training của tôi</span>
          </nav>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="text-muted max-w-xl text-sm">
            {subtitle ??
              `Tiếp tục hành trình tại Ban ${trainee.departmentName}${
                trainee.cohortLabel ? ` · ${trainee.cohortLabel}` : ""
              }.`}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={focusSubmit}
          leftIcon={<Icon icon={Upload} size={16} />}
        >
          Nộp bài mới
        </Button>
      </header>

      <RoadmapStageStepper
        program={program}
        percentComplete={progressPercent}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_320px]">
        <section className="ui-card !p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Bài tập hiện tại</h2>
            {incomplete > 0 && (
              <Badge tone="danger">{incomplete} chưa xong</Badge>
            )}
          </div>
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Mentor chưa giao task nào.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => {
                const active = selected?.id === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full rounded-2xl px-3 py-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        active
                          ? "bg-accent/12 shadow-hairline ring-1 ring-accent/20"
                          : "bg-background shadow-soft-sm hover:-translate-y-px hover:shadow-soft"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold line-clamp-2">
                          {t.title}
                        </p>
                        <Badge tone={TASK_STATUS_TONE[t.status]}>
                          {TASK_STATUS_LABEL[t.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {t.deadline
                          ? `Hạn ${formatDate(t.deadline)}`
                          : TASK_STATUS_LABEL[t.status]}
                      </p>
                      {t.attachmentUrl && (
                        <a
                          className="mt-1 inline-flex items-center gap-1 text-xs text-accent underline"
                          href={t.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon icon={Paperclip} size={12} />
                          Tài liệu
                        </a>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-3">
          <SubmitPanel
            key={selected?.id ?? "none"}
            task={selected}
            onSubmitted={onReload}
            panelRef={submitPanelRef}
            urlInputRef={urlInputRef}
          />
          {selected && onOpenTaskDetail && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onOpenTaskDetail(selected.id)}
            >
              Cập nhật tiến độ chi tiết
            </Button>
          )}
        </div>

        <div className="space-y-5">
          <TrainingTeamPanel training={training} />
          {group && (
            <section className="ui-card !p-0 overflow-hidden flex flex-col min-h-[320px]">
              <div className="border-b border-foreground/5 px-5 py-3">
                <h2 className="font-display text-lg font-bold">
                  Kênh trao đổi
                </h2>
                <p className="text-xs text-muted">{group.name}</p>
              </div>
              <div className="flex min-h-[260px] flex-1 flex-col">
                <TrainingChatPanel
                  groupId={group.id}
                  embedded
                  title="Kênh trao đổi"
                  subtitle={
                    group.mentorName
                      ? `Mentor: ${group.mentorName}`
                      : undefined
                  }
                />
              </div>
            </section>
          )}
        </div>
      </div>

      {group && (
        <TrainingChatWidget
          groups={[
            {
              id: group.id,
              name: group.name,
              subtitle: group.mentorName
                ? `Mentor: ${group.mentorName}`
                : "Nhóm training",
            },
          ]}
        />
      )}
    </div>
  );
}
