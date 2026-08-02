import type {
  StatCard,
  FunnelStage,
  WeeklySubmission,
  TrainingScore,
  TraineeDepartment,
  PendingReview,
} from "../../types/admin";

// Mock data cho trang Admin — Tổng quan Hoạt động (đợt Mùa Thu 2023).
// Khi có API thật, thay bằng gọi qua src/services/ và giữ nguyên types ở src/types/admin.ts.

export const CURRENT_SEASON = "Mùa Thu 2023";

export const statCards: StatCard[] = [
  { id: "applications", label: "Tổng hồ sơ nhận", value: 342, badge: "+12%", badgeTone: "accent", icon: "file" },
  { id: "interviewed", label: "Đã phỏng vấn", value: 128, badge: "37% tỷ lệ qua đơn", badgeTone: "purple", icon: "chat" },
  { id: "trainees", label: "Đang đào tạo (Trainee)", value: 45, badge: "Đang diễn ra", badgeTone: "green", icon: "graduation" },
  { id: "members", label: "Tổng thành viên CLB", value: 187, badge: "+45 (Dự kiến)", badgeTone: "green", icon: "members" },
];

// Phễu Tuyển dụng — tỷ lệ chuyển đổi qua các vòng
export const recruitmentFunnel: FunnelStage[] = [
  { id: "applied", label: "Nộp đơn", value: 342, percent: 100, tone: "accent" },
  { id: "screened", label: "Qua vòng đơn", value: 156, percent: 45, tone: "accent" },
  { id: "interviewed", label: "Đã phỏng vấn", value: 128, percent: 37, tone: "purple" },
  { id: "trainee", label: "Trở thành Trainee", value: 45, percent: 13.1, tone: "green" },
];

// Tiến độ nộp hồ sơ — theo tuần, Tháng 9/2023
export const weeklySubmissions: WeeklySubmission[] = [
  { week: "Tuần 1", received: 28, passed: 12 },
  { week: "Tuần 2", received: 45, passed: 26 },
  { week: "Tuần 3", received: 88, passed: 68 },
  { week: "Tuần 4", received: 62, passed: 55 },
  { week: "Tuần 5", received: 102, passed: 84 },
  { week: "Tuần 6", received: 38, passed: 11 },
];

// Đánh giá Năng lực Trainee — điểm trung bình qua các buổi training
export const trainingScores: TrainingScore[] = [
  { session: "Buổi 1", avgScore: 5.8 },
  { session: "Buổi 2", avgScore: 6.5 },
  { session: "Buổi 3", avgScore: 7.2 },
  { session: "Buổi 4", avgScore: 6.9 },
  { session: "Buổi 5", avgScore: 8.1 },
  { session: "Buổi 6", avgScore: 8.8 },
];

// Cơ cấu Trainee — phân bổ theo Ban chuyên môn
export const traineeTotal = 45;
export const traineeDepartments: TraineeDepartment[] = [
  { id: "professional", label: "Chuyên Môn", percent: 40, tone: "accent" },
  { id: "media", label: "Truyền Thông", percent: 30, tone: "purple" },
  { id: "events", label: "Sự Kiện", percent: 20, tone: "green" },
  { id: "logistics", label: "Hậu Cần", percent: 10, tone: "muted" },
];

// Banner nhắc việc cuối trang
export const pendingReview: PendingReview = {
  count: 12,
  message: "Vòng phỏng vấn chuyên môn ban Truyền thông cần hoàn tất đánh giá trước 20/09.",
  deadline: "2023-09-20",
};