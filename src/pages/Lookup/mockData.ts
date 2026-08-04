import type { ApplicationRecord } from "./types";

// Mock hồ sơ — sau này thay bằng services/recruitmentService.lookupApplication(emailOrCode)
export const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    code: "APP-2026F-0142",
    email: "an.nguyen@student.edu.vn",
    fullName: "Nguyễn Văn An",
    campaignName: "Tuyển thành viên Kỳ Fall 2026",
    submittedAt: "2026-08-01T10:30:00+07:00",
    wishes: ["Ban Kỹ thuật", "Ban Truyền thông"],
    status: "cho_xet_duyet",
  },
  {
    code: "APP-2026F-0087",
    email: "binh.tran@student.edu.vn",
    fullName: "Trần Thanh Bình",
    campaignName: "Tuyển thành viên Kỳ Fall 2026",
    submittedAt: "2026-07-28T15:12:00+07:00",
    wishes: ["Ban Sự kiện"],
    status: "dat_vong_don",
    note: "Chúc mừng! Hãy đăng nhập bằng tài khoản đã gửi qua email để đặt lịch phỏng vấn.",
  },
  {
    code: "APP-2026F-0023",
    email: "chi.le@student.edu.vn",
    fullName: "Lê Minh Chi",
    campaignName: "Tuyển thành viên Kỳ Fall 2026",
    submittedAt: "2026-07-20T09:00:00+07:00",
    wishes: ["Ban Nội dung", "Ban Đối ngoại", "Ban Truyền thông"],
    status: "trung_tuyen",
    note: "Chào mừng bạn trở thành thành viên chính thức của IU Club!",
  },
];

export function lookupApplication(query: string): ApplicationRecord | undefined {
  const q = query.trim().toLowerCase();
  return MOCK_APPLICATIONS.find((a) => a.code.toLowerCase() === q || a.email.toLowerCase() === q);
}
