import { useAuth } from "../../context/useAuth";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";

/**
 * Trang login luôn dùng soft-UI sáng theo mockup — không bị dark mode portal đè
 * (html.dark .bg-white / .text-foreground làm form tối lệch thiết kế).
 */
function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="login-shell flex min-h-screen items-center justify-center bg-[#E8EEF8] p-4 sm:p-6 lg:p-10 animate-fade-in">
      <div className="login-card flex w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(80,100,140,0.18)] animate-fade-up">
        <section className="relative hidden w-[48%] overflow-hidden bg-[#DDE2FF] lg:block">
          <LoginIllustration />
        </section>

        <section className="login-panel flex w-full flex-col justify-center bg-white px-8 py-12 sm:px-12 lg:w-[52%] lg:px-14 xl:px-16">
          <LoginForm onSubmit={login} />
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
