// State form nộp đơn phía client — campaign/câu hỏi lấy từ API (publicRecruitmentService)
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
  answers: Record<string, string | string[]>; // key = _id câu hỏi
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
