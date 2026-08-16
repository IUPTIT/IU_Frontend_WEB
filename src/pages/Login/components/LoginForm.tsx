import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "../../../api/client";

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

const fieldWrap =
  "mt-2 flex items-center gap-3 rounded-xl border border-[#E4E8F0] bg-white px-4 h-[50px] transition-all duration-200 focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/12";
const inputCls =
  "flex-1 min-w-0 bg-transparent text-[15px] text-[#2C3340] outline-none placeholder:text-[#A6AEC0]";

function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
      setInfo("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được yêu cầu đặt lại mật khẩu");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-7 ${shake ? "animate-shake" : ""}`}
      noValidate
      autoComplete="on"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-[#3D4458]">Email</span>
          <div className={fieldWrap}>
            <Mail className="h-5 w-5 shrink-0 text-[#A6AEC0]" strokeWidth={1.8} aria-hidden />
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@iuclub.edu.vn"
              className={inputCls}
            />
          </div>
        </label>

        <label className="block">
          <span className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#3D4458]">Mật khẩu</span>
            <button
              type="button"
              onClick={() => void handleForgot()}
              className="text-xs font-semibold text-[#7C3AED] transition-colors hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded"
            >
              Quên mật khẩu?
            </button>
          </span>
          <div className={fieldWrap}>
            <Lock className="h-5 w-5 shrink-0 text-[#A6AEC0]" strokeWidth={1.8} aria-hidden />
            <input
              type={showPw ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="shrink-0 text-[#A6AEC0] transition-colors hover:text-[#7C3AED]"
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPw ? <EyeOff className="h-5 w-5" strokeWidth={1.8} /> : <Eye className="h-5 w-5" strokeWidth={1.8} />}
            </button>
          </div>
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-rose-500" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-4 text-sm text-[#7C3AED]" role="status">
          {info}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.32)] transition-all duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_14px_34px_rgba(124,58,237,0.42)] active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
        style={{ backgroundImage: "linear-gradient(120deg, #6E2CE6 0%, #A855F7 45%, #E0348C 100%)" }}
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
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
