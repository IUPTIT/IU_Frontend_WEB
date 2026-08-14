import { useState } from "react";
import type { FormEvent } from "react";
import Button from "./ui/Button";
import { changePassword } from "../services/authService";
import { useAuth } from "../context/useAuth";

/**
 * Chặn toàn portal khi user.requirePasswordChange = true (tài khoản ứng viên
 * sinh tự động, mật khẩu mặc định là ngày sinh) — bắt đổi mật khẩu, không cho bỏ qua.
 */
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
      setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <form onSubmit={handleSubmit} className="ui-card w-full max-w-md space-y-5 !p-8">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Đổi mật khẩu lần đầu
          </h1>
          <p className="text-sm text-muted">
            Tài khoản của bạn dùng mật khẩu mặc định — hãy đặt mật khẩu mới trước khi tiếp tục.
          </p>
        </div>

        <div>
          <span className="ui-field-label">Mật khẩu hiện tại (ngày sinh DDMMYYYY)</span>
          <input
            type="password"
            className="ui-input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <span className="ui-field-label">Mật khẩu mới (tối thiểu 8 ký tự)</span>
          <input
            type="password"
            className="ui-input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <span className="ui-field-label">Xác nhận mật khẩu mới</span>
          <input
            type="password"
            className="ui-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full !h-12" disabled={saving}>
          {saving ? "Đang lưu..." : "Đổi mật khẩu & tiếp tục"}
        </Button>
        <button
          type="button"
          onClick={logout}
          className="w-full text-center text-sm text-muted underline-offset-4 hover:underline focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background rounded-xl py-2"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordGate;
