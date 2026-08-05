import { useState } from "react";
import type { FormEvent } from "react";

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

    </form>
  );
}

export default LoginForm;
