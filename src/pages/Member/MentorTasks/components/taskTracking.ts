import type { MentorTask, MentorTaskAssignment } from "../../../../services/trainingService";

export type TrackRowStatus =
  | "doing"
  | "review"
  | "done"
  | "overdue"
  | "rejected";

export type TrackRow = {
  key: string;
  taskId: string;
  taskTitle: string;
  groupName?: string;
  deadline?: string;
  description?: string;
  attachmentUrl?: string;
  assignment: MentorTaskAssignment;
  rowStatus: TrackRowStatus;
};

export function resolveRowStatus(
  a: MentorTaskAssignment,
  deadline?: string,
): TrackRowStatus {
  const overdue =
    !!deadline &&
    new Date(deadline).getTime() < Date.now() &&
    a.status !== "approved";
  if (overdue) return "overdue";
  if (a.status === "approved") return "done";
  if (a.status === "submitted") return "review";
  if (a.status === "rejected") return "rejected";
  return "doing";
}

export function flattenTaskRows(tasks: MentorTask[]): TrackRow[] {
  return tasks.flatMap((t) =>
    t.assignments.map((a) => ({
      key: `${t.id}-${a.traineeId}`,
      taskId: t.id,
      taskTitle: t.title,
      groupName: t.groupName,
      deadline: t.deadline,
      description: t.description,
      attachmentUrl: t.attachmentUrl,
      assignment: a,
      rowStatus: resolveRowStatus(a, t.deadline),
    })),
  );
}

export function computeTaskKpis(rows: TrackRow[]) {
  const total = rows.length;
  const doing = rows.filter((r) => r.rowStatus === "doing").length;
  const review = rows.filter((r) => r.rowStatus === "review").length;
  const done = rows.filter((r) => r.rowStatus === "done").length;
  const overdue = rows.filter((r) => r.rowStatus === "overdue").length;
  const withScore = rows.filter(
    (r) => r.assignment.status === "approved" && r.assignment.score != null,
  );
  const passRate =
    withScore.length === 0
      ? null
      : Math.round(
          (withScore.filter((r) => (r.assignment.score ?? 0) >= 5).length /
            withScore.length) *
            100,
        );
  return { total, doing, review, done, overdue, passRate };
}

export const ROW_STATUS_LABEL: Record<TrackRowStatus, string> = {
  doing: "Đang làm",
  review: "Cần review",
  done: "Hoàn thành",
  overdue: "Quá hạn",
  rejected: "Trả lại",
};

export const ROW_STATUS_CLASS: Record<TrackRowStatus, string> = {
  doing: "bg-sky-500/15 text-sky-700",
  review: "bg-accent/15 text-accent",
  done: "bg-emerald-500/15 text-emerald-700",
  overdue: "bg-rose-500/15 text-rose-600",
  rejected: "bg-amber-500/15 text-amber-700",
};
