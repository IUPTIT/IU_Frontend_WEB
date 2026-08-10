/** Types module Tuyển dụng (Recruitment) — Admin */

export type CampaignStatus = "draft" | "published" | "closed" | "completed";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "file_upload"
  | "rating";

export type PassFail = "pass" | "fail" | "pending";

/** Chỉ tiêu theo từng ban */
export type DepartmentQuota = {
  departmentId: string;
  departmentName: string;
  quota: number;
};

export type RecruitmentCampaign = {
  id: string;
  name: string; // Tên đợt tuyển *
  description?: string;
  /** null = chưa set (nháp) → UI hiện --/--/---- */
  openAt: string | null;
  closeAt: string | null;
  quotas: DepartmentQuota[]; // Chỉ tiêu theo từng ban *
  status: CampaignStatus;
  /** Cột Kích hoạt trên bảng danh sách */
  isActive: boolean;
  closeReason?: string; // Lý do đóng sớm
  createdAt: string;
  updatedAt: string;
};

/** Label trạng thái hiển thị trên UI danh sách */
export type CampaignStatusLabel = "Đang mở" | "Đã đóng" | "Đã hoàn tất" | "Nháp";

export type FormOption = {
  id: string;
  label: string;
  order: number;
};

export type FormQuestion = {
  id: string;
  campaignId: string;
  content: string; // Nội dung câu hỏi *
  type: QuestionType; // Loại câu hỏi *
  required: boolean;
  order: number;
  options?: FormOption[]; // cho choice/rating
};

export type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "interview_passed"
  | "accepted"
  | "rejected"
  | "cv_failed"
  | "interview_failed";

export type Application = {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  phone?: string;
  /** ISO date — dùng tạo MK mặc định DDMMYYYY khi gửi email Pass */
  dateOfBirth?: string | null;
  /** VD: K62 - Khoa CNTT */
  education?: string;
  preferredDepartmentId: string; // Ban nguyện vọng (NV1 hoặc assigned)
  preferredDepartmentName: string;
  /** Toàn bộ NV theo thứ tự ưu tiên — dùng đổi ban trước trúng tuyển */
  departmentPreferences: { department: string; priority: number }[];
  /** Ban chính thức BCN gán (nếu có) */
  assignedDepartment?: string | null;
  status: ApplicationStatus;
  screeningResult: PassFail;
  interviewResult: PassFail;
  finalResult: PassFail;
  totalScore?: number;
  /** Điểm phỏng vấn (nếu có) */
  interviewScore?: number;
  submittedAt: string;
  attachments?: ApplicationAttachment[];
  /** Cảnh báo chênh điểm reviewer >30% */
  needsManualReview?: boolean;
  /** Người được phân công chấm vòng đơn */
  reviewerIds?: string[];
  reviewerNames?: string[];
  /** Trạng thái xử lý sau kết quả cuối: chờ / đã gửi email / đã chuyển Member */
  resultNotifyStatus?: "pending" | "email_sent" | "converted";
};

export type ApplicationAttachment = {
  id: string;
  label: string;
  kind: "pdf" | "link";
  url: string;
};

export type ApplicationAnswer = {
  id: string;
  applicationId: string;
  questionId: string;
  questionOrder: number;
  questionContent: string;
  value: string | string[] | number;
};

export type ReviewAssignment = {
  id: string;
  applicationIds: string[];
  reviewerId: string;
  reviewerName: string;
};

export type ScreeningCriterion = {
  id: string;
  name: string;
  maxScore: number;
};

export type ApplicationScore = {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type InterviewerRef = {
  id: string;
  name: string;
  role?: "bcn" | "leader" | "member";
};

export type InterviewSlotStatus = "scheduled" | "missing_interviewers" | "done";

export type InterviewSlot = {
  /** ID ca backend (hoặc row id cũ slotId::… — service tự parse) */
  id: string;
  /** ID booking backend (chỉ khi view flatten theo ứng viên — legacy) */
  bookingId?: string;
  campaignId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  locationOrLink: string;
  /** Số ứng viên tối đa của ca */
  capacity?: number;
  /** Số ứng viên đã đặt lịch vào ca */
  bookedCount?: number;
  applicationId?: string;
  candidateName?: string;
  candidateDepartment?: string;
  interviewers: InterviewerRef[];
  /** @deprecated Không còn bắt buộc số PV tối thiểu — giữ để tương thích */
  requiredInterviewers?: number;
  status: InterviewSlotStatus;
};

export type InterviewCriterion = {
  id: string;
  name: string;
  maxScore: number;
};

export type InterviewScore = {
  id: string;
  applicationId: string;
  slotId: string;
  interviewerId: string;
  interviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment: string;
  result: PassFail;
  createdAt: string;
  updatedAt?: string;
};

export type RecruitmentStats = {
  campaignId: string;
  totalApplications: number;
  screeningPassRate: number;
  interviewPassRate: number;
  acceptRateByDepartment: { departmentId: string; departmentName: string; rate: number }[];
};
