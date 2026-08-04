const HIGHLIGHTS = [
  {
    title: "Sáng tạo",
    description: "Khuyến khích thử nghiệm ý tưởng mới, biến đam mê công nghệ thành sản phẩm thực tế.",
  },
  {
    title: "Học hỏi",
    description: "Môi trường chia sẻ kiến thức liên tục qua training, dự án và mentoring giữa các thế hệ.",
  },
  {
    title: "Chinh phục",
    description: "Cùng nhau vượt qua thử thách, chinh phục mục tiêu lớn và tạo dựng tương lai bền vững.",
  },
];

function AboutSection() {
  return (
    <section id="gioi-thieu" className="relative z-10 mx-auto max-w-5xl px-6 py-24">
      <div className="text-center">
        <p className="landing-headline text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
          Giới thiệu
        </p>
        <h2 className="landing-headline mt-3 text-4xl font-semibold text-[hsl(var(--landing-foreground))] md:text-5xl">
          IU Club —{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, #6366f1, #a855f7, #fcd34d)" }}
          >
            Shine and Thrive
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-[hsl(var(--landing-foreground)/0.75)]">
          IU Club (IUC) là câu lạc bộ CNTT định hướng ứng dụng thuộc UDU, thành lập vào năm 2024, với môi trường
          "Shine and Thrive" giúp mỗi thành viên phát triển tối đa tiềm năng. Tại đây, sinh viên được khuyến khích sáng
          tạo, học hỏi, và hỗ trợ vượt qua thử thách. IUC quy tụ những người trẻ đam mê công nghệ, cùng nhau chinh phục
          các mục tiêu lớn, tạo dựng tương lai bền vững.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="liquid-glass landing-card-solid landing-card-hover rounded-3xl p-8 text-center">
            <h3 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.65)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutSection;
