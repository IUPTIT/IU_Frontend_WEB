import { useCallback, useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import Select from "../../../components/ui/Select";
import { useAuth } from "../../../context/useAuth";
import { formatDate } from "../../../utils/formatDate";
import Avatar from "../../../components/ui/Avatar";
import {
  createMentorTask,
  getMentorTasks,
  getMyTeamTrainees,
  getTrainingGroups,
  reviewMentorTask,
  saveMentorTraineeReview,
  type MentorTask,
  type MentorTaskAssignment,
} from "../../../services/trainingService";
import type { Trainee, TrainingGroup } from "../../../types/training";

const STATUS_LABEL: Record<MentorTaskAssignment["status"], string> = {
  assigned: "Chưa nộp",
  submitted: "Chờ chấm",
  approved: "Đã duyệt",
  rejected: "Trả lại",
};

const STATUS_TONE: Record<
  MentorTaskAssignment["status"],
  "violet" | "accent" | "success" | "danger"
> = {
  assigned: "violet",
  submitted: "accent",
  approved: "success",
  rejected: "danger",
};

const EVAL_LABEL: Record<string, string> = {
  studying: "Đang training",
  qualified: "Đạt vòng training",
  failed: "Trượt vòng training",
  certified: "Đã cấp chứng nhận",
};

const EVAL_TONE: Record<string, "accent" | "success" | "danger" | "info"> = {
  studying: "accent",
  qualified: "success",
  failed: "danger",
  certified: "info",
};

// Đánh giá QUÁ TRÌNH: mentor ghi note + điểm — quyết định Đạt/Trượt cuối cùng
// là của BCN ở trang Tổng kết training, mentor không chốt
function EvaluationRow({
  trainee,
  onChanged,
}: {
  trainee: Trainee;
  onChanged: (msg: string) => void;
}) {
  const [score, setScore] = useState(
    trainee.avgScore != null ? String(trainee.avgScore) : "",
  );
  const [note, setNote] = useState(trainee.mentorNote ?? "");
  const [saving, setSaving] = useState(false);
  const evalStatus = trainee.evalStatus ?? "studying";
  const submitted = trainee.mentorReviewStatus === "submitted";

  const handleSave = async (submit: boolean) => {
    const parsed = score.trim() === "" ? undefined : Number.parseFloat(score);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 10)) {
      onChanged("Điểm phải từ 0 đến 10.");
      return;
    }
    if (parsed == null && !note.trim()) {
      onChanged("Nhập điểm hoặc note quá trình trước khi lưu.");
      return;
    }
    setSaving(true);
    try {
      await saveMentorTraineeReview(trainee.id, {
        score: parsed ?? null,
        note: note.trim(),
        submit,
      });
      onChanged(
        submit
          ? `Đã gửi kết quả training của ${trainee.fullName} lên BCN.`
          : `Đã lưu nháp đánh giá cho ${trainee.fullName}.`,
      );
    } catch (err) {
      onChanged(err instanceof Error ? err.message : "Lưu đánh giá thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="space-y-2 rounded-2xl bg-background p-3 shadow-inset-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={trainee.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{trainee.fullName}</p>
          <p className="text-xs text-muted">{trainee.email}</p>
        </div>
        <Badge tone={submitted ? "success" : "muted"}>
          {submitted ? "Đã gửi BCN" : "Nháp"}
        </Badge>
        <Badge tone={EVAL_TONE[evalStatus]}>{EVAL_LABEL[evalStatus]}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          min={0}
          max={10}
          step={0.5}
          className="neu-input !h-9 w-24 text-sm"
          placeholder="Điểm"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <input
          className="neu-input !h-9 min-w-[180px] flex-1 text-sm"
          placeholder="Note quá trình: thái độ, tiến bộ, điểm mạnh/yếu..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave(false)}
        >
          Lưu nháp
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave(true)}
          leftIcon={<Icon icon={Send} size={14} />}
        >
          {saving ? "Đang lưu..." : "Gửi BCN"}
        </Button>
      </div>
    </li>
  );
}

// Chấm 1 bài nộp: điểm + nhận xét + duyệt/trả lại
function ReviewRow({
  taskId,
  assignment,
  onReviewed,
}: {
  taskId: string;
  assignment: MentorTaskAssignment;
  onReviewed: () => void;
}) {
  const [score, setScore] = useState(
    assignment.score != null ? String(assignment.score) : "",
  );
  const [feedback, setFeedback] = useState(assignment.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canReview =
    assignment.status === "submitted" || assignment.status === "approved";

  const handleReview = async (status: "approved" | "rejected") => {
    const parsed = score.trim() === "" ? undefined : Number.parseFloat(score);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 10)) {
      setError("Điểm phải từ 0 đến 10.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await reviewMentorTask(taskId, assignment.traineeId, {
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
    <li className="rounded-2xl bg-background p-3 shadow-inset-sm space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{assignment.traineeName}</p>
          {assignment.traineeEmail && (
            <p className="text-xs text-muted">{assignment.traineeEmail}</p>
          )}
        </div>
        <Badge tone={STATUS_TONE[assignment.status]}>
          {STATUS_LABEL[assignment.status]}
        </Badge>
      </div>

      {assignment.submissionUrl && (
        <p className="text-xs">
          Bài nộp:{" "}
          <a
            className="text-accent underline"
            href={assignment.submissionUrl}
            target="_blank"
            rel="noreferrer"
          >
            {assignment.submissionUrl}
          </a>
        </p>
      )}
      {assignment.submissionNote && (
        <p className="text-xs text-muted">
          Ghi chú: {assignment.submissionNote}
        </p>
      )}
      {assignment.status === "approved" && assignment.score != null && (
        <p className="text-xs">
          Điểm: <b className="text-accent">{assignment.score}/10</b>
        </p>
      )}

      {canReview && (
        <div className="space-y-2 border-t border-black/5 pt-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              className="neu-input !h-9 w-24 text-sm"
              placeholder="Điểm"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <input
              className="neu-input !h-9 flex-1 text-sm"
              placeholder="Nhận xét..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={saving}
              onClick={() => void handleReview("approved")}
            >
              Duyệt
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 !text-rose-600"
              disabled={saving}
              onClick={() => void handleReview("rejected")}
            >
              Trả lại
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function CreateTaskForm({
  groups,
  onCancel,
  onCreated,
}: {
  groups: TrainingGroup[];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!groupId) {
      setError("Chọn team để giao task.");
      return;
    }
    if (!title.trim()) {
      setError("Tiêu đề task là bắt buộc.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createMentorTask({
        groupId,
        title: title.trim(),
        description: description.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giao task thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="neu-card !p-6 space-y-4">
      <h2 className="font-display text-lg font-bold">Giao task mới</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="neu-field-label">Team</span>
          <Select
            width="full"
            value={groupId}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            onChange={setGroupId}
            placeholder="Chọn team"
          />
        </div>
        <label className="block space-y-1.5">
          <span className="neu-field-label">Hạn nộp</span>
          <input
            type="datetime-local"
            className="neu-input !h-11"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="neu-field-label">Tiêu đề *</span>
        <input
          className="neu-input !h-11"
          placeholder="VD: Làm landing page giới thiệu CLB"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="neu-field-label">Mô tả</span>
        <textarea
          className="neu-input !h-auto min-h-[90px] resize-y py-2 text-sm"
          placeholder="Yêu cầu, tiêu chí hoàn thành..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="neu-field-label">Link tài liệu</span>
        <input
          className="neu-input !h-11"
          placeholder="https://..."
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={saving}
          onClick={() => void handleCreate()}
          leftIcon={<Icon icon={Send} size={16} />}
        >
          {saving ? "Đang giao..." : "Giao task cho cả team"}
        </Button>
      </div>
    </section>
  );
}

/**
 * Portal mentor: giao task cho team mình dẫn, xem bài nộp và chấm điểm.
 * Backend tự giới hạn: mentor chỉ thấy/thao tác team của mình.
 */
function MentorTasksPage() {
  const { user } = useAuth();
  const isMentor = user?.isMentor === true;

  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [teamTrainees, setTeamTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(isMentor);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    const [t, g, tt] = await Promise.all([
      getMentorTasks(),
      getTrainingGroups(),
      getMyTeamTrainees(),
    ]);
    return { t, g: g.filter((x) => x.mentorId === user?.id), tt };
  }, [user?.id]);

  useEffect(() => {
    if (!isMentor) return;
    let alive = true;
    void load()
      .then(({ t, g, tt }) => {
        if (!alive) return;
        setTasks(t);
        setGroups(g);
        setTeamTrainees(tt);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isMentor, load]);

  const reload = () => {
    void load().then(({ t, g, tt }) => {
      setTasks(t);
      setGroups(g);
      setTeamTrainees(tt);
    });
  };

  if (!isMentor) {
    return (
      <section className="neu-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">Task cho team</h1>
        <p className="text-muted mx-auto max-w-md">
          Bạn chưa được Ban Chủ nhiệm đẩy quyền mentor. Khi trở thành mentor,
          bạn sẽ giao task và chấm bài cho team tân binh tại đây.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <div
        className="neu-card h-64 animate-pulse"
        aria-busy="true"
        aria-label="Đang tải"
      />
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Task cho team
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Giao task cho team tân binh bạn dẫn dắt, theo dõi bài nộp và chấm
            điểm.
          </p>
        </div>
        {!creating && (
          <Button
            variant="primary"
            onClick={() => setCreating(true)}
            disabled={groups.length === 0}
            leftIcon={<Icon icon={Plus} size={18} />}
          >
            Giao task mới
          </Button>
        )}
      </section>

      {toast && (
        <p
          className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent"
          role="status"
        >
          {toast}
        </p>
      )}

      {creating && (
        <CreateTaskForm
          groups={groups}
          onCancel={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            showToast("Đã giao task cho team.");
            reload();
          }}
        />
      )}

      {groups.length === 0 && (
        <section className="neu-card !p-8 text-center">
          <p className="text-sm text-muted">
            Bạn chưa dẫn team nào — chờ Ban Chủ nhiệm chia đội.
          </p>
        </section>
      )}

      {tasks.length === 0 && groups.length > 0 && !creating && (
        <section className="neu-card !p-8 text-center">
          <p className="text-sm text-muted">
            Chưa có task nào — bấm "Giao task mới" để bắt đầu.
          </p>
        </section>
      )}

      {teamTrainees.length > 0 && (
        <section className="neu-card !p-6 space-y-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              Đánh giá tân binh ({teamTrainees.length})
            </h2>
            <p className="text-xs text-muted">
              Ghi note quá trình và chấm điểm cho tân binh — Ban Chủ nhiệm sẽ
              dựa vào đánh giá này để chốt Đạt/Trượt và đẩy lên thành viên chính
              thức.
            </p>
          </div>
          <ul className="space-y-2">
            {teamTrainees.map((t) => (
              <EvaluationRow
                key={t.id}
                trainee={t}
                onChanged={(msg) => {
                  showToast(msg);
                  reload();
                }}
              />
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {tasks.map((t) => (
          <article key={t.id} className="neu-card !p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold">{t.title}</h3>
                <p className="text-xs text-muted">
                  {t.groupName ?? "—"}
                  {t.deadline && ` · Hạn: ${formatDate(t.deadline)}`}
                </p>
              </div>
              <Badge tone="accent">
                {t.assignments.filter((a) => a.status !== "assigned").length}/
                {t.assignments.length} đã nộp
              </Badge>
            </div>
            {t.description && (
              <p className="text-sm text-muted">{t.description}</p>
            )}
            {t.attachmentUrl && (
              <a
                className="text-xs text-accent underline"
                href={t.attachmentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Tài liệu đính kèm
              </a>
            )}
            <ul className="space-y-2">
              {t.assignments.map((a) => (
                <ReviewRow
                  key={a.traineeId}
                  taskId={t.id}
                  assignment={a}
                  onReviewed={() => {
                    showToast("Đã lưu kết quả chấm.");
                    reload();
                  }}
                />
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

export default MentorTasksPage;
