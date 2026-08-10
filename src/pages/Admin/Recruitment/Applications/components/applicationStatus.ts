import type { ApplicationStatus } from "../../../../../types/recruitment";

/** Label trạng thái theo tài liệu nghiệp vụ (Phụ lục VIII.1) */
export type ApplicationStatusLabel =
  | "Chờ xét duyệt"
  | "Đạt vòng đơn"
  | "Không đạt vòng đơn"
  | "Đạt phỏng vấn"
  | "Không đạt phỏng vấn"
  | "Trúng tuyển"
  | "Không trúng tuyển";

export function getApplicationStatusLabel(status: ApplicationStatus): ApplicationStatusLabel {
  switch (status) {
    case "submitted":
    case "screening":
      return "Chờ xét duyệt";
    case "interview":
      return "Đạt vòng đơn";
    case "cv_failed":
      return "Không đạt vòng đơn";
    case "interview_passed":
      return "Đạt phỏng vấn";
    case "interview_failed":
      return "Không đạt phỏng vấn";
    case "accepted":
      return "Trúng tuyển";
    case "rejected":
      return "Không trúng tuyển";
  }
}
