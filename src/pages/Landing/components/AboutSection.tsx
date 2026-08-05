import { Lightbulb, GraduationCap, Trophy, type LucideIcon } from "lucide-react";

type Highlight = { title: string; description: string; icon: LucideIcon };

const HIGHLIGHTS: Highlight[] = [
  {
    title: "Sáng tạo",
    description:
      "Khuyến khích thử nghiệm ý tưởng mới, biến đam mê công nghệ thành sản phẩm thực tế.",
    icon: Lightbulb,
  },
  {
    title: "Học hỏi",
    description:
      "Môi trường chia sẻ kiến thức liên tục qua training, dự án và mentoring giữa các thế hệ.",
    icon: GraduationCap,
  },
  {
    title: "Chinh phục",
    description:
      "Cùng nhau vượt qua thử thách, chinh phục mục tiêu lớn và tạo dựng tương lai bền vững.",
    icon: Trophy,
  },
];

function AboutSection() {
  return (
    <section id="gioi-thieu" className="relative z-10 mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <p className="landing-headline text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">
          Giới thiệu
        </p>
        <h2 className="landing-headline mt-3 text-3xl font-semibold text-[hsl(var(--landing-foreground))] md:text-4xl">
          IU Club —{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, #6e2ce6, #a855f7, #e0348c)" }}
          >
            Shine and Thrive
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.75)] md:text-base">
          IU Club (IUC) là câu lạc bộ CNTT định hướng ứng dụng thuộc UDU, thành lập vào năm 2024, với môi trường
          "Shine and Thrive" giúp mỗi thành viên phát triển tối đa tiềm năng. Tại đây, sinh viên được khuyến khích sáng
          tạo, học hỏi, và hỗ trợ vượt qua thử thách.
        </p>
      </div>

      <div className="mt-11 grid gap-5 md:grid-cols-3">
        {HIGHLIGHTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="liquid-glass landing-card-glass about-card text-left">
              <span className="about-card-index">0{idx + 1}</span>
              <span className="about-card-chip">
                <Icon size={24} strokeWidth={1.9} />
              </span>
              <h3 className="landing-headline mt-5 text-lg font-semibold text-[hsl(var(--landing-foreground))]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.65)]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AboutSection;
