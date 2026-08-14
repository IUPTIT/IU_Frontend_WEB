import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Send,
} from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import TrainingChatWidget from "../../../../components/training/TrainingChatWidget";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import {
  addTaskProgressLog,
  getMyMentorTasks,
  getMyTraining,
  submitMentorTask,
  type MyMentorTask,
  type MyTraining,
} from "../../../../services/trainingService";
import { ensureHttpUrl } from "../../../../utils/url";
import { formatDate } from "../../../../utils/formatDate";

type StepKey = "backlog" | "progress" | "review" | "done";

const STEPS: {
  key: StepKey;
  label: string;
  icon: typeof Archive;
}[] = [
  { key: "backlog", label: "Backlog", icon: Archive },
  { key: "progress", label: "In Progress", icon: Clock3 },
  { key: "review", label: "Reviewing", icon: MessageSquareText },
  { key: "done", label: "Completed", icon: CheckCircle2 },
];

function stepFromTask(task: MyMentorTask): StepKey {
  if (task.status === "approved") return "done";
  if (task.status === "submitted") return "review";
  if (
    task.workStartedAt ||
    (task.progressLogs && task.progressLogs.length > 0) ||
    task.status === "rejected"
  ) {
    return "progress";
  }
  return "backlog";
}

type Props = {
  taskId: string;
  tasksBasePath: string;
};

/**
 * Chi tiết nhiệm vụ + cập nhật tiến độ (nhật ký) — Soft UI, API thật.
 */
export default function TrainingTaskDetailPage({
  taskId,
  tasksBasePath,
}: Props) {
  const { navigate } = usePortalUi();
  const toast = useToast();
  const [me, setMe] = useState<MyTraining | null>(null);
  const [task, setTask] = useState<MyMentorTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [logDraft, setLogDraft] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const training = await getMyTraining();
    setMe(training);
    if (!training) {
      setTask(null);
      return;
    }
    const list = await getMyMentorTasks(training.trainee.id);
    const found = list.find((t) => t.id === taskId) ?? null;
    setTask(found);
    if (found) {
      setUrl(found.submissionUrl ?? "");
      setNote(found.submissionNote ?? "");
    }
  }, [taskId]);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => {
        if (alive) toast.error("Không tải được task.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load, toast]);

  const activeStep = task ? stepFromTask(task) : "backlog";
  const activeIdx = STEPS.findIndex((s) => s.key === activeStep);

  const timeline = useMemo(() => {
    if (!task) return [];
    const items: {
      id: string;
      title: string;
      body?: string;
      at?: string;
      tone: "me" | "mentor" | "system";
    }[] = [];
    for (const log of [...(task.progressLogs ?? [])].reverse()) {
      items.push({
        id: `log-${log.createdAt}-${log.content.slice(0, 12)}`,
        title: "Cập nhật tiến độ",
        body: log.content,
        at: log.createdAt,
        tone: "me",
      });
    }
    if (task.submittedAt) {
      items.push({
        id: "submitted",
        title: "Đã nộp bài — chờ mentor review",
        body: task.submissionNote,
        at: task.submittedAt,
        tone: "system",
      });
    }
    if (task.feedback || task.score != null) {
      items.push({
        id: "feedback",
        title: "Phản hồi từ Mentor",
        body:
          [
            task.score != null ? `Điểm: ${task.score}/10` : null,
            task.feedback || null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
        at: task.reviewedAt,
        tone: "mentor",
      });
    }
    return items;
  }, [task]);

  const canEdit =
    task != null &&
    (task.status === "assigned" ||
      task.status === "rejected" ||
      task.status === "submitted");

  const handleLog = async () => {
    if (!task || !logDraft.trim()) return;
    setSaving(true);
    try {
      await addTaskProgressLog(task.id, logDraft.trim());
      setLogDraft("");
      toast.success("Đã gửi nhật ký tiến độ.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi nhật ký thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;
    if (!url.trim() && !note.trim()) {
      toast.info("Nhập link bài nộp hoặc ghi chú trước khi nộp.");
      return;
    }
    setSaving(true);
    try {
      await submitMentorTask(task.id, {
        submissionUrl: url.trim() ? ensureHttpUrl(url) : undefined,
        submissionNote: note.trim() || undefined,
      });
      toast.success("Đã nộp bài cho mentor.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nộp bài thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="ui-card h-64 animate-pulse" aria-busy="true" />;
  }

  if (!me || !task) {
    return (
      <section className="ui-card !p-10 text-center space-y-3">
        <p className="text-muted">Không tìm thấy nhiệm vụ này.</p>
        <Button variant="secondary" onClick={() => navigate(tasksBasePath)}>
          Quay lại danh sách task
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <nav className="text-sm text-muted">
            Đào tạo ›{" "}
            <button
              type="button"
              className="hover:text-accent"
              onClick={() => navigate(tasksBasePath)}
            >
              Nhiệm vụ & Bài tập
            </button>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {task.title}
            </h1>
            <Badge tone="violet">TASK</Badge>
          </div>
          <p className="text-sm text-muted">
            {task.deadline ? `Hạn nộp: ${formatDate(task.deadline)}` : "Không hạn"}
            {task.groupName ? ` · ${task.groupName}` : ""}
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <article className="ui-card !p-5 space-y-4">
            <h2 className="font-display text-lg font-bold">Cập nhật trạng thái</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {STEPS.map((s, i) => {
                const done = i < activeIdx;
                const active = i === activeIdx;
                return (
                  <div
                    key={s.key}
                    className="flex min-w-[72px] flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
                        done
                          ? "bg-emerald-500 text-white shadow-soft-sm"
                          : active
                            ? "bg-accent text-white shadow-soft-sm"
                            : "bg-background text-muted shadow-hairline"
                      }`}
                    >
                      <Icon icon={s.icon} size={18} />
                    </span>
                    <p
                      className={`text-[11px] font-semibold ${
                        active ? "text-accent" : "text-muted"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="rounded-2xl bg-background px-3 py-2.5 text-xs text-muted shadow-hairline">
              Bạn đang ở <b className="text-foreground">{STEPS[activeIdx]?.label}</b>
              . Cập nhật nhật ký bên phải để mentor theo dõi tiến độ.
            </p>
          </article>

          <article className="ui-card !p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Chi tiết nhiệm vụ</h2>
              <Badge
                tone={
                  task.status === "approved"
                    ? "success"
                    : task.status === "submitted"
                      ? "accent"
                      : task.status === "rejected"
                        ? "danger"
                        : "violet"
                }
              >
                {task.status}
              </Badge>
            </div>
            {task.description ? (
              <p className="text-sm text-muted whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-muted">Mentor chưa thêm mô tả.</p>
            )}
            {task.attachmentUrl && (
              <a
                className="inline-flex text-sm text-accent underline"
                href={task.attachmentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Tài liệu đính kèm
              </a>
            )}

            {canEdit && task.status !== "submitted" && (
              <div className="space-y-3 border-t border-black/5 pt-4">
                <h3 className="text-sm font-bold">Nộp bài chính thức</h3>
                <input
                  className="ui-input !h-11"
                  placeholder="https://github.com/... hoặc Drive"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <textarea
                  className="ui-input min-h-[72px] text-sm"
                  placeholder="Ghi chú kèm bài nộp..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  variant="primary"
                  disabled={saving}
                  onClick={() => void handleSubmit()}
                  leftIcon={<Icon icon={Send} size={16} />}
                >
                  Xác nhận nộp bài
                </Button>
              </div>
            )}
          </article>
        </div>

        <div className="space-y-5">
          <article className="ui-card !p-5 space-y-3">
            <h2 className="font-display text-lg font-bold">Nhật ký hoạt động</h2>
            {task.status !== "approved" && (
              <div className="space-y-2">
                <textarea
                  className="ui-input min-h-[80px] text-sm"
                  placeholder="Thêm ghi chú tiến độ nhanh..."
                  value={logDraft}
                  onChange={(e) => setLogDraft(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={saving || !logDraft.trim()}
                  onClick={() => void handleLog()}
                  leftIcon={<Icon icon={Send} size={14} />}
                >
                  Gửi nhật ký
                </Button>
              </div>
            )}
            <ul className="space-y-2 max-h-[360px] overflow-y-auto">
              {timeline.length === 0 ? (
                <li className="py-6 text-center text-xs text-muted">
                  Chưa có nhật ký — hãy gửi cập nhật đầu tiên.
                </li>
              ) : (
                timeline.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-2xl px-3 py-2.5 text-sm shadow-hairline ${
                      item.tone === "mentor"
                        ? "bg-accent/10"
                        : "bg-background"
                    }`}
                  >
                    <p className="font-semibold">{item.title}</p>
                    {item.body && (
                      <p className="mt-0.5 text-xs text-muted whitespace-pre-wrap">
                        {item.body}
                      </p>
                    )}
                    {item.at && (
                      <p className="mt-1 text-[10px] text-muted">
                        {formatDate(item.at)}
                      </p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </article>

          <article className="ui-card !p-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              Hỗ trợ bởi Mentor
            </p>
            <div className="flex items-center gap-3">
              <Avatar name={me.group?.mentorName ?? "Mentor"} size="md" />
              <div className="min-w-0">
                <p className="font-semibold">
                  {me.group?.mentorName ?? me.trainee.mentorName ?? "—"}
                </p>
                <p className="text-xs text-muted">
                  {me.group?.name ?? "Nhóm training"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">
              Nhắn tin qua linh vật góc phải hoặc kênh chat nhóm.
            </p>
          </article>
        </div>
      </div>

      {me.group && (
        <TrainingChatWidget
          groups={[
            {
              id: me.group.id,
              name: me.group.name,
              subtitle: me.group.mentorName
                ? `Mentor: ${me.group.mentorName}`
                : "Nhóm training",
            },
          ]}
        />
      )}
    </section>
  );
}
