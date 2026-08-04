// TODO: MOCK — Email SMTP / templates / history. Thay bằng API thật khi BE sẵn sàng.
import type {
  EmailHistoryItem,
  EmailPlaceholder,
  EmailTemplate,
  SmtpConfig,
} from "../types/email";

export const DEFAULT_SMTP: SmtpConfig = {
  host: "smtp.gmail.com",
  port: 587,
  username: "noreply@iuclub.edu.vn",
  password: "",
  encryption: "tls",
  senderName: "IU CLUB",
  senderEmail: "noreply@iuclub.edu.vn",
  replyTo: "bcn@iuclub.edu.vn",
  enabled: true,
};

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
    label: "Email liên hệ",
    description: "Email hỗ trợ / reply",
    sample: "bcn@iuclub.edu.vn",
    categories: ["recruitment", "training", "general"],
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

const now = () => new Date().toISOString();

export const smtpStore: SmtpConfig = { ...DEFAULT_SMTP };

export const templatesStore: EmailTemplate[] = [
  {
    id: "tpl-interview",
    name: "Interview Invitation",
    category: "recruitment",
    subject: "[IU CLUB] Thư mời phỏng vấn",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Bạn đã vượt qua vòng hồ sơ của <strong>{{club_name}}</strong>.</p>
<p><strong>Thời gian:</strong> {{interview_time}} — {{interview_date}}<br/>
<strong>Địa điểm:</strong> {{location}}<br/>
<strong>Link họp (nếu online):</strong> {{meeting_link}}</p>
<p>Vui lòng có mặt trước 15 phút. Mọi thắc mắc liên hệ {{contact_name}} ({{phone}}).</p>
<p>Hẹn gặp bạn!</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-passed",
    name: "Passed",
    category: "recruitment",
    subject: "[IU CLUB] Chúc mừng — Bạn đã đậu tuyển thành viên",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Chúc mừng bạn đã <strong>đậu</strong> đợt tuyển của {{club_name}} — ban {{department}}.</p>
<p>Kết quả: {{result}} · Điểm: {{score}}</p>
<p>Chúng tôi sẽ liên hệ các bước tiếp theo qua email này.</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-rejected",
    name: "Rejected",
    category: "recruitment",
    subject: "[IU CLUB] Thông báo kết quả tuyển thành viên",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Cảm ơn bạn đã tham gia đợt tuyển {{club_name}}.</p>
<p>Rất tiếc lần này bạn chưa phù hợp với ban {{department}}. Kết quả: {{result}}.</p>
<p>Hẹn gặp lại bạn ở các cơ hội sau!</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-reminder",
    name: "Reminder",
    category: "recruitment",
    subject: "[IU CLUB] Nhắc lịch phỏng vấn",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Nhắc bạn lịch PV: <strong>{{interview_time}}</strong> ngày {{interview_date}} tại {{location}}.</p>
<p>Link: {{meeting_link}}</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-welcome",
    name: "Welcome",
    category: "general",
    subject: "[IU CLUB] Chào mừng thành viên mới",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Chào mừng bạn đến với <strong>{{club_name}}</strong> — ban {{department}}!</p>
<p>Mọi hỗ trợ: {{contact_name}} · {{email}} · {{phone}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-training-complete",
    name: "Training Complete",
    category: "training",
    subject: "[IU CLUB] Hoàn thành lộ trình training",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Chúc mừng bạn đã hoàn thành chương trình <strong>{{program_name}}</strong>.</p>
<p>Kết quả: {{result}} · Điểm: {{score}}</p>
<p>Mã chứng nhận: {{certificate_code}}</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-screening",
    name: "Screening Update",
    category: "recruitment",
    subject: "[IU CLUB] Cập nhật vòng hồ sơ",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Hồ sơ của bạn tại ban {{department}} đã được cập nhật.</p>
<p>Kết quả vòng hồ sơ: <strong>{{result}}</strong> · Điểm ĐG: {{score}}</p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const historyStore: EmailHistoryItem[] = [];

export function resetEmailMockStores() {
  Object.assign(smtpStore, DEFAULT_SMTP);
  historyStore.splice(0, historyStore.length);
}
