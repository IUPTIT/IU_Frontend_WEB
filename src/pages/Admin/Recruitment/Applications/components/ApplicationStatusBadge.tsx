import type { ApplicationStatus } from "../../../../../types/recruitment";
import { badgeToneClass, type BadgeTone } from "../../../../../components/ui/Badge";

/** Label trạng thái hiển thị trên UI Vòng hồ sơ (theo design) */
export type ApplicationStatusLabel =
  | "Mới nộp"
  | "Đang đánh giá"
  | "Chờ phỏng vấn"
  | "Đã đậu"
  | "Loại";

export function getApplicationStatusLabel(status: ApplicationStatus): ApplicationStatusLabel {
  switch (status) {
    case "submitted":
      return "Mới nộp";
    case "screening":
      return "Đang đánh giá";
    case "interview":
      return "Chờ phỏng vấn";
    case "accepted":
      return "Đã đậu";
    case "rejected":
      return "Loại";
  }
}

const statusTone: Record<ApplicationStatusLabel, BadgeTone> = {
  "Mới nộp": "violet",
  "Đang đánh giá": "accent",
  "Chờ phỏng vấn": "success",
  "Đã đậu": "info",
  Loại: "danger",
};

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const label = getApplicationStatusLabel(status);
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeToneClass[statusTone[label]]}`}>
      {label}
    </span>
  );
}

export default ApplicationStatusBadge;
