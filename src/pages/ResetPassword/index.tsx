import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { loadStudioFonts } from "../../seo/loadStudioFonts";

/**
 * Trang công khai: đặt lại mật khẩu từ link email (?token=...).
 * BE chỉ cần token + password mới — không bắt email.
 */
function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => (params.get("token") || "").trim(), [params]);
  useEffect(() => {
    loadStudioFonts();
  }, []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      fail("Link đặt lại mật khẩu thiếu hoặc không hợp lệ.");
      return;
    }
    if (password.length < 8) {
      fail("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      fail("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      fail(
        err instanceof Error
          ? err.message
          : "Không đặt lại được mật khẩu. Thử yêu cầu link mới.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F4FB] p-4 sm:p-6 animate-fade-in">
      <main id="main" className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(26,26,80,0.12)] animate-fade-up">
        <section className="flex w-full flex-col justify-center px-8 py-12 sm:px-10">
          {done ? (
            <div className="w-full max-w-sm space-y-4">
              <h1 className="login-title font-display text-4xl font-extrabold tracking-tight text-[#2C3340]">
                Đã đổi mật khẩu
              </h1>
              <p className="login-label text-sm leading-relaxed text-[#6B7086]">
                Đang chuyển về trang đăng nhập…
              </p>
              <Link
                to="/login"
                className="login-forgot text-sm text-[#4A90E2] underline underline-offset-4"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className={`w-full max-w-sm ${shake ? "animate-shake" : ""}`}
              noValidate
              autoComplete="on"
            >
              <h1
                className="login-title font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C3340] animate-fade-up"
                style={{ animationDelay: "40ms" }}
              >
                Đặt lại mật khẩu
              </h1>
              <p
                className="login-label mt-3 text-sm leading-relaxed text-[#6B7086] animate-fade-up"
                style={{ animationDelay: "80ms" }}
              >
                {token
                  ? "Nhập mật khẩu mới cho tài khoản IU CLUB của bạn."
                  : "Link thiếu token. Hãy dùng lại nút Quên mật khẩu trên trang đăng nhập."}
              </p>

              <div className="mt-10 space-y-8">
                <label
                  className="block animate-fade-up"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="login-label text-sm text-[#6B7086]">
                    Mật khẩu mới
                  </span>
                  <input
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự"
                    className="login-input mt-2"
                    disabled={!token}
                  />
                </label>

                <label
                  className="block animate-fade-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <span className="login-label text-sm text-[#6B7086]">
                    Xác nhận mật khẩu
                  </span>
                  <input
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="login-input mt-2"
                    disabled={!token}
                  />
                </label>
              </div>

              {error && (
                <p
                  className="mt-5 text-sm text-red-500 animate-fade-up"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div
                className="mt-10 flex flex-wrap items-center gap-5 animate-fade-up"
                style={{ animationDelay: "280ms" }}
              >
                <button
                  type="submit"
                  disabled={loading || !token}
                  className={`login-btn group ${loading ? "" : "animate-soft-pulse"}`}
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                        aria-hidden
                      />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Lưu mật khẩu mới
                      <span
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="login-forgot text-sm text-[#6B7086] transition-all duration-300 hover:text-[#4A90E2] hover:underline underline-offset-4"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
