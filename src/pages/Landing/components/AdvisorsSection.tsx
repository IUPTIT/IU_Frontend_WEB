const ADVISORS = [
  {
    name: "Thầy Phan Lý Huỳnh",
    role: "Giảng viên Khoa Viện kỹ thuật Bưu điện — Cố vấn CLB",
    image:
      "https://res.cloudinary.com/dqca5ltt9/image/upload/v1735713289/iuc-images/advisors/rq3fthmtfn6sh6sg8xrx.jpg",
  },
  {
    name: "Anh Trần Quang Đại",
    role: "Công tác tại Khoa Viện kỹ thuật Bưu điện — Cố vấn CLB",
    image:
      "https://res.cloudinary.com/dqca5ltt9/image/upload/v1735713289/iuc-images/advisors/r7hvqvs8tkllqbt1wyia.jpg",
  },
];

function AdvisorsSection() {
  return (
    <section id="co-van" className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
      <div className="text-center">
        <p className="landing-headline text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">Cố vấn</p>
        <h2 className="landing-headline mt-3 text-3xl font-semibold text-[hsl(var(--landing-foreground))] md:text-4xl">
          Những người{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, #6366f1, #a855f7, #fcd34d)" }}
          >
            dẫn đường
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.75)] md:text-base">
          Để phát triển thành một CLB vững mạnh và đoàn kết như hiện nay, ngay từ những ngày đầu tiên IU Club đã rất
          may mắn khi nhận được sự hỗ trợ, chỉ dẫn từ các thầy cô cố vấn đã có nhiều năm kinh nghiệm giảng dạy tại VIỆN
          KHOA HỌC KỸ THUẬT BƯU ĐIỆN.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        {ADVISORS.map((advisor) => (
          <div key={advisor.name} className="liquid-glass landing-card-glass landing-card-hover overflow-hidden rounded-3xl">
            <img
              src={advisor.image}
              alt={advisor.name}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-top"
            />
            <div className="p-6 text-center">
              <h3 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
                {advisor.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.65)]">{advisor.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdvisorsSection;
