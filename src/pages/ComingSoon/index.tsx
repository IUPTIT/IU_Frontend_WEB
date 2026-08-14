import { useNavigate } from "react-router-dom";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingFooter from "../../components/LandingFooter";
import { usePageMeta } from "../../hooks/usePageMeta";
import "../../styles/landing.css";

type ComingSoonPageProps = {
  /** Tên trang hiển thị trên heading, VD "Tin tức" */
  title: string;
  metaTitle: string;
  metaDescription: string;
  path: string;
};

/** Trang giữ chỗ cho các mục chưa xây xong (Tin tức, Sự kiện) — theme landing */
function ComingSoonPage({ title, metaTitle, metaDescription, path }: ComingSoonPageProps) {
  const navigate = useNavigate();
  usePageMeta(metaTitle, metaDescription, path);

  return (
    <div className="landing-theme relative min-h-screen">
      <BackgroundVideo />

      <div className="relative z-10 flex min-h-screen flex-col">
        <LandingNavBar />

        <section className="flex flex-1 items-center justify-center px-4 py-16 md:px-8">
          <div className="liquid-glass glass-shine relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] px-8 py-14 text-center md:px-14">
            <p className="landing-headline text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">
              {title}
            </p>
            <h1 className="landing-headline mt-4 text-3xl font-semibold text-[hsl(var(--landing-foreground))] md:text-4xl">
              Trang đang được{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(to right, #6e2ce6, #a855f7, #e0348c)" }}
              >
                cập nhật
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[hsl(var(--landing-foreground)/0.75)] md:text-base">
              Nội dung {title.toLowerCase()} của IU Club sẽ sớm ra mắt. Trong lúc chờ đợi, hãy theo dõi
              fanpage hoặc quay lại trang chủ để khám phá thêm về câu lạc bộ nhé!
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => navigate("/")} className="landing-btn-primary px-6 py-3">
                Về trang chủ
              </button>
              <button
                onClick={() => navigate("/tuyen-thanh-vien")}
                className="landing-btn-secondary px-6 py-3 text-[hsl(var(--landing-foreground)/0.9)]"
              >
                Tuyển thành viên
              </button>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
}

export default ComingSoonPage;
