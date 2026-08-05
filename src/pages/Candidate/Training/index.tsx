import { useCallback, useEffect, useState } from "react";
import { TraineeTrainingHub } from "../../../components/training/TraineeTrainingHub";
import {
  getMyMentorTasks,
  getMyTraining,
  type MyMentorTask,
  type MyTraining,
} from "../../../services/trainingService";

/**
 * Ứng viên / tân binh xem training — cùng layout soft-UI với Member.
 * Sau khi trúng tuyển user chuyển Member; route này giữ cho tài khoản còn role candidate
 * hoặc khi cần xem lại trạng thái trước bàn giao.
 */
export default function CandidateTrainingPage() {
  const [training, setTraining] = useState<MyTraining | null>(null);
  const [tasks, setTasks] = useState<MyMentorTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const me = await getMyTraining();
    const myTasks = me ? await getMyMentorTasks(me.trainee.id) : [];
    return { me, myTasks };
  }, []);

  useEffect(() => {
    let alive = true;
    void load()
      .then(({ me, myTasks }) => {
        if (!alive) return;
        setTraining(me);
        setTasks(myTasks);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const reload = () => {
    void load().then(({ me, myTasks }) => {
      setTraining(me);
      setTasks(myTasks);
    });
  };

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
    <TraineeTrainingHub
      title="Đào tạo thành viên mới"
      training={training}
      tasks={tasks}
      onReload={reload}
      emptyMessage="Chương trình training mở sau khi bạn trúng tuyển và được Ban Chủ nhiệm bàn giao. Hiện bạn chưa có hồ sơ trainee."
    />
  );
}
