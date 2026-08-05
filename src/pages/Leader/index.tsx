import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  GraduationCap,
  Users,
  ListChecks,
} from "lucide-react";
import MetricCard from "../../components/ui/MetricCard";
import Button from "../../components/ui/Button";
import { usePortalUi } from "../../context/usePortalUi";
import { ROUTES } from "../../constants/routes";
import {
  getMentorTasks,
  getMyTeamTrainees,
  getTrainingGroups,
} from "../../services/trainingService";
import { useAuth } from "../../context/useAuth";

/** Tổng quan Leader — KPI soft-UI kế thừa Admin dashboard */
export default function LeaderOverviewPage() {
  const { navigate } = usePortalUi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groupCount, setGroupCount] = useState(0);
  const [traineeCount, setTraineeCount] = useState(0);
  const [pendingReview, setPendingReview] = useState(0);
  const [awaitingBcn, setAwaitingBcn] = useState(0);

  const load = useCallback(async () => {
    const [groups, trainees, tasks] = await Promise.all([
      getTrainingGroups(),
      getMyTeamTrainees(),
      getMentorTasks(),
    ]);
    const mine = groups.filter((g) => g.mentorId === user?.id);
    setGroupCount(mine.length);
    setTraineeCount(trainees.length);
    setPendingReview(
      tasks.reduce(
        (n, t) =>
          n + t.assignments.filter((a) => a.status === "submitted").length,
        0,
      ),
    );
    setAwaitingBcn(
      trainees.filter((t) => t.mentorReviewStatus === "submitted").length,
    );
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Tổng quan
        </h1>
        <p className="text-muted">
          Quản lý nhóm training và task cho tân thành viên.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="neu-card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Nhóm phụ trách"
              value={groupCount}
              hint="Nhóm training bạn dẫn"
              tone="accent"
              icon={Users}
            />
            <MetricCard
              label="Tân binh"
              value={traineeCount}
              hint="Trong các nhóm của bạn"
              tone="violet"
              icon={GraduationCap}
            />
            <MetricCard
              label="Bài chờ chấm"
              value={pendingReview}
              hint="Đã nộp — cần duyệt"
              tone="amber"
              icon={ClipboardList}
            />
            <MetricCard
              label="Đã gửi BCN"
              value={awaitingBcn}
              hint="Đánh giá tổng kết đã submit"
              tone="emerald"
              icon={ListChecks}
            />
          </div>

          <div className="neu-card !p-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.leader.training.tasks)}
            >
              Giao / chấm task
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.leader.training.groups)}
            >
              Quản lý nhóm
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.leader.training.evaluation)}
            >
              Đánh giá tổng kết
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
