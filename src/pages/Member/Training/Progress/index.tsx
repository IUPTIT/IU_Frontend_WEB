import { useCallback, useEffect, useMemo, useState } from "react";
import TrainingChatWidget from "../../../../components/training/TrainingChatWidget";
import Badge from "../../../../components/ui/Badge";
import {
  getMyMentorTasks,
  getMyTraining,
  getMyTrainingProgress,
  type MyMentorTask,
  type MyTraining,
} from "../../../../services/trainingService";
import type { TrainingProgress } from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

const TASK_STATUS_LABEL: Record<MyMentorTask["status"], string> = {
  assigned: "Chưa nộp",
  submitted: "Đã nộp",
  approved: "Đã duyệt",
  rejected: "Bị trả lại",
};

function rankFromAvg(avg: number | null): string {
  if (avg == null) return "—";
  if (avg >= 9) return "A+";
  if (avg >= 8) return "A";
  if (avg >= 7) return "B";
  if (avg >= 5) return "C";
  return "D";
}

function ScoreBar({
  label,
  valueLabel,
  pct,
  tone,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  tone: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
          {valueLabel}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-background shadow-inset-sm">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

/** Tiến độ & kết quả — điểm/task thật, không fake soft-skill / badge */
export default function MemberTrainingProgressPage() {
  const [me, setMe] = useState<MyTraining | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const training = await getMyTraining();
      setMe(training);
      if (!training) {
        setProgress(null);
        setTasks([]);
        return;
      }
      const [p, t] = await Promise.all([
        getMyTrainingProgress(training.trainee.id),
        getMyMentorTasks(training.trainee.id),
      ]);
      setProgress(p);
      setTasks(t);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Tải tiến độ thất bại");
      window.setTimeout(() => setToast(null), 2500);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const scored = useMemo(
    () => tasks.filter((t) => t.status === "approved" && t.score != null),
    [tasks],
  );
  const avgScore = useMemo(() => {
    if (scored.length === 0) return null;
    const sum = scored.reduce((s, t) => s + (t.score ?? 0), 0);
    return Math.round((sum / scored.length) * 10) / 10;
  }, [scored]);

  const weeklyBuckets = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    const now = Date.now();
    for (const t of tasks) {
      const at = t.submittedAt ? new Date(t.submittedAt).getTime() : null;
      if (!at) continue;
      const weekAgo = Math.floor((now - at) / (7 * 24 * 60 * 60 * 1000));
      if (weekAgo >= 0 && weekAgo < 5) buckets[4 - weekAgo] += 1;
    }
    return buckets;
  }, [tasks]);

  const maxWeek = Math.max(1, ...weeklyBuckets);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="neu-card h-32 animate-pulse" />
        <div className="neu-card h-64 animate-pulse" />
      </section>
    );
  }

  if (!me) {
    return (
      <section className="neu-card !p-10 text-center text-muted">
        Bạn chưa ở vòng đào tạo thành viên mới.
      </section>
    );
  }

  const pct = progress?.percentComplete ?? 0;
  const mentorScore = me.trainee.avgScore ?? null;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo ›{" "}
          <span className="text-foreground/80">Tiến độ & kết quả</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Tiến độ & Kết quả
        </h1>
        <p className="text-sm text-muted">
          Theo dõi % task đã duyệt và điểm mentor chấm — dữ liệu thật từ hệ
          thống.
        </p>
      </header>

      {toast && (
        <div className="rounded-2xl bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          {toast}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article className="neu-card !p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Thống kê học tập</h2>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
              Hoàn thành: {pct}%
            </span>
          </div>
          <p className="text-xs text-muted">
            Số bài nộp theo tuần gần đây (từ submittedAt thật)
          </p>
          <div className="flex h-40 items-end gap-3 px-1">
            {weeklyBuckets.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center rounded-2xl bg-background shadow-inset-sm px-1 pb-1">
                  <div
                    className="w-full max-w-[36px] rounded-t-xl bg-accent/80 transition-all"
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
          <p className="text-xs text-muted">
            {progress?.completedTasks ?? 0}/{progress?.totalTasks ?? 0} task đã
            duyệt
          </p>
        </article>

        <article className="neu-card !p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold">Điểm trung bình</h2>
            <p className="text-xs text-muted">
              Dựa trên {scored.length} task đã duyệt có điểm
            </p>
          </div>
          <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full bg-accent/10 shadow-inset-sm">
            <p className="font-display text-4xl font-extrabold text-accent">
              {avgScore != null ? avgScore.toFixed(1) : "—"}
            </p>
            <p className="text-xs font-bold text-muted">
              RANK {rankFromAvg(avgScore)}
            </p>
          </div>

          <div className="space-y-3">
            <ScoreBar
              label="Điểm task TB"
              valueLabel={
                avgScore != null ? `${avgScore.toFixed(1)}/10` : "Chưa có"
              }
              pct={avgScore != null ? (avgScore / 10) * 100 : 0}
              tone="bg-accent"
            />
            {mentorScore != null ? (
              <ScoreBar
                label="Điểm mentor"
                valueLabel={`${mentorScore}/10`}
                pct={(mentorScore / 10) * 100}
                tone="bg-sky-500"
              />
            ) : null}
          </div>

          {me.trainee.certificateCode && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted">Chứng nhận</span>
              <Badge tone="success">{me.trainee.certificateCode}</Badge>
            </div>
          )}

          {me.trainee.mentorNote && (
            <p className="rounded-2xl bg-background p-3 text-xs shadow-inset-sm">
              <span className="text-muted">Note mentor: </span>
              {me.trainee.mentorNote}
            </p>
          )}
        </article>
      </div>

      <article className="neu-card !p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Bảng điểm chi tiết</h2>
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Chưa có task.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-muted">
                  <th className="pb-3 font-semibold">Nhiệm vụ</th>
                  <th className="pb-3 font-semibold">Ngày nộp</th>
                  <th className="pb-3 font-semibold">Kết quả</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 pr-3 font-medium">{t.title}</td>
                    <td className="py-3 pr-3 text-muted">
                      {t.submittedAt ? formatDate(t.submittedAt) : "—"}
                    </td>
                    <td className="py-3 pr-3 font-bold text-accent">
                      {t.score != null ? t.score.toFixed(1) : "—"}
                    </td>
                    <td className="py-3 pr-3 text-muted">
                      {TASK_STATUS_LABEL[t.status]}
                    </td>
                    <td className="py-3">
                      {t.submissionUrl ? (
                        <a
                          className="text-accent underline"
                          href={t.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Chi tiết
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {pct >= 70 && (
        <p className="rounded-2xl bg-accent/15 px-4 py-3 text-sm font-medium text-accent">
          Bạn đang làm rất tốt — đã hoàn thành {pct}% task được duyệt.
        </p>
      )}

      {me.group && (
        <TrainingChatWidget
          groups={[
            {
              id: me.group.id,
              name: me.group.name,
              subtitle: me.group.mentorName
                ? `Mentor: ${me.group.mentorName}`
                : "Mentor sẽ được phân công sớm",
            },
          ]}
        />
      )}
    </section>
  );
}
