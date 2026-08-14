import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Eye,
  Heart,
  Plus,
  Rocket,
  Users,
} from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import { usePortalUi } from "../../context/usePortalUi";
import { useAuth } from "../../context/useAuth";
import { ROUTES } from "../../constants/routes";
import {
  getMentorTasks,
  getMyTeamTrainees,
  getTrainingGroups,
  type MentorTask,
} from "../../services/trainingService";
import {
  flattenTaskRows,
  ROW_STATUS_CLASS,
  ROW_STATUS_LABEL,
} from "../Member/MentorTasks/components/taskTracking";
import { formatDate } from "../../utils/formatDate";

function greetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

/** Tổng quan Leader — Soft UI theo mock + KPI/task training thật */
export default function LeaderOverviewPage() {
  const { navigate } = usePortalUi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [traineeCount, setTraineeCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [trainees, setTrainees] = useState<
    Awaited<ReturnType<typeof getMyTeamTrainees>>
  >([]);

  const load = useCallback(async () => {
    if (!user?.isMentor) return;
    const [groups, team, tk] = await Promise.all([
      getTrainingGroups(),
      getMyTeamTrainees(),
      getMentorTasks(),
    ]);
    const mine = groups.filter((g) => g.mentorId === user?.id);
    setGroupCount(mine.length);
    setTraineeCount(team.length);
    setTrainees(team);
    setTasks(tk);
  }, [user?.id, user?.isMentor]);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const rows = useMemo(() => flattenTaskRows(tasks), [tasks]);
  const pendingReview = rows.filter((r) => r.rowStatus === "review").length;
  const done = rows.filter((r) => r.rowStatus === "done").length;
  const health =
    rows.length === 0 ? 100 : Math.round((done / rows.length) * 100);

  const weekBars = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0]; // T2..CN
    for (const t of tasks) {
      for (const a of t.assignments) {
        if (!a.submittedAt) continue;
        const d = new Date(a.submittedAt).getDay(); // 0 CN
        const idx = d === 0 ? 6 : d - 1;
        days[idx] += 1;
      }
    }
    return days;
  }, [tasks]);
  const maxBar = Math.max(1, ...weekBars);

  const featured = useMemo(() => {
    return [...trainees]
      .map((t) => {
        const mine = rows.filter((r) => r.assignment.traineeId === t.id);
        const scored = mine.filter(
          (r) =>
            r.assignment.status === "approved" && r.assignment.score != null,
        );
        const avg =
          t.avgScore ??
          (scored.length
            ? scored.reduce((s, r) => s + (r.assignment.score ?? 0), 0) /
              scored.length
            : null);
        return {
          id: t.id,
          name: t.fullName,
          dept: t.departmentName,
          taskCount: mine.length,
          score: avg != null ? Math.round(avg * 10) / 10 : null,
        };
      })
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
      .slice(0, 3);
  }, [trainees, rows]);

  const recent = useMemo(() => {
    return [...rows]
      .sort((a, b) => {
        const ta = a.deadline ? new Date(a.deadline).getTime() : 0;
        const tb = b.deadline ? new Date(b.deadline).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [rows]);

  if (!user?.isMentor) {
    return (
      <section className="space-y-6">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tổng quan Leader Ban
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Quản lý thành viên Ban; quyền Mentor do BCN cấp riêng.
          </p>
        </header>
        <div className="ui-card !p-6">
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.leader.members)}
          >
            Quản lý thành viên Ban
          </Button>
        </div>
      </section>
    );
  }

  const firstName = user.name?.split(/\s+/).pop() ?? user.name ?? "Mentor";

  return (
    <section className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Leader Dashboard — Tổng quan
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          {greetingLabel()}, {firstName}. Tình hình đội ngũ training của bạn hôm
          nay.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ui-card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Tổng thành viên"
              value={String(traineeCount)}
              hint={`${groupCount} nhóm phụ trách`}
              icon={Users}
              tone="text-accent bg-accent/15"
            />
            <Kpi
              label="Task hoạt động"
              value={String(rows.filter((r) => r.rowStatus !== "done").length)}
              hint="Đang chạy / chờ review"
              icon={Rocket}
              tone="text-violet-600 bg-violet-500/15"
            />
            <Kpi
              label="Sức khỏe đội ngũ"
              value={`${health}%`}
              hint={health >= 80 ? "Tuyệt vời" : "Cần chú ý"}
              icon={Heart}
              tone="text-emerald-600 bg-emerald-500/15"
            />
            <button
              type="button"
              onClick={() => navigate(ROUTES.leader.training.tasks)}
              className="ui-card !p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="ui-well mb-3 inline-flex h-11 w-11 text-accent bg-accent/15">
                <Icon icon={Plus} size={20} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                Tạo task mới
              </p>
              <p className="font-display text-lg font-extrabold">
                Phân công đào tạo ngay
              </p>
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <article className="ui-card !p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    Tiến độ đào tạo đội ngũ
                  </h2>
                  <p className="text-xs text-muted">
                    Bài nộp theo ngày trong tuần (submittedAt)
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                  {pendingReview} chờ review
                </span>
              </div>
              <div className="flex h-44 items-end gap-2">
                {weekBars.map((v, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-32 w-full items-end justify-center rounded-2xl bg-background shadow-hairline px-1 pb-1">
                      <div
                        className="w-full max-w-[32px] rounded-t-xl bg-accent/70"
                        style={{
                          height: `${(v / maxBar) * 100}%`,
                          minHeight: v ? 6 : 0,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted">
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="ui-card !p-5 space-y-3">
              <h2 className="font-display text-lg font-bold">
                Thành viên nổi bật
              </h2>
              {featured.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  Chưa có tân binh.
                </p>
              ) : (
                <ul className="space-y-2">
                  {featured.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5 shadow-hairline"
                    >
                      <Avatar name={f.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {f.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {f.dept} · {f.taskCount} task
                        </p>
                      </div>
                      <span className="font-display text-lg font-extrabold text-accent">
                        {f.score != null ? f.score : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(ROUTES.leader.training.groups)}
              >
                Xem tất cả đội ngũ
              </Button>
            </article>
          </div>

          <article className="ui-card !p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">
                Phân công công việc gần đây
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(ROUTES.leader.training.tasks)}
                leftIcon={<Icon icon={ClipboardList} size={14} />}
              >
                Quản lý task
              </Button>
            </div>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Chưa có task nào.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wide">
                      <th className="data-table-th pb-3 pr-3">Tên công việc</th>
                      <th className="data-table-th pb-3 pr-3">Người phụ trách</th>
                      <th className="data-table-th pb-3 pr-3">Hạn chót</th>
                      <th className="data-table-th pb-3 pr-3">Trạng thái</th>
                      <th className="data-table-th pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.key}>
                        <td className="data-table-td py-3 pr-3 font-medium">
                          {r.taskTitle}
                        </td>
                        <td className="data-table-td py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={r.assignment.traineeName}
                              size="sm"
                            />
                            <span>{r.assignment.traineeName}</span>
                          </div>
                        </td>
                        <td className="data-table-td py-3 pr-3 text-muted">
                          {r.deadline ? formatDate(r.deadline) : "—"}
                        </td>
                        <td className="data-table-td py-3 pr-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${ROW_STATUS_CLASS[r.rowStatus]}`}
                          >
                            {ROW_STATUS_LABEL[r.rowStatus]}
                          </span>
                        </td>
                        <td className="data-table-td py-3 text-right">
                          <Button
                            variant="icon"
                            size="sm"
                            aria-label="Xem task"
                            onClick={() =>
                              navigate(ROUTES.leader.training.tasks)
                            }
                          >
                            <Icon icon={Eye} size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <article className="ui-card !p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
          {label}
        </p>
        <span className={`ui-well inline-flex h-10 w-10 ${tone}`}>
          <Icon icon={icon} size={18} />
        </span>
      </div>
      <p className="font-display text-3xl font-extrabold tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted">{hint}</p>
    </article>
  );
}
