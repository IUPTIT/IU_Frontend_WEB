import { useCallback, useEffect, useState } from "react";
import { TrainingTaskCard } from "../../../../components/training/TraineeTrainingHub";
import {
  getMyMentorTasks,
  getMyTraining,
  type MyMentorTask,
} from "../../../../services/trainingService";

/** Member UC 3–5: danh sách task, nộp bài, xem điểm — TaskCard dùng chung Candidate */
export default function MemberTrainingTasksPage() {
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const me = await getMyTraining();
    if (!me) {
      setTasks([]);
      return;
    }
    setTasks(await getMyMentorTasks(me.trainee.id));
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => {
        if (alive) setToast("Không tải được danh sách task.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const reload = () => {
    void load().then(() => {
      setToast("Đã cập nhật bài nộp.");
      window.setTimeout(() => setToast(null), 2200);
    });
  };

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" />;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Task training</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Task training
        </h1>
        <p className="text-muted text-sm">
          {tasks.length} task được giao · Nộp bài và xem điểm/nhận xét mentor
        </p>
      </header>

      {toast && (
        <p
          className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent"
          role="status"
        >
          {toast}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="neu-card !p-10 text-center text-muted text-sm">
          Chưa có task nào. Mentor sẽ giao bài tập khi bắt đầu training.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((t) => (
            <TrainingTaskCard key={t.id} task={t} onSubmitted={reload} />
          ))}
        </div>
      )}
    </section>
  );
}
