import type { CustomQuestion, RecruitmentCampaign } from "./types";

// Mock đợt tuyển đang mở — sau này lấy từ services/recruitmentService
export const ACTIVE_CAMPAIGN: RecruitmentCampaign = {
  id: "fall-2026",
  name: "Tuyển thành viên Kỳ Fall 2026",
  description:
    "IU Club mở đơn tuyển thành viên mới cho tất cả các ban. Điền form bên dưới để ứng tuyển — kết quả vòng đơn sẽ được gửi qua email.",
  openAt: "2026-08-01T00:00:00+07:00",
  closeAt: "2026-09-15T23:59:59+07:00",
  teams: ["Ban Kỹ thuật", "Ban Truyền thông", "Ban Sự kiện", "Ban Nội dung", "Ban Đối ngoại"],
};

// Câu hỏi riêng của đợt tuyển do BCN cấu hình (mock)
export const CUSTOM_QUESTIONS: CustomQuestion[] = [
  {
    id: "q-motivation",
    label: "Vì sao bạn muốn tham gia IU Club?",
    type: "long_text",
    required: true,
  },
  {
    id: "q-time",
    label: "Bạn có thể dành bao nhiêu giờ mỗi tuần cho câu lạc bộ?",
    type: "single_choice",
    options: ["Dưới 3 giờ", "3–6 giờ", "6–10 giờ", "Trên 10 giờ"],
    required: true,
  },
];
