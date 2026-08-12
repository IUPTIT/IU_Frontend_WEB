import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Send } from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { useToast } from "../../../../context/useToast";
import {
  getMentorTasks,
  getMyTeamTrainees,
  saveMentorTraineeReview,
  type MentorTask,
} from "../../../../services/trainingService";
import type { Trainee } from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

const EVAL_LABEL: Record<string, string> = {
  studying: "Đang training",
  qualified: "Đạt",
  failed: "Trượt",
  certified: "Đã cấp CN",
};

/**
 * Đánh giá tổng kết — sidebar tân binh + panel Soft UI (điểm/note/task thật).
 * Không fake soft-skill 3 trục: chỉ mentorScore + thống kê task.
 */
export default function LeaderTrainingEvaluationPage() {
  const toast = useToast();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, tk] = await Promise.all([
        getMyTeamTrainees(),
        getMentorTasks(),
      ]);
      setTrainees(list);
      setTasks(tk);
      setSelectedId((prev) =>
        prev && list.some((t) => t.id === prev) ? prev : (list[0]?.id ?? null),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải danh sách thất bại");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => trainees.find((t) => t.id === selectedId) ?? null,
    [trainees, selectedId],
  );

  if (loading) {
    return <div className="neu-card h-40 animate-pulse" />;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted">
            Đào tạo › <span className="text-foreground/80">Đánh giá</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Đánh giá tổng kết Training
            </h1>
          </div>
          <p className="text-sm text-muted max-w-xl">
            Chọn tân binh — ghi điểm quá trình & nhận xét gửi Ban Chủ nhiệm
          </p>
        </div>
      </header>

      {trainees.length === 0 ? (
        <div className="neu-card !p-10 text-center text-muted">
          Chưa có tân binh trong nhóm bạn phụ trách.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="neu-card !p-3 space-y-1 h-fit">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wide text-muted">
              Danh sách thành viên ({trainees.length})
            </p>
            <ul className="space-y-1">
              {trainees.map((t) => {
                const active = t.id === selectedId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition duration-300 ${
                        active
                          ? "bg-accent/15 shadow-inset-sm"
                          : "hover:shadow-extruded-sm"
                      }`}
                    >
                      <Avatar name={t.fullName} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {t.fullName}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {t.departmentName} · Tân binh
                        </span>
                      </span>
                      {active && (
                        <Icon
                          icon={ChevronRight}
                          size={16}
                          className="text-accent shrink-0"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {selected && (
            <EvalDetail
              key={selected.id}
              trainee={selected}
              tasks={tasks}
              onChanged={() => void load()}
            />
          )}
        </div>
      )}
    </section>
  );
}

function EvalDetail({
  trainee,
  tasks,
  onChanged,
}: {
  trainee: Trainee;
  tasks: MentorTask[];
  onChanged: () => void;
}) {
  const toast = useToast();
  const [score, setScore] = useState(
    trainee.avgScore != null ? String(trainee.avgScore) : "",
  );
  const [note, setNote] = useState(trainee.mentorNote ?? "");
  const [saving, setSaving] = useState(false);
  const submitted = trainee.mentorReviewStatus === "submitted";

  const assignmentStats = useMemo(() => {
    const mine = tasks.flatMap((t) =>
      t.assignments
        .filter((a) => a.traineeId === trainee.id)
        .map((a) => ({ ...a, title: t.title, submittedAt: a.submittedAt })),
    );
    const scored = mine.filter((a) => a.status === "approved" && a.score != null);
    const avgTask =
      scored.length === 0
        ? null
        : Math.round(
            (scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length) *
              10,
          ) / 10;
    const approved = mine.filter((a) => a.status === "approved").length;
    const total = mine.length;
    const weekly = [0, 0, 0, 0, 0];
    const now = Date.now();
    for (const a of mine) {
      if (!a.submittedAt) continue;
      const weekAgo = Math.floor(
        (now - new Date(a.submittedAt).getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      if (weekAgo >= 0 && weekAgo < 5) weekly[4 - weekAgo] += 1;
    }
    return { avgTask, approved, total, weekly, mine };
  }, [tasks, trainee.id]);

  const scoreNum = score.trim() === "" ? null : Number.parseFloat(score);
  const scorePct =
    scoreNum != null && !Number.isNaN(scoreNum)
      ? Math.min(100, Math.max(0, (scoreNum / 10) * 100))
      : 0;
  const taskPct =
    assignmentStats.avgTask != null
      ? Math.min(100, Math.max(0, (assignmentStats.avgTask / 10) * 100))
      : 0;
  const completionPct =
    assignmentStats.total === 0
      ? 0
      : Math.round((assignmentStats.approved / assignmentStats.total) * 100);
  const maxWeek = Math.max(1, ...assignmentStats.weekly);

  const handleSave = async (submit: boolean) => {
    const parsed = score.trim() === "" ? undefined : Number.parseFloat(score);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 10)) {
      toast.error("Điểm phải từ 0 đến 10.");
      return;
    }
    if (!note.trim() && parsed == null) {
      toast.error("Nhập nhận xét tổng thể (bắt buộc khi đánh giá).");
      return;
    }
    setSaving(true);
    try {
      await saveMentorTraineeReview(trainee.id, {
        score: parsed ?? null,
        note: note.trim(),
        submit,
      });
      toast.success(
        submit
          ? `Đã gửi đánh giá của ${trainee.fullName} lên BCN.`
          : `Đã lưu nháp cho ${trainee.fullName}.`,
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <article className="neu-card !p-6 flex flex-wrap items-center gap-4">
        <Avatar name={trainee.fullName} size="xl" />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="font-display text-2xl font-extrabold">
            {trainee.fullName}
          </h2>
          <p className="text-sm text-muted">{trainee.email}</p>
          <p className="text-xs text-muted">
            Mentor gửi đánh giá lên BCN — BCN mới chốt Đạt / Trượt / chứng nhận.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge tone="violet">Tân binh</Badge>
            <Badge tone={submitted ? "success" : "muted"}>
              {submitted ? "Đã gửi BCN" : "Nháp"}
            </Badge>
            <Badge tone="accent">
              {EVAL_LABEL[trainee.evalStatus ?? "studying"]}
            </Badge>
            {trainee.cohortLabel && (
              <Badge tone="info">{trainee.cohortLabel}</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
            Gửi đánh giá lên BCN
          </Button>
        </div>
      </article>

      <div className="grid gap-5 md:grid-cols-2">
        <article className="neu-card !p-5 space-y-4">
          <h3 className="font-display text-lg font-bold">Chỉ số từ dữ liệu thật</h3>
          <ScoreRow
            label="Điểm mentor (quá trình)"
            hint="Bạn đang chấm / đã lưu"
            valueLabel={
              scoreNum != null && !Number.isNaN(scoreNum)
                ? `${scoreNum}/10`
                : "—"
            }
            pct={scorePct}
            tone="bg-accent"
          />
          <ScoreRow
            label="Điểm TB task đã duyệt"
            hint={`${assignmentStats.approved}/${assignmentStats.total} task duyệt`}
            valueLabel={
              assignmentStats.avgTask != null
                ? `${assignmentStats.avgTask}/10`
                : "—"
            }
            pct={taskPct}
            tone="bg-sky-500"
          />
          <ScoreRow
            label="Tỷ lệ hoàn thành task"
            hint="Approved / tổng assignment"
            valueLabel={`${completionPct}%`}
            pct={completionPct}
            tone="bg-emerald-500"
          />
          <label className="block space-y-1.5 pt-2">
            <span className="neu-field-label">Chấm điểm mentor (0–10)</span>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              className="neu-input !h-12 w-full max-w-[140px] text-lg font-bold"
              placeholder="0–10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>
        </article>

        <article className="neu-card !p-5 space-y-3">
          <h3 className="font-display text-lg font-bold">
            Tóm tắt lịch sử Task
          </h3>
          <p className="text-xs text-muted">
            Số bài nộp theo tuần gần đây (submittedAt thật)
          </p>
          <div className="flex h-40 items-end gap-2 px-1">
            {assignmentStats.weekly.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center rounded-2xl bg-background shadow-inset-sm px-1 pb-1">
                  <div
                    className="w-full max-w-[28px] rounded-t-xl bg-accent/80"
                    style={{
                      height: `${(v / maxWeek) * 100}%`,
                      minHeight: v ? 8 : 0,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted">Tuần {i + 1}</span>
              </div>
            ))}
          </div>
          {trainee.certificateCode && (
            <p className="text-xs">
              Chứng nhận:{" "}
              <span className="font-semibold text-accent">
                {trainee.certificateCode}
              </span>
            </p>
          )}
          {trainee.mentorReviewSubmittedAt && (
            <p className="text-xs text-muted">
              Gửi BCN: {formatDate(trainee.mentorReviewSubmittedAt)}
            </p>
          )}
        </article>
      </div>

      <article className="neu-card !p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">Nhận xét tổng thể</h3>
        <textarea
          className="neu-input min-h-[120px] w-full text-sm shadow-inset"
          placeholder="Nhập nhận xét, góp ý cụ thể cho tân binh này..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 justify-end">
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
            Lưu đánh giá
          </Button>
        </div>
      </article>
    </div>
  );
}

function ScoreRow({
  label,
  hint,
  valueLabel,
  pct,
  tone,
}: {
  label: string;
  hint: string;
  valueLabel: string;
  pct: number;
  tone: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[10px] text-muted">{hint}</p>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
          {valueLabel}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-background shadow-inset-sm">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
