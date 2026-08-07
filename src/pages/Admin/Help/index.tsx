import { BookOpen, LifeBuoy, Mail, Shield } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import Icon from "../../../components/ui/Icon";
import PageHeader from "../../../components/ui/PageHeader";

const FAQS = [
  {
    q: "Đổi mật khẩu / quên mật khẩu",
    a: "Tại trang Đăng nhập dùng Quên mật khẩu. Trong portal: Cài đặt › Đổi mật khẩu. Tài khoản tân binh lần đầu phải đổi mật khẩu trước khi dùng menu.",
  },
  {
    q: "Không thấy menu Đào tạo / Mentor",
    a: "Menu Mentor chỉ hiện khi Ban Chủ nhiệm bật cờ Mentor trên tài khoản. Tân binh (candidate) dùng submenu Đào tạo tân binh sau khi Pass PV.",
  },
  {
    q: "Lưu lộ trình training",
    a: "Vào Tạo lộ trình training › điền tên, ban, ngưỡng pass › thêm giai đoạn/bài học › Lưu. Mở lại thẻ lộ trình để Sửa hoặc Xóa.",
  },
  {
    q: "Gửi email thông báo",
    a: "Dùng nút Gửi email trên màn hồ sơ/kết quả. Mẫu thư cấu hình tại Cài đặt › Email. SMTP thật nằm trên server (.env).",
  },
];

/** Trợ giúp Admin — FAQ vận hành portal */
export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trợ giúp"
        description="Hướng dẫn nhanh cho Ban Chủ nhiệm khi vận hành tuyển dụng và training."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Shield,
            title: "Quyền",
            body: "Role BCN quản trị toàn portal.",
          },
          {
            icon: BookOpen,
            title: "Quy trình",
            body: "Mở đợt → CV → PV → Kết quả → Training.",
          },
          {
            icon: Mail,
            title: "Email",
            body: "Templates API + SMTP server.",
          },
        ].map((c) => (
          <article key={c.title} className="neu-card !p-5 space-y-2">
            <Icon icon={c.icon} size={20} className="text-accent" />
            <h2 className="font-semibold">{c.title}</h2>
            <p className="text-sm text-muted">{c.body}</p>
          </article>
        ))}
      </div>
      <section className="neu-card !p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Câu hỏi thường gặp</h2>
        <ul className="space-y-3">
          {FAQS.map((f) => (
            <li
              key={f.q}
              className="rounded-2xl bg-background px-4 py-3 shadow-inset-sm"
            >
              <p className="font-semibold text-sm">{f.q}</p>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="neu-card !p-6">
        <EmptyState
          icon={LifeBuoy}
          title="Cần hỗ trợ kỹ thuật?"
          description="Liên hệ Ban Chủ nhiệm / kỹ thuật CLB qua kênh nội bộ khi gặp lỗi hệ thống."
        />
      </div>
    </div>
  );
}
