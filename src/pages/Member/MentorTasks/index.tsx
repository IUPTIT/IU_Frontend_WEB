import { useCallback, useEffect, useMemo, useState } from "react";
import TrainingChatWidget from "../../../components/training/TrainingChatWidget";
import { useAuth } from "../../../context/useAuth";
import { useToast } from "../../../context/useToast";
import {
  getMentorTasks,
  getMyTeamTrainees,
  getTrainingGroups,
  type MentorTask,
} from "../../../services/trainingService";
import type { Trainee, TrainingGroup } from "../../../types/training";
import AssignTaskForm from "./components/AssignTaskForm";
import MentorTaskKpis from "./components/MentorTaskKpis";
import TaskTrackingBoard from "./components/TaskTrackingBoard";
import {
  computeTaskKpis,
  flattenTaskRows,
} from "./components/taskTracking";

/** Portal mentor: KPI + giao task + bảng theo dõi — data thật + linh vật chat */
function MentorTasksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.isMentor === true || user?.role === "admin";

  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [teamTrainees, setTeamTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(canManage);

  const load = useCallback(async () => {
    const [t, g, tt] = await Promise.all([
      getMentorTasks(),
      getTrainingGroups(),
      getMyTeamTrainees(),
    ]);
    const myGroups =
      user?.role === "admin" ? g : g.filter((x) => x.mentorId === user?.id);
    return { t, g: myGroups, tt };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!canManage) return;
    let alive = true;
    void load()
      .then(({ t, g, tt }) => {
        if (!alive) return;
        setTasks(t);
        setGroups(g);
        setTeamTrainees(tt);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [canManage, load]);

  const reload = () => {
    void load().then(({ t, g, tt }) => {
      setTasks(t);
      setGroups(g);
      setTeamTrainees(tt);
    });
  };

  const rows = useMemo(() => flattenTaskRows(tasks), [tasks]);
  const kpis = useMemo(() => computeTaskKpis(rows), [rows]);

  if (!canManage) {
    return (
      <section className="ui-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">
          Quản lý Task Training
        </h1>
        <p className="text-muted mx-auto max-w-md">
          Bạn chưa được Ban Chủ nhiệm đẩy quyền mentor. Khi trở thành mentor,
          bạn sẽ giao task và chấm bài cho team tân binh tại đây.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <div
        className="ui-card h-64 animate-pulse"
        aria-busy="true"
        aria-label="Đang tải"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Quản lý Task Training
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Giao bài tập và theo dõi tiến độ tân binh trong nhóm bạn phụ trách.
        </p>
      </div>

      {groups.length === 0 ? (
        <section className="ui-card !p-8 text-center">
          <p className="text-sm text-muted">
            Bạn chưa dẫn team nào — chờ Ban Chủ nhiệm chia đội.
          </p>
        </section>
      ) : (
        <>
          <MentorTaskKpis {...kpis} />

          <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <AssignTaskForm
              groups={groups}
              trainees={teamTrainees}
              onCreated={() => {
                toast.success("Đã giao task.");
                reload();
              }}
            />
            <TaskTrackingBoard
              rows={rows}
              onReviewed={() => {
                toast.success("Đã lưu kết quả chấm.");
                reload();
              }}
            />
          </div>

          <TrainingChatWidget
            groups={groups.map((g) => ({
              id: g.id,
              name: g.name,
              subtitle: g.specialtyLabel ?? g.departmentName ?? "Nhóm training",
            }))}
          />
        </>
      )}
    </div>
  );
}

export default MentorTasksPage;
