import type { ApplicationStatus } from "../../../../../types/recruitment";
import { badgeToneClass, type BadgeTone } from "../../../../../components/ui/badgeTones";
import { getApplicationStatusLabel, type ApplicationStatusLabel } from "./applicationStatus";

const statusTone: Record<ApplicationStatusLabel, BadgeTone> = {
  "Chờ xét duyệt": "violet",
  "Đạt vòng đơn": "success",
  "Không đạt vòng đơn": "danger",
  "Đạt phỏng vấn": "info",
  "Không đạt phỏng vấn": "danger",
  "Trúng tuyển": "info",
  "Không trúng tuyển": "danger",
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
