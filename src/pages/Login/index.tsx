import { useAuth } from "../../context/useAuth";
import LoginForm from "./components/LoginForm";
import logoMark from "../../assets/logo-mark.png";

const JOURNEY = ["Hồ sơ", "Phỏng vấn", "Tân binh", "Thành viên"];

/**
 * Login theo vibe khu quản lý (airy card): nền lavender nhạt, thẻ trắng bo mềm,
 * bóng dịu, tiêu đề Space Grotesk, nhấn tím → magenta khớp logo.
 */
function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F4FB] p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-md">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#A855F7]/18 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#E0348C]/14 blur-3xl"
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(26,26,80,0.12)] animate-fade-up">
          <div
            className="h-1.5 w-full"
            style={{ backgroundImage: "linear-gradient(90deg, #6E2CE6 0%, #A855F7 50%, #E0348C 100%)" }}
            aria-hidden
          />

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1E9FE]">
                <img src={logoMark} alt="" className="h-7 w-auto" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="font-grotesk text-lg font-bold text-[#191A2C]">IU Club</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA0B4]">
                  Không gian quản lý
                </p>
              </div>
            </div>

            <h1 className="font-grotesk mt-8 text-3xl font-extrabold tracking-tight text-[#191A2C]">
              Đăng nhập
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7086]">
              Vào không gian quản lý CLB — dành cho ứng viên, thành viên và Ban Chủ nhiệm.
            </p>

            <LoginForm onSubmit={login} />

            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-[#EBEBF3] pt-5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA0B4]">
                Hành trình
              </span>
              {JOURNEY.map((chip, i) => (
                <span key={chip} className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F5F6FB] px-2.5 py-1 text-xs font-semibold text-[#6B7086]">
                    {chip}
                  </span>
                  {i < JOURNEY.length - 1 && <span className="text-[#C4C9D6]">›</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
