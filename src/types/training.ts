/** Types module Đào tạo thành viên mới — dùng chung Admin / Leader / Member */

export type TraineeStatus = "pending" | "in_progress" | "completed" | "removed";

export type TrainingTaskStatus = "todo" | "submitted" | "graded" | "overdue";

export type PenaltyActionType = "final_reminder" | "remove_from_club";

export type LessonKind = "doc" | "video" | "practice";

export type TraineeEvalStatus = "studying" | "qualified" | "failed" | "certified";

export type Trainee = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  campaignId: string; // đợt tuyển nguồn
  status: TraineeStatus;
  groupId?: string;
  mentorId?: string;
  mentorName?: string;
  /** Đánh giá tổng kết */
  avgScore?: number;
  sessionsDone?: number;
  sessionsTotal?: number;
  evalStatus?: TraineeEvalStatus;
  cohortLabel?: string; // VD: Tân binh - Khóa K20
};

export type TrainingStage = {
  id: string;
  name: string;
  order: number;
  weekLabel?: string;
  durationWeeks?: number;
  startAt?: string;
  endAt?: string;
};

export type TrainingLesson = {
  id: string;
  stageId: string;
  title: string;
  content?: string;
  attachmentUrl?: string;
  kind?: LessonKind;
  durationLabel?: string;
};

export type TrainingProgram = {
  id: string;
  name: string; // Tên lộ trình *
  departmentId: string; // Ban áp dụng *
  departmentName: string;
  /** User id của người tạo (mentor) — dùng lọc "lộ trình của tôi" */
  createdById?: string;
  stages: TrainingStage[];
  lessons: TrainingLesson[];
  createdAt: string;
  updatedAt: string;
};

export type TrainingMentor = {
  id: string;
  name: string;
  roleLabel: string;
  departmentId: string;
};

export type TrainingGroup = {
  id: string;
  name: string;
  programId: string;
  departmentId: string;
  departmentName?: string;
  specialtyLabel?: string;
  memberIds: string[];
  mentorId?: string;
  mentorName?: string;
  mentorAccepted?: boolean;
};

export type TrainingTask = {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assigneeIds: string[]; // thành viên/nhóm được giao
  attachmentUrl?: string;
  deadline: string; // ISO
  createdBy: string;
  createdAt: string;
};

export type TrainingTaskSubmission = {
  id: string;
  taskId: string;
  traineeId: string;
  fileUrl?: string;
  linkUrl?: string;
  note?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: TrainingTaskStatus;
};

export type TraineeFinalEvaluation = {
  id: string;
  traineeId: string;
  mentorId: string;
  overallComment: string;
  competencyScore?: number; // điểm năng lực — thang chưa chốt
  completed: boolean;
  note?: string;
  evaluatedAt: string;
};

export type TrainingCertificate = {
  id: string;
  traineeId: string;
  type: string; // loại chứng nhận/huy hiệu
  issuedAt: string;
  issuedBy: string;
};

export type TrainingProgress = {
  traineeId: string;
  percentComplete: number;
  completedTasks: number;
  totalTasks: number;
};

export type TrainingChatMessage = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export type TrainingCompletionReport = {
  campaignId: string;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    completed: number;
    incomplete: number;
  }[];
};

export type TrainingPenaltyAction = {
  id: string;
  traineeId: string;
  reason: string;
  action: PenaltyActionType;
  createdAt: string;
  createdBy: string;
};
