import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ListTodo, Users } from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Icon from "../../../../components/ui/Icon";
import TrainingChatWidget from "../../../../components/training/TrainingChatWidget";
import { useAuth } from "../../../../context/useAuth";
import { useToast } from "../../../../context/useToast";
import {
  getMentorTasks,
  getMyTeamTrainees,
  getTrainingGroups,
  type MentorTask,
} from "../../../../services/trainingService";
import type { Trainee, TrainingGroup } from "../../../../types/training";
import AssignTaskForm from "../../../Member/MentorTasks/components/AssignTaskForm";
import {
  computeTaskKpis,
  flattenTaskRows,
  ROW_STATUS_CLASS,
  ROW_STATUS_LABEL,
  type TrackRowStatus,
} from "../../../Member/MentorTasks/components/taskTracking";

/**
 * Mentor — Quản lý Nhóm & Task Training (mock Soft UI + data thật).
 * Layout: form giao task | bảng tiến độ | KPI đáy.
 */
export default function LeaderTrainingGroupsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [g, t, tk] = await Promise.all([
      getTrainingGroups(),
      getMyTeamTrainees(),
      getMentorTasks(),
    ]);
    setGroups(g.filter((x) => x.mentorId === user?.id));
    setTrainees(t);
    setTasks(tk);
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => {
        if (alive) toast.error("Không tải được nhóm.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load, toast]);

  const myTraineeIds = useMemo(
    () => new Set(trainees.map((t) => t.id)),
    [trainees],
  );

  const rows = useMemo(
    () =>
      flattenTaskRows(tasks).filter((r) =>
        myTraineeIds.has(r.assignment.traineeId),
      ),
    [tasks, myTraineeIds],
  );

  const kpis = useMemo(() => {
    const base = computeTaskKpis(rows);
    return {
      members: trainees.length,
      running: base.doing + base.review,
      doneRate:
        base.total === 0 ? 0 : Math.round((base.done / base.total) * 100),
      needHelp: base.overdue + base.review,
    };
  }, [rows, trainees.length]);

  const progressByTrainee = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email?: string;
        dept?: string;
        taskTitle: string;
        status: TrackRowStatus;
        pct: number;
      }
    >();
    for (const t of trainees) {
      map.set(t.id, {
        id: t.id,
        name: t.fullName,
        email: t.email,
        dept: t.departmentName,
        taskTitle: "Chưa có task",
        status: "doing",
        pct: 0,
      });
    }
    for (const r of rows) {
      const pct =
        r.rowStatus === "done"
          ? 100
          : r.rowStatus === "review"
            ? 70
            : r.rowStatus === "overdue"
              ? 15
              : r.rowStatus === "rejected"
                ? 30
                : 40;
      const prev = map.get(r.assignment.traineeId);
      if (
        !prev ||
        prev.taskTitle === "Chưa có task" ||
        (prev.status === "done" && r.rowStatus !== "done")
      ) {
        map.set(r.assignment.traineeId, {
          id: r.assignment.traineeId,
          name: r.assignment.traineeName,
          email: r.assignment.traineeEmail,
          dept: prev?.dept,
          taskTitle: r.taskTitle,
          status: r.rowStatus,
          pct,
        });
      }
    }
    return [...map.values()];
  }, [trainees, rows]);

  if (loading) {
    return <div className="ui-card h-64 animate-pulse" />;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo ›{" "}
          <span className="text-foreground/80">Nhóm & Task Training</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Quản lý Nhóm & Task Training
          </h1>
        </div>
        <p className="text-muted text-sm max-w-xl">
          Giao task và theo dõi tiến độ tân binh trong nhóm.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="ui-card !p-10 text-center text-muted text-sm">
          Bạn chưa được phân công nhóm training nào.
        </div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
            <AssignTaskForm
              groups={groups}
              trainees={trainees}
              onCreated={() => {
                toast.success("Đã giao task.");
                void load();
              }}
            />

            <section className="ui-card !p-5 space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">
                  Bảng theo dõi tiến độ training
                </h2>
                <p className="text-xs text-muted">
                  {progressByTrainee.length} tân binh
                </p>
              </div>

              {progressByTrainee.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  Chưa có tân binh trong nhóm.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide">
                        <th className="data-table-th pb-3 pr-3 font-semibold">
                          Thành viên
                        </th>
                        <th className="data-table-th pb-3 pr-3 font-semibold">
                          Task hiện tại
                        </th>
                        <th className="data-table-th pb-3 pr-3 font-semibold">
                          Trạng thái
                        </th>
                        <th className="data-table-th pb-3 font-semibold">
                          Tiến độ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressByTrainee.map((r) => (
                          <tr key={r.id}>
                            <td className="data-table-td py-3 pr-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={r.name} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {r.name}
                                  </p>
                                  <p className="truncate text-xs text-muted">
                                    {r.dept ?? r.email ?? "Tân binh"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="data-table-td py-3 pr-3 font-medium">
                              {r.taskTitle}
                            </td>
                            <td className="data-table-td py-3 pr-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${ROW_STATUS_CLASS[r.status]}`}
                              >
                                {ROW_STATUS_LABEL[r.status]}
                              </span>
                            </td>
                            <td className="data-table-td py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-24 overflow-hidden rounded-full bg-background shadow-hairline">
                                  <div
                                    className="h-full rounded-full bg-accent transition-all"
                                    style={{ width: `${r.pct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold">
                                  {r.pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Thành viên",
                value: String(kpis.members),
                icon: Users,
                tone: "text-sky-600 bg-sky-500/15",
              },
              {
                label: "Task đang chạy",
                value: String(kpis.running),
                icon: ListTodo,
                tone: "text-accent bg-accent/15",
              },
              {
                label: "Hoàn thành",
                value: `${kpis.doneRate}%`,
                icon: CheckCircle2,
                tone: "text-emerald-600 bg-emerald-500/15",
              },
              {
                label: "Cần hỗ trợ",
                value: String(kpis.needHelp).padStart(2, "0"),
                icon: AlertCircle,
                tone: "text-rose-600 bg-rose-500/15",
              },
            ].map((c) => (
              <article
                key={c.label}
                className="ui-card !p-5 flex items-center gap-4"
              >
                <span
                  className={`ui-well inline-flex h-12 w-12 shrink-0 ${c.tone}`}
                >
                  <Icon icon={c.icon} size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    {c.label}
                  </p>
                  <p className="font-display text-2xl font-extrabold">
                    {c.value}
                  </p>
                </div>
              </article>
            ))}
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
    </section>
  );
}
