// Placeholder tĩnh + lịch sử gửi mock (chưa có BE history). Templates/send = API thật.
import type { EmailHistoryItem, EmailPlaceholder } from "../types/email";

export const EMAIL_PLACEHOLDERS: EmailPlaceholder[] = [
  {
    key: "candidate_name",
    label: "Tên ứng viên / học viên",
    description: "Họ tên người nhận",
    sample: "Nguyễn Văn A",
    categories: ["recruitment", "training", "general"],
  },
  {
    key: "position",
    label: "Vị trí / Role",
    description: "Vai trò dự tuyển hoặc trong CLB",
    sample: "Member",
    categories: ["recruitment", "general"],
  },
  {
    key: "department",
    label: "Ban",
    description: "Ban nguyện vọng / ban phụ trách",
    sample: "Ban Chuyên môn",
    categories: ["recruitment", "training", "general"],
  },
  {
    key: "interview_date",
    label: "Ngày phỏng vấn",
    description: "Ngày PV đã xếp lịch",
    sample: "15/04/2026",
    categories: ["recruitment"],
  },
  {
    key: "interview_time",
    label: "Giờ phỏng vấn",
    description: "Khung giờ PV",
    sample: "19:00",
    categories: ["recruitment"],
  },
  {
    key: "location",
    label: "Địa điểm",
    description: "Phòng / cơ sở",
    sample: "P101 - IU",
    categories: ["recruitment", "event"],
  },
  {
    key: "meeting_link",
    label: "Link họp",
    description: "URL Google Meet / Zoom",
    sample: "https://meet.google.com/abc-defg-hij",
    categories: ["recruitment", "event", "training"],
  },
  {
    key: "club_name",
    label: "Tên CLB",
    description: "Thương hiệu gửi thư",
    sample: "IU CLUB",
    categories: ["recruitment", "training", "general", "event"],
  },
  {
    key: "contact_name",
    label: "Người liên hệ",
    description: "BCN / Leader phụ trách",
    sample: "Trần BCN",
    categories: ["recruitment", "training", "general"],
  },
  {
    key: "phone",
    label: "SĐT liên hệ",
    description: "Số điện thoại hỗ trợ",
    sample: "0901 234 567",
    categories: ["recruitment", "training", "general"],
  },
  {
    key: "email",
    label: "Email / tài khoản portal",
    description: "Email đăng ký của ứng viên (đăng nhập)",
    sample: "ungvien@gmail.com",
    categories: ["recruitment", "training", "general"],
  },
  {
    key: "temp_password",
    label: "Mật khẩu mặc định",
    description: "Ngày sinh dạng DDMMYYYY",
    sample: "15052006",
    categories: ["recruitment"],
  },
  {
    key: "login_url",
    label: "Link đăng nhập",
    description: "URL portal ứng viên",
    sample: "http://localhost:5173/login",
    categories: ["recruitment", "general"],
  },
  {
    key: "score",
    label: "Điểm",
    description: "Điểm hồ sơ / PV / training",
    sample: "8.5",
    categories: ["recruitment", "training"],
  },
  {
    key: "result",
    label: "Kết quả",
    description: "Pass / Fail / Đủ điều kiện…",
    sample: "Đạt",
    categories: ["recruitment", "training"],
  },
  {
    key: "program_name",
    label: "Lộ trình / Chương trình",
    description: "Tên chương trình training",
    sample: "Onboarding Gen 4",
    categories: ["training"],
  },
  {
    key: "certificate_code",
    label: "Mã chứng nhận",
    description: "Mã CN (nếu có)",
    sample: "IU-CERT-2026-001",
    categories: ["training"],
  },
];

export const historyStore: EmailHistoryItem[] = [];

export function resetEmailMockStores() {
  historyStore.splice(0, historyStore.length);
}
