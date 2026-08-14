import { useState } from "react";
import type { FormEvent } from "react";
import { Lock, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { changePassword } from "../services/authService";
import { useAuth } from "../context/useAuth";
import logoMark from "../assets/logo-mark.png";

/**
 * Chặn toàn portal khi user.requirePasswordChange = true (tài khoản ứng viên
 * sinh tự động, mật khẩu mặc định là ngày sinh) — bắt đổi mật khẩu, không cho bỏ qua.
 * UI flat 2D — đồng bộ trang Login (card trắng, border, gradient CTA).
 */

const fieldWrap =
  "mt-2 flex items-center gap-3 rounded-xl border border-[#E4E8F0] bg-white px-4 h-[50px] transition-all duration-200 focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/12";
const inputCls =
  "flex-1 min-w-0 bg-transparent text-[15px] text-[#2C3340] outline-none placeholder:text-[#A6AEC0]";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3D4458]">{label}</span>
      <div className={fieldWrap}>
        <Lock className="h-5 w-5 shrink-0 text-[#A6AEC0]" strokeWidth={1.8} />
        <input
          type={show ? "text" : "password"}
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="shrink-0 text-[#A6AEC0] transition-colors hover:text-[#7C3AED]"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.8} />
          )}
        </button>
      </div>
    </label>
  );
}

function ChangePasswordGate() {
  const { replaceUser, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      setError("Mật khẩu mới tối thiểu 8 ký tự.");
      return;
    }
    if (next !== confirm) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    if (next === current) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const user = await changePassword(current, next);
      replaceUser(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đổi mật khẩu thất bại — thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

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
            style={{
              backgroundImage:
                "linear-gradient(90deg, #6E2CE6 0%, #A855F7 50%, #E0348C 100%)",
            }}
            aria-hidden
          />

          <form onSubmit={handleSubmit} className="p-8 sm:p-10" noValidate>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1E9FE]">
                <img src={logoMark} alt="" className="h-7 w-auto" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="font-grotesk text-lg font-bold text-[#191A2C]">
                  IU Club
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA0B4]">
                  Bảo mật tài khoản
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1E9FE] text-[#7C3AED]">
                <KeyRound className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <h1 className="font-grotesk text-2xl font-extrabold tracking-tight text-[#191A2C] sm:text-3xl">
                  Đổi mật khẩu lần đầu
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7086]">
                  Tài khoản dùng mật khẩu mặc định là{" "}
                  <strong className="font-semibold text-[#3D4458]">
                    ngày sinh DDMMYYYY
                  </strong>{" "}
                  (ví dụ 15052006). Đặt mật khẩu mới trước khi đặt lịch phỏng
                  vấn.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <PasswordField
                label="Mật khẩu hiện tại (ngày sinh DDMMYYYY)"
                value={current}
                onChange={setCurrent}
                autoComplete="current-password"
                placeholder="VD: 15052006"
              />
              <PasswordField
                label="Mật khẩu mới (tối thiểu 8 ký tự)"
                value={next}
                onChange={setNext}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-rose-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.32)] transition-all duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_14px_34px_rgba(124,58,237,0.42)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #6E2CE6 0%, #A855F7 45%, #E0348C 100%)",
              }}
            >
              {saving ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  Đổi mật khẩu & tiếp tục
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-xl py-2.5 text-center text-sm font-semibold text-[#6B7086] transition-colors hover:text-[#7C3AED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordGate;
