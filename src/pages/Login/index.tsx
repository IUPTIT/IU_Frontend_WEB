import { useAuth } from "../../context/useAuth";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";

function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8EEF8] p-4 sm:p-6 lg:p-10 animate-fade-in">
      <div
        className="flex w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(80,100,140,0.18)]
          animate-fade-up"
      >
        {/* Left — ảnh xe trên nền xanh nhạt */}
        <section className="relative hidden w-[48%] overflow-hidden bg-[#DDE2FF] lg:block">
          <LoginIllustration />
        </section>

        {/* Right — form */}
        <section className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-[52%] lg:px-14 xl:px-16">
          <LoginForm onSubmit={login} />
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
