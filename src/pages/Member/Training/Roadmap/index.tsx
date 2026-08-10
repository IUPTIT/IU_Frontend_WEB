import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  RoadmapStageStepper,
  TrainingRoadmapPanel,
} from "../../../../components/training/TraineeTrainingHub";
import TrainingChatWidget from "../../../../components/training/TrainingChatWidget";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { ROUTES } from "../../../../constants/routes";
import {
  getMyMentorTasks,
  getMyTraining,
  getMyTrainingProgress,
  type MyMentorTask,
  type MyTraining,
} from "../../../../services/trainingService";
import type { TrainingProgress } from "../../../../types/training";

const EVAL_LABEL: Record<string, string> = {
  studying: "Đang học",
  qualified: "Đạt",
  failed: "Chưa đạt",
  certified: "Đã chứng nhận",
};

/** Lộ trình phát triển — stepper + stage hiện tại + stats thật (không XP/giờ) */
export default function MemberTrainingRoadmapPage() {
  const navigate = useNavigate();
  const lessonsRef = useRef<HTMLElement | null>(null);
  const [training, setTraining] = useState<MyTraining | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const me = await getMyTraining();
    setTraining(me);
    if (!me) {
      setProgress(null);
      setTasks([]);
      return;
    }
    const [p, t] = await Promise.all([
      getMyTrainingProgress(me.trainee.id).catch(() => null),
      getMyMentorTasks(me.trainee.id).catch(() => [] as MyMentorTask[]),
    ]);
    setProgress(p);
    setTasks(t);
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => alive && setTraining(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const percent = progress?.percentComplete ?? 0;

  const stages = useMemo(() => {
    if (!training?.program?.stages?.length) return [];
    return [...training.program.stages].sort((a, b) => a.order - b.order);
  }, [training]);

  const activeIdx = useMemo(() => {
    if (stages.length === 0) return 0;
    return Math.min(
      stages.length - 1,
      Math.floor((Math.min(100, Math.max(0, percent)) / 100) * stages.length),
    );
  }, [stages.length, percent]);

  const activeStage = stages[activeIdx] ?? null;

  const activeLessons = useMemo(() => {
    if (!training?.program || !activeStage) return [];
    return training.program.lessons.filter((l) => l.stageId === activeStage.id);
  }, [training, activeStage]);

  const skillPills = useMemo(() => {
    if (!training?.program) return [];
    const doneStageIds = new Set(
      stages
        .filter((_, i) => i < activeIdx || percent >= 100)
        .map((s) => s.id),
    );
    const fromDone = training.program.lessons.filter((l) =>
      doneStageIds.has(l.stageId),
    );
    const source =
      fromDone.length > 0
        ? fromDone
        : training.program.lessons.filter(
            (l) => activeStage && l.stageId === activeStage.id,
          );
    return source.map((l) => ({ id: l.id, title: l.title }));
  }, [training, stages, activeIdx, percent, activeStage]);

  const scoredCount = useMemo(
    () =>
      tasks.filter((t) => t.status === "approved" && t.score != null).length,
    [tasks],
  );

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" />;
  }

  if (!training) {
    return (
      <section className="neu-card !p-10 text-center space-y-2">
        <h1 className="font-display text-2xl font-extrabold">
          Lộ trình phát triển
        </h1>
        <p className="text-muted mx-auto max-w-md text-sm">
          Bạn chưa được đưa vào chương trình đào tạo thành viên mới. Khi trúng
          tuyển và được chia nhóm, lộ trình sẽ hiện tại đây.
        </p>
      </section>
    );
  }

  const { trainee, program, group } = training;
  const firstIncomplete = tasks.find(
    (t) => t.status === "assigned" || t.status === "rejected",
  );

  const handleContinue = () => {
    if (firstIncomplete) {
      void navigate(ROUTES.member.training.tasks);
      return;
    }
    lessonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted">
            Đào tạo ›{" "}
            <span className="text-foreground/80">Lộ trình phát triển</span>
          </nav>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {program?.name ?? "Lộ trình phát triển"}
          </h1>
          <p className="text-muted text-sm">
            {trainee.cohortLabel ?? "Tân binh"} · Ban {trainee.departmentName}
          </p>
        </div>
        <div className="neu-card !p-4 text-center min-w-[120px]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Tiến độ tổng thể
          </p>
          <p className="font-display text-2xl font-extrabold text-accent">
            {percent}%
          </p>
        </div>
      </header>

      <RoadmapStageStepper program={program} percentComplete={percent} />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article
          ref={lessonsRef}
          className="neu-card !p-5 space-y-4"
          id="roadmap-current-stage"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                Giai đoạn hiện tại
              </p>
              <h2 className="font-display text-xl font-bold">
                {activeStage?.name ?? "Chưa có giai đoạn"}
              </h2>
              {activeStage?.weekLabel && (
                <p className="text-xs text-muted">{activeStage.weekLabel}</p>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleContinue}
              leftIcon={<Icon icon={ArrowRight} size={14} />}
            >
              Tiếp tục
            </Button>
          </div>
          {activeLessons.length === 0 ? (
            <p className="text-sm text-muted">
              Chưa có bài học trong giai đoạn này.
            </p>
          ) : (
            <ul className="space-y-2">
              {activeLessons.map((l) => (
                <li
                  key={l.id}
                  className="rounded-2xl bg-background px-3 py-2.5 shadow-inset-sm"
                >
                  {l.attachmentUrl ? (
                    <a
                      className="text-sm font-medium text-accent underline"
                      href={l.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.title}
                    </a>
                  ) : (
                    <p className="text-sm font-medium">{l.title}</p>
                  )}
                  {l.durationLabel && (
                    <p className="text-xs text-muted">{l.durationLabel}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="neu-card !p-5 space-y-4">
          <h2 className="font-display text-lg font-bold">Thống kê</h2>
          <div className="space-y-3">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted">Task đã duyệt</span>
              <span className="font-semibold">
                {progress?.completedTasks ?? 0}/{progress?.totalTasks ?? 0}
              </span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted">Task có điểm</span>
              <span className="font-semibold">{scoredCount}</span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted">Trạng thái đánh giá</span>
              <Badge tone="accent">
                {EVAL_LABEL[trainee.evalStatus ?? "studying"]}
              </Badge>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="neu-card !p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Kỹ năng / bài học</h2>
          <p className="text-xs text-muted">
            Tiêu đề bài học từ các giai đoạn đã hoàn thành (dữ liệu lộ trình thật)
          </p>
          {skillPills.length === 0 ? (
            <p className="text-sm text-muted">Chưa có bài học để hiển thị.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillPills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                >
                  {s.title}
                </span>
              ))}
            </div>
          )}
        </article>

        <article className="neu-card !p-5 space-y-4">
          <h2 className="font-display text-lg font-bold">Đồng hành</h2>
          {group ? (
            <>
              <div className="rounded-2xl bg-background px-3 py-3 shadow-inset-sm flex items-center gap-3">
                <Avatar name={group.mentorName ?? "?"} size="md" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                      {group.mentorName ?? trainee.mentorName ?? "—"}
                    </p>
                    <Badge tone="violet">MENTOR</Badge>
                  </div>
                  <p className="text-xs text-muted">{group.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted">
                Thành viên: {group.memberIds.length}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Chưa được chia nhóm — chờ Ban Chủ nhiệm.
            </p>
          )}
        </article>
      </div>

      <TrainingRoadmapPanel training={training} />

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
    </section>
  );
}
