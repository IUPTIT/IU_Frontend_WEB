import type { ApplicationStatus } from "../../../../../types/recruitment";

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
