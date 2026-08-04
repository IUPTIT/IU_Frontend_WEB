export type RecruitmentCampaign = {
  id: string;
  name: string;
  description: string;
  openAt: string; // ISO — thời gian mở đơn
  closeAt: string; // ISO — thời gian đóng đơn
  teams: string[];
};

export type CustomQuestionType = "short_text" | "long_text" | "single_choice" | "multi_choice";

export type CustomQuestion = {
  id: string;
  label: string;
  type: CustomQuestionType;
  options?: string[];
  required: boolean;
};

export type ApplicationForm = {
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: File | null;
  cv: File | null;
  wishes: string[]; // ban nguyện vọng theo thứ tự ưu tiên, tối đa 3
  answers: Record<string, string | string[]>;
};

export const EMPTY_APPLICATION: ApplicationForm = {
  fullName: "",
  studentId: "",
  className: "",
  faculty: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  avatar: null,
  cv: null,
  wishes: [""],
  answers: {},
};
