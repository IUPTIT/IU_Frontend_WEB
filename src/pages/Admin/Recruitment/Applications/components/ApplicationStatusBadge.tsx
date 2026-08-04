import type { ApplicationStatus } from "../../../../../types/recruitment";
import { badgeToneClass, type BadgeTone } from "../../../../../components/ui/badgeTones";
import { getApplicationStatusLabel, type ApplicationStatusLabel } from "./applicationStatus";

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
