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
    id: "tpl-cv-pass",
    name: "Pass vòng đơn",
    category: "recruitment",
    subject: "THÔNG BÁO KẾT QUẢ VÒNG ĐƠN – CLB IU ({{candidate_name}})",
    body: `<p><strong>THÔNG BÁO KẾT QUẢ VÒNG ĐƠN – CLB IU</strong></p>
<p>Xin chúc mừng <strong>{{candidate_name}}</strong>!</p>
<p>Sau quá trình xem xét hồ sơ đăng ký, Ban Tuyển thành viên CLB IU vui mừng thông báo rằng bạn đã <strong>vượt qua Vòng Đơn</strong> và chính thức bước tiếp vào <strong>Vòng Phỏng vấn</strong>.</p>
<p><strong>Thông tin phỏng vấn:</strong></p>
<ul>
<li>Thời gian: <strong>{{interview_time}}</strong></li>
<li>Địa điểm/Hình thức: <strong>{{location}}</strong></li>
<li>Ban đăng ký: <strong>{{department}}</strong></li>
</ul>
<p>Vui lòng có mặt trước giờ hẹn khoảng <strong>10–15 phút</strong> và mang theo tinh thần tự tin, thoải mái để có một buổi trao đổi hiệu quả.</p>
<p>Nếu có bất kỳ thắc mắc hoặc không thể tham gia đúng lịch, vui lòng liên hệ Fanpage hoặc Ban Tuyển thành viên CLB IU để được hỗ trợ.</p>
<p>Hẹn gặp bạn tại Vòng Phỏng vấn!</p>
<p><strong>Đăng nhập portal:</strong> Tài khoản = {{email}} · Mật khẩu mặc định = ngày sinh DDMMYYYY ({{temp_password}}) — bắt buộc đổi lần đầu · {{login_url}}</p>
<p><strong>CLB IU – Learn • Connect • Create</strong></p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-cv-fail",
    name: "Trượt vòng đơn",
    category: "recruitment",
    subject: "THÔNG BÁO KẾT QUẢ VÒNG ĐƠN – CLB IU ({{candidate_name}})",
    body: `<p><strong>THÔNG BÁO KẾT QUẢ VÒNG ĐƠN – CLB IU</strong></p>
<p>Chào <strong>{{candidate_name}}</strong>,</p>
<p>CLB IU chân thành cảm ơn bạn đã dành thời gian đăng ký tham gia đợt tuyển thành viên lần này.</p>
<p>Sau quá trình đánh giá hồ sơ, rất tiếc <strong>bạn chưa phù hợp với yêu cầu của Vòng Đơn</strong> trong đợt tuyển hiện tại.</p>
<p>Điều này không phản ánh toàn bộ năng lực của bạn. Mỗi vị trí đều có những tiêu chí và nhu cầu khác nhau ở từng thời điểm. CLB hy vọng bạn sẽ tiếp tục phát triển bản thân và mạnh dạn quay trở lại trong những đợt tuyển thành viên tiếp theo.</p>
<p>Một lần nữa, cảm ơn bạn đã quan tâm đến CLB IU. Chúc bạn luôn học tập tốt và gặt hái nhiều thành công trong thời gian tới.</p>
<p>Trân trọng,</p>
<p><strong>Ban Tuyển thành viên CLB IU</strong></p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-book-slot",
    name: "Nhắc đăng ký lịch phỏng vấn",
    category: "recruitment",
    subject: "[IU CLUB] Nhắc đăng ký lịch phỏng vấn",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Bạn đã ĐẠT vòng đơn nhưng chưa đăng ký lịch PV.</p>
<p>Hạn đăng ký: <strong>{{booking_deadline}}</strong></p>
<p>— {{club_name}}</p>`,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tpl-reminder",
    name: "Nhắc lịch phỏng vấn sắp diễn ra",
    category: "recruitment",
    subject: "[IU CLUB] Nhắc lịch phỏng vấn",
    body: `<p>Xin chào <strong>{{candidate_name}}</strong>,</p>
<p>Nhắc bạn lịch PV sắp tới: <strong>{{interview_time}}</strong> ngày {{interview_date}} tại {{location}}.</p>
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
];

export const historyStore: EmailHistoryItem[] = [];

export function resetEmailMockStores() {
  Object.assign(smtpStore, DEFAULT_SMTP);
  historyStore.splice(0, historyStore.length);
}
