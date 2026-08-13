import { useCallback, useEffect, useMemo, useState } from "react";
import { TrainingTaskCard } from "../../../../components/training/TraineeTrainingHub";
import TrainingChatWidget from "../../../../components/training/TrainingChatWidget";
import Badge from "../../../../components/ui/Badge";
import { ROUTES } from "../../../../constants/routes";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import {
  getMyMentorTasks,
  getMyTraining,
  type MyMentorTask,
  type MyTraining,
} from "../../../../services/trainingService";

/** Nhiệm vụ & bài tập — list task thật + chat widget */
export default function MemberTrainingTasksPage() {
  const { navigate, activePath } = usePortalUi();
  const toast = useToast();
  const [me, setMe] = useState<MyTraining | null>(null);
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [loading, setLoading] = useState(true);

  const taskDetailPath = useCallback(
    (id: string) => {
      if (activePath.startsWith("/candidate")) {
        return ROUTES.candidate.trainingTaskDetail(id);
      }
      if (activePath.startsWith("/leader")) {
        return `/leader/training/my-tasks/${id}`;
      }
      return ROUTES.member.training.taskDetail(id);
    },
    [activePath],
  );

  const load = useCallback(async () => {
    const training = await getMyTraining();
    setMe(training);
    if (!training) {
      setTasks([]);
      return;
    }
    setTasks(await getMyMentorTasks(training.trainee.id));
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => {
        if (alive) toast.error("Không tải được danh sách task.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load, toast]);

  const reload = () => {
    void load().then(() => {
      toast.success("Đã cập nhật bài nộp.");
    });
  };

  const incomplete = useMemo(
    () => tasks.filter((t) => t.status !== "approved").length,
    [tasks],
  );

  if (loading) {
    return <div className="ui-card h-64 animate-pulse" aria-busy="true" />;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="text-sm text-muted">
            Đào tạo ›{" "}
            <span className="text-foreground/80">Nhiệm vụ & Bài tập</span>
          </nav>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Nhiệm vụ & Bài tập
          </h1>
          <p className="text-muted text-sm">
            Mở task để cập nhật tiến độ và nộp bài.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{tasks.length} task</Badge>
          {incomplete > 0 && (
            <Badge tone="danger">{incomplete} chưa xong</Badge>
          )}
        </div>
      </header>

      {!me ? (
        <div className="ui-card !p-10 text-center text-muted text-sm">
          Bạn chưa ở vòng đào tạo thành viên mới.
        </div>
      ) : tasks.length === 0 ? (
        <div className="ui-card !p-10 text-center text-muted text-sm">
          Chưa có task nào. Mentor sẽ giao bài tập khi bắt đầu training.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((t) => (
            <TrainingTaskCard
              key={t.id}
              task={t}
              onSubmitted={reload}
              onOpenDetail={() => navigate(taskDetailPath(t.id))}
            />
          ))}
        </div>
      )}

      {me?.group && (
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
