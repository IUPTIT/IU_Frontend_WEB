import { useCallback, useEffect, useState } from "react";
import { TraineeTrainingHub } from "../../../components/training/TraineeTrainingHub";
import { ROUTES } from "../../../constants/routes";
import { usePortalUi } from "../../../context/usePortalUi";
import {
  getMyMentorTasks,
  getMyTraining,
  getMyTrainingProgress,
  type MyMentorTask,
  type MyTraining,
} from "../../../services/trainingService";

/**
 * Ứng viên / tân binh xem training — giữ role candidate đến khi hoàn thành training.
 */
export default function CandidateTrainingPage() {
  const { navigate } = usePortalUi();
  const [training, setTraining] = useState<MyTraining | null>(null);
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const me = await getMyTraining();
    const myTasks = me ? await getMyMentorTasks(me.trainee.id) : [];
    let pct = 0;
    if (me) {
      try {
        const p = await getMyTrainingProgress(me.trainee.id);
        pct = p.percentComplete;
      } catch {
        pct = 0;
      }
    }
    return { me, myTasks, pct };
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .then(({ me, myTasks, pct }) => {
        if (!alive) return;
        setTraining(me);
        setTasks(myTasks);
        setProgressPercent(pct);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const reload = () => {
    void load().then(({ me, myTasks, pct }) => {
      setTraining(me);
      setTasks(myTasks);
      setProgressPercent(pct);
    });
  };

  if (loading) {
    return (
      <div
        className="ui-card h-64 animate-pulse"
        aria-busy="true"
        aria-label="Đang tải"
      />
    );
  }

  const subtitle = training
    ? `Tiếp tục hành trình tại Ban ${training.trainee.departmentName}${
        training.trainee.cohortLabel
          ? ` · ${training.trainee.cohortLabel}`
          : ""
      }.`
    : undefined;

  return (
    <TraineeTrainingHub
      title="Training của tôi"
      subtitle={subtitle}
      training={training}
      tasks={tasks}
      progressPercent={progressPercent}
      onReload={reload}
      emptyMessage="Chương trình training mở sau khi bạn trúng tuyển và được Ban Chủ nhiệm bàn giao. Hiện bạn chưa có hồ sơ trainee."
      onOpenTaskDetail={(id) =>
        navigate(ROUTES.candidate.trainingTaskDetail(id))
      }
    />
  );
}
