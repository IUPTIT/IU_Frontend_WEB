// State form nộp đơn phía client — campaign/câu hỏi lấy từ API (publicRecruitmentService)
export type ApplicationForm = {
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  wishes: string[]; // ban nguyện vọng theo thứ tự ưu tiên, tối đa 2
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
  wishes: [""],
  answers: {},
};
