import { useCallback, useEffect, useState } from "react";
import TrainingChatPanel from "../../../../components/training/TrainingChatPanel";
import {
  getMyTraining,
  getMyTrainingProgress,
  type MyTraining,
} from "../../../../services/trainingService";
import type { TrainingProgress } from "../../../../types/training";

/** UC Member #6–7: tiến độ % + trao đổi mentor */
export default function MemberTrainingProgressPage() {
  const [me, setMe] = useState<MyTraining | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const training = await getMyTraining();
      setMe(training);
      if (!training) {
        setProgress(null);
        return;
      }
      setProgress(await getMyTrainingProgress(training.trainee.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Tải tiến độ thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Tiến độ & trao đổi</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Tiến độ & trao đổi
        </h1>
      </header>

      {toast && (
        <div className="rounded-2xl bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          {toast}
        </div>
      )}

      <div className="neu-card space-y-3 !p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Hoàn thành task (đã duyệt)</p>
            <p className="font-display text-3xl font-extrabold text-accent">
              {pct}%
            </p>
          </div>
          <p className="text-sm text-muted">
            {progress?.completedTasks ?? 0}/{progress?.totalTasks ?? 0} task
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-background shadow-inset-sm">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {me.trainee.mentorNote && (
          <p className="text-sm">
            <span className="text-muted">Note mentor: </span>
            {me.trainee.mentorNote}
          </p>
        )}
      </div>

      {!me.group ? (
        <div className="neu-card !p-8 text-center text-sm text-muted">
          Bạn cần được chia nhóm trước khi trao đổi với mentor.
        </div>
      ) : (
        <TrainingChatPanel
          groupId={me.group.id}
          title={`Trao đổi với mentor — ${me.group.name}`}
          subtitle={
            me.group.mentorName
              ? `Mentor: ${me.group.mentorName}`
              : "Mentor sẽ được phân công sớm"
          }
        />
      )}
    </section>
  );
}
