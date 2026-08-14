import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Users,
} from "lucide-react";
import MetricCard from "../../components/ui/MetricCard";
import Button from "../../components/ui/Button";
import { usePortalUi } from "../../context/usePortalUi";
import { ROUTES } from "../../constants/routes";
import {
  getMyMentorTasks,
  getMyTraining,
  getMyTrainingProgress,
} from "../../services/trainingService";

/** Tổng quan Member — KPI soft-UI kế thừa Admin dashboard */
export default function MemberOverviewPage() {
  const { navigate } = usePortalUi();
  const [loading, setLoading] = useState(true);
  const [hasTraining, setHasTraining] = useState(false);
  const [groupName, setGroupName] = useState("—");
  const [mentorName, setMentorName] = useState("—");
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskDone, setTaskDone] = useState(0);
  const [percent, setPercent] = useState(0);
  const [pendingSubmit, setPendingSubmit] = useState(0);

  const load = useCallback(async () => {
    const me = await getMyTraining();
    if (!me) {
      setHasTraining(false);
      return;
    }
    setHasTraining(true);
    setGroupName(me.group?.name ?? "Chưa chia nhóm");
    setMentorName(me.group?.mentorName ?? me.trainee.mentorName ?? "—");
    const [tasks, progress] = await Promise.all([
      getMyMentorTasks(me.trainee.id),
      getMyTrainingProgress(me.trainee.id),
    ]);
    setTaskTotal(tasks.length);
    setTaskDone(tasks.filter((t) => t.status === "approved").length);
    setPendingSubmit(
      tasks.filter((t) => t.status === "assigned" || t.status === "rejected")
        .length,
    );
    setPercent(progress.percentComplete);
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => alive && setHasTraining(false))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tổng quan
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Theo dõi tiến độ đào tạo thành viên mới của bạn.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ui-card h-28 animate-pulse" />
          ))}
        </div>
      ) : !hasTraining ? (
        <div className="ui-card !p-10 text-center space-y-3">
          <p className="font-semibold">Chưa vào vòng training</p>
          <p className="text-sm text-muted mx-auto max-w-md">
            Khi Ban Chủ nhiệm bàn giao sau khi bạn trúng tuyển, lộ trình và task
            sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Tiến độ training"
              value={`${percent}%`}
              hint={`${taskDone}/${taskTotal} task đã duyệt`}
              tone="accent"
              icon={CheckCircle2}
            />
            <MetricCard
              label="Task chờ nộp"
              value={pendingSubmit}
              hint="Chưa nộp hoặc bị trả lại"
              tone="amber"
              icon={ClipboardList}
            />
            <MetricCard
              label="Nhóm của bạn"
              value={groupName}
              hint={`Mentor: ${mentorName}`}
              tone="violet"
              icon={Users}
            />
            <MetricCard
              label="Lộ trình"
              value="Xem ngay"
              hint="Giai đoạn & tài liệu"
              tone="sky"
              icon={BookOpen}
            />
          </div>

          <div className="ui-card !p-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.member.training.tasks)}
            >
              Làm task training
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.member.training.roadmap)}
            >
              Xem lộ trình & nhóm
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.member.training.progress)}
            >
              Tiến độ & trao đổi mentor
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
