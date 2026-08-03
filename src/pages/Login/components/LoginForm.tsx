import { useState } from "react";
import type { FormEvent } from "react";
import { DEMO_ACCOUNTS } from "../../../mocks/auth.mock";

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-sm ${shake ? "animate-shake" : ""}`}
      noValidate
    >
      <h1
        className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground animate-fade-up"
        style={{ animationDelay: "40ms" }}
      >
        Welcome
      </h1>

      <div className="mt-12 space-y-8">
        <label className="block animate-fade-up" style={{ animationDelay: "120ms" }}>
          <span className="text-sm text-muted">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@iuclub.edu.vn"
            className="login-input mt-2"
          />
        </label>

        <label className="block animate-fade-up" style={{ animationDelay: "200ms" }}>
          <span className="text-sm text-muted">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="login-input mt-2"
          />
        </label>
      </div>

      {error && (
        <p className="mt-5 text-sm text-red-500 animate-fade-up" role="alert">
          {error}
        </p>
      )}

      <div
        className="mt-10 flex flex-wrap items-center gap-5 animate-fade-up"
        style={{ animationDelay: "280ms" }}
      >
        <button type="submit" disabled={loading} className={`login-btn group ${loading ? "" : "animate-soft-pulse"}`}>
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
              Login
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          className="text-sm text-muted transition-all duration-300 hover:text-[#4A90E2] hover:underline underline-offset-4
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] rounded"
          onClick={() => setError("Tính năng quên mật khẩu sẽ có ở bước sau.")}
        >
          Forget password?
        </button>
      </div>

      {/* Demo accounts — chip chọn nhanh */}
      <div
        className="mt-12 space-y-3 animate-fade-up"
        style={{ animationDelay: "360ms" }}
      >
        <p className="text-xs font-medium text-muted">Tài khoản demo — bấm để điền:</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => fillDemo(a.email, a.password)}
              className="rounded-full bg-[#EEF1F5] px-3 py-1.5 text-xs capitalize text-muted
                shadow-[inset_2px_2px_4px_rgba(163,177,198,0.35),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]
                transition-all duration-300 ease-out
                hover:-translate-y-0.5 hover:text-[#4A90E2] hover:shadow-extruded-sm
                active:translate-y-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]"
            >
              {a.role}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
