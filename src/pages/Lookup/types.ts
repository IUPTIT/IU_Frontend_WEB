import type { PublicApplicationStatus } from "../../services/publicRecruitmentService";

export const STATUS_LABEL: Record<PublicApplicationStatus, string> = {
  pending: "Chờ xét duyệt",
  passed_screening: "Đạt vòng đơn",
  failed_screening: "Không đạt vòng đơn",
  passed_interview: "Đạt phỏng vấn",
  failed_interview: "Không đạt phỏng vấn",
  accepted: "Trúng tuyển",
  rejected: "Không trúng tuyển",
  withdrawn: "Đã rút đơn",
};
