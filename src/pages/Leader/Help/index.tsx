const FAQS = [
  {
    q: "Thành viên Ban",
    a: "Thêm / sửa / gỡ member thuộc Ban bạn phụ trách tại menu Thành viên Ban.",
  },
  {
    q: "Phỏng vấn",
    a: "Nếu bạn được gán panel PV, vào Tuyển dụng › Phỏng vấn để xem ca và chấm điểm.",
  },
  {
    q: "Mentor training",
    a: "Khi được bật Mentor: tạo lộ trình, giao task, đánh giá tổng kết trong nhóm Đào tạo (Mentor).",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Trợ giúp Leader
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Hướng dẫn nhanh cho Trưởng ban / Mentor trên Leader Portal.
        </p>
      </header>
      <section className="ui-card !p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">Câu hỏi thường gặp</h2>
        <ul className="space-y-3">
          {FAQS.map((f) => (
            <li
              key={f.q}
              className="rounded-2xl bg-background px-4 py-3 shadow-hairline"
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
