import type {
  StatCard,
  FunnelStage,
  WeeklySubmission,
  TrainingScore,
  TraineeDepartment,
  PendingReview,
} from "../../types/admin";

export type DashboardSeason = {
  id: string;
  label: string;
  statCards: StatCard[];
  recruitmentFunnel: FunnelStage[];
  weeklySubmissions: WeeklySubmission[];
  /** Dữ liệu theo ngày — dùng khi filter "Ngày" */
  dailySubmissions: WeeklySubmission[];
  trainingScores: TrainingScore[];
  traineeTotal: number;
  /** Tổng thành viên chính thức của CLB — điểm cuối "Hành trình thành viên" */
  totalMembers: number;
  traineeDepartments: TraineeDepartment[];
  pendingReview: PendingReview;
};

// TODO: MOCK — thay bằng API thật khi có backend
export const DASHBOARD_SEASONS: DashboardSeason[] = [
  {
    id: "fall-2023",
    label: "Mùa Thu 2023",
    // KPI bổ sung — KHÔNG lặp số của phễu "Hành trình thành viên"
    statCards: [
      { id: "pass-rate", label: "Tỷ lệ vượt vòng", value: 37, suffix: "%", badge: "+4%", badgeTone: "accent", icon: "percent" },
      { id: "sessions", label: "Buổi training tuần này", value: 6, badge: "Tuần 5/8", badgeTone: "purple", icon: "calendar" },
      { id: "avg-score", label: "Điểm TB đánh giá", value: 8.8, decimals: 1, badge: "+0.7", badgeTone: "green", icon: "star" },
      { id: "mentors", label: "Mentor đang dẫn", value: 9, badge: "4 đội", badgeTone: "muted", icon: "mentor" },
    ],
    recruitmentFunnel: [
      { id: "applied", label: "Nộp đơn", value: 342, percent: 100, tone: "accent" },
      { id: "screened", label: "Qua vòng đơn", value: 156, percent: 45, tone: "accent" },
      { id: "interviewed", label: "Đã phỏng vấn", value: 128, percent: 37, tone: "purple" },
      { id: "trainee", label: "Trở thành Trainee", value: 45, percent: 13.1, tone: "green" },
    ],
    weeklySubmissions: [
      { week: "Tuần 1", received: 28, passed: 12 },
      { week: "Tuần 2", received: 45, passed: 26 },
      { week: "Tuần 3", received: 88, passed: 68 },
      { week: "Tuần 4", received: 62, passed: 55 },
      { week: "Tuần 5", received: 102, passed: 84 },
      { week: "Tuần 6", received: 38, passed: 11 },
    ],
    dailySubmissions: [
      { week: "T2", received: 12, passed: 5 },
      { week: "T3", received: 18, passed: 9 },
      { week: "T4", received: 22, passed: 14 },
      { week: "T5", received: 15, passed: 11 },
      { week: "T6", received: 28, passed: 20 },
      { week: "T7", received: 9, passed: 4 },
      { week: "CN", received: 6, passed: 2 },
    ],
    trainingScores: [
      { session: "Buổi 1", avgScore: 5.8 },
      { session: "Buổi 2", avgScore: 6.5 },
      { session: "Buổi 3", avgScore: 7.2 },
      { session: "Buổi 4", avgScore: 6.9 },
      { session: "Buổi 5", avgScore: 8.1 },
      { session: "Buổi 6", avgScore: 8.8 },
    ],
    traineeTotal: 45,
    totalMembers: 187,
    traineeDepartments: [
      { id: "professional", label: "Chuyên Môn", percent: 40, tone: "accent" },
      { id: "media", label: "Truyền Thông", percent: 30, tone: "purple" },
      { id: "events", label: "Sự Kiện", percent: 20, tone: "green" },
      { id: "logistics", label: "Hậu Cần", percent: 10, tone: "muted" },
    ],
    pendingReview: {
      count: 12,
      message: "Vòng phỏng vấn chuyên môn ban Truyền thông cần hoàn tất đánh giá trước 20/09.",
      deadline: "2023-09-20",
    },
  },
  {
    id: "spring-2024",
    label: "Mùa Xuân 2024",
    // KPI bổ sung — KHÔNG lặp số của phễu "Hành trình thành viên"
    statCards: [
      { id: "pass-rate", label: "Tỷ lệ vượt vòng", value: 41, suffix: "%", badge: "+3%", badgeTone: "accent", icon: "percent" },
      { id: "sessions", label: "Buổi training tuần này", value: 6, badge: "Tuần 4/8", badgeTone: "purple", icon: "calendar" },
      { id: "avg-score", label: "Điểm TB đánh giá", value: 8.4, decimals: 1, badge: "+0.4", badgeTone: "green", icon: "star" },
      { id: "mentors", label: "Mentor đang dẫn", value: 7, badge: "3 đội", badgeTone: "muted", icon: "mentor" },
    ],
    recruitmentFunnel: [
      { id: "applied", label: "Nộp đơn", value: 210, percent: 100, tone: "accent" },
      { id: "screened", label: "Qua vòng đơn", value: 98, percent: 47, tone: "accent" },
      { id: "interviewed", label: "Đã phỏng vấn", value: 86, percent: 41, tone: "purple" },
      { id: "trainee", label: "Trở thành Trainee", value: 32, percent: 15.2, tone: "green" },
    ],
    weeklySubmissions: [
      { week: "Tuần 1", received: 22, passed: 10 },
      { week: "Tuần 2", received: 35, passed: 18 },
      { week: "Tuần 3", received: 48, passed: 30 },
      { week: "Tuần 4", received: 55, passed: 40 },
      { week: "Tuần 5", received: 30, passed: 22 },
      { week: "Tuần 6", received: 20, passed: 12 },
    ],
    dailySubmissions: [
      { week: "T2", received: 8, passed: 3 },
      { week: "T3", received: 11, passed: 6 },
      { week: "T4", received: 14, passed: 9 },
      { week: "T5", received: 10, passed: 7 },
      { week: "T6", received: 16, passed: 11 },
      { week: "T7", received: 5, passed: 2 },
      { week: "CN", received: 4, passed: 1 },
    ],
    trainingScores: [
      { session: "Buổi 1", avgScore: 6.2 },
      { session: "Buổi 2", avgScore: 6.8 },
      { session: "Buổi 3", avgScore: 7.0 },
      { session: "Buổi 4", avgScore: 7.5 },
      { session: "Buổi 5", avgScore: 8.0 },
      { session: "Buổi 6", avgScore: 8.4 },
    ],
    traineeTotal: 32,
    totalMembers: 201,
    traineeDepartments: [
      { id: "professional", label: "Chuyên Môn", percent: 45, tone: "accent" },
      { id: "media", label: "Truyền Thông", percent: 25, tone: "purple" },
      { id: "events", label: "Sự Kiện", percent: 20, tone: "green" },
      { id: "logistics", label: "Hậu Cần", percent: 10, tone: "muted" },
    ],
    pendingReview: {
      count: 5,
      message: "Còn 5 hồ sơ ban Kỹ thuật chờ chấm vòng phỏng vấn trước 15/03.",
      deadline: "2024-03-15",
    },
  },
];

/** Giữ export cũ để service cũ không gãy — trỏ season mặc định */
export const CURRENT_SEASON = DASHBOARD_SEASONS[0].label;
export const statCards = DASHBOARD_SEASONS[0].statCards;
export const recruitmentFunnel = DASHBOARD_SEASONS[0].recruitmentFunnel;
export const weeklySubmissions = DASHBOARD_SEASONS[0].weeklySubmissions;
export const trainingScores = DASHBOARD_SEASONS[0].trainingScores;
export const traineeTotal = DASHBOARD_SEASONS[0].traineeTotal;
export const traineeDepartments = DASHBOARD_SEASONS[0].traineeDepartments;
export const pendingReview = DASHBOARD_SEASONS[0].pendingReview;
