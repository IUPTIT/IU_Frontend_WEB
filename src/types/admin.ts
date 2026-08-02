// Types cho trang Admin — Tổng quan Hoạt động

export type Tone = "accent" | "purple" | "green" | "muted";

export type StatCard = {
  id: string;
  label: string;
  value: number;
  badge: string; // text trong pill góc phải (vd "+12%", "Đang diễn ra")
  badgeTone: Tone;
  icon: "file" | "chat" | "graduation" | "members";
};

export type FunnelStage = {
  id: string;
  label: string;
  value: number;
  percent: number; // % so với tổng nộp đơn
  tone: Tone;
};

export type WeeklySubmission = {
  week: string; // "Tuần 1"...
  received: number; // Hồ sơ nhận
  passed: number; // Đạt vòng đơn
};

export type TrainingScore = {
  session: string; // "Buổi 1"...
  avgScore: number; // điểm trung bình /10
};

export type TraineeDepartment = {
  id: string;
  label: string;
  percent: number;
  tone: Tone;
};

export type PendingReview = {
  count: number;
  message: string;
  deadline: string; // ISO date
};
