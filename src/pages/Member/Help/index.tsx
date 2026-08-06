const FAQS = [
  {
    q: "Training của tôi",
    a: "Xem lộ trình, nộp task, cập nhật tiến độ và chat nhóm mentor tại menu Đào tạo.",
  },
  {
    q: "Phỏng vấn (panel)",
    a: "Nếu được gán interviewer, vào Tuyển dụng › Phỏng vấn để chấm ứng viên.",
  },
  {
    q: "Mentor",
    a: "Menu Mentor chỉ hiện khi Ban Chủ nhiệm cấp quyền mentor trên tài khoản.",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Trợ giúp Member
        </h1>
        <p className="text-muted text-sm max-w-xl">
          Hướng dẫn nhanh cho thành viên / mentor trên Member Portal.
        </p>
      </header>
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
    </div>
  );
}
