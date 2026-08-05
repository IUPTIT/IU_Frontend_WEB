import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../../../api/client";

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Nhập email trước khi yêu cầu đặt lại mật khẩu");
      return;
    }
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setInfo(
        "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không gửi được yêu cầu đặt lại mật khẩu",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-sm ${shake ? "animate-shake" : ""}`}
      noValidate
      autoComplete="on"
    >
      <h1
        className="login-title font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C3340] animate-fade-up"
        style={{ animationDelay: "40ms" }}
      >
        Chào bạn
      </h1>
      <p
        className="login-label mt-3 text-sm leading-relaxed text-[#8A94A6] animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        Đăng nhập bằng email đã đăng ký — dành cho ứng viên, thành viên và Ban
        Chủ nhiệm.
      </p>

      <div className="mt-10 space-y-8">
        <label
          className="block animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <span className="login-label text-sm text-[#8A94A6]">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="login-input mt-2"
          />
        </label>

        <label
          className="block animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <span className="login-label text-sm text-[#8A94A6]">Mật khẩu</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="login-input mt-2"
          />
        </label>
      </div>

      {error && (
        <p className="mt-5 text-sm text-red-500 animate-fade-up" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-5 text-sm text-[#4A90E2] animate-fade-up" role="status">
          {info}
        </p>
      )}

      <div
        className="mt-10 flex flex-wrap items-center gap-5 animate-fade-up"
        style={{ animationDelay: "280ms" }}
      >
        <button
          type="submit"
          disabled={loading}
          className={`login-btn group ${loading ? "" : "animate-soft-pulse"}`}
        >
          {loading ? (
            <>
              <span
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                aria-hidden
              />
              Đang đăng nhập...
            </>
          ) : (
            <>
              Đăng nhập
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          className="login-forgot text-sm text-[#8A94A6] transition-all duration-300 hover:text-[#4A90E2] hover:underline underline-offset-4
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] rounded"
          onClick={() => void handleForgot()}
        >
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
