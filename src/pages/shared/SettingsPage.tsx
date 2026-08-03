import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Upload } from "lucide-react";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/ui/Icon";
import { useAuth } from "../../context/AuthContext";
import { usePreferences, type ThemeMode } from "../../context/PreferencesContext";

const ROLE_LABEL = {
  admin: "Ban Chủ nhiệm (Admin)",
  leader: "Leader",
  member: "Member / Trainee",
} as const;

/**
 * Cài đặt dùng chung 3 role — hồ sơ, avatar, giao diện sáng/tối, thông báo, mật khẩu.
 */
function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const {
    theme,
    setTheme,
    emailNotifications,
    setEmailNotifications,
    inAppNotifications,
    setInAppNotifications,
  } = usePreferences();

  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setBio(user?.bio ?? "");
  }, [user]);

  if (!user) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const onPickAvatar = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ảnh tối đa 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarDataUrl: String(reader.result) });
      showToast("Đã cập nhật ảnh đại diện.");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (!name.trim()) {
      showToast("Tên hiển thị không được trống.");
      return;
    }
    updateProfile({ name: name.trim(), phone: phone.trim() || undefined, bio: bio.trim() || undefined });
    showToast("Đã lưu thông tin tài khoản.");
  };

  const savePassword = () => {
    setPwdError(null);
    if (pwd.next.length < 6) {
      setPwdError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("Xác nhận mật khẩu không khớp.");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    showToast("Đã đổi mật khẩu.");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 animate-fade-in">
      <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-accent/18 via-violet-500/8 to-background p-6 sm:p-8 shadow-extruded ring-1 ring-accent/12 text-center sm:text-left">
        <div className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-accent/15 blur-3xl" aria-hidden />
        <h1 className="relative font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Cài đặt</h1>
        <p className="relative mt-2 text-muted">
          Quản lý hồ sơ, giao diện và tùy chọn tài khoản của bạn.
        </p>
      </header>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      {/* Avatar + profile */}
      <section className="neu-card !p-6 space-y-6">
        <h2 className="font-display text-lg font-bold">Hồ sơ cá nhân</h2>

        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative overflow-hidden rounded-full shadow-extruded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Đổi ảnh đại diện"
          >
            <Avatar name={user.name} src={user.avatarDataUrl} size="xl" />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Đổi ảnh
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
          />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
              {ROLE_LABEL[user.role]}
            </span>
            <div className="flex gap-2 pt-2">
              <Button variant="soft" size="sm" className="!h-9" onClick={() => fileRef.current?.click()} leftIcon={<Icon icon={Upload} size={14} />}>
                Tải ảnh lên
              </Button>
              {user.avatarDataUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="!h-9"
                  onClick={() => {
                    updateProfile({ avatarDataUrl: undefined });
                    showToast("Đã xóa ảnh đại diện.");
                  }}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="neu-field-label">Tên hiển thị</span>
            <input className="neu-input !h-11" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Email</span>
            <input className="neu-input !h-11 opacity-70" value={user.email} disabled />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Số điện thoại</span>
            <input
              className="neu-input !h-11"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="neu-field-label">Giới thiệu ngắn</span>
            <textarea
              className="neu-input !h-auto min-h-[88px] py-3 resize-y text-sm"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Một dòng về bạn trong CLB..."
              maxLength={200}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={saveProfile}>
            Lưu hồ sơ
          </Button>
        </div>
      </section>

      {/* Theme */}
      <section className="neu-card !p-6 space-y-5">
        <div>
          <h2 className="font-display text-lg font-bold">Giao diện</h2>
          <p className="text-sm text-muted mt-1">Chế độ sáng / tối — Soft UI thích ứng.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { id: "light" as ThemeMode, label: "Sáng", desc: "Nền Soft UI sáng" },
              { id: "dark" as ThemeMode, label: "Tối", desc: "Nền tối hiện đại" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`rounded-2xl p-4 text-left transition-all duration-200 ${
                theme === opt.id
                  ? "bg-accent/20 text-accent shadow-inset-sm ring-1 ring-accent/30"
                  : "shadow-extruded-sm text-foreground hover:bg-accent/5"
              }`}
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-extruded-sm text-accent">
                <Icon icon={opt.id === "dark" ? Moon : Sun} size={18} />
              </span>
              <span className="block font-semibold">{opt.label}</span>
              <span className="text-xs opacity-80">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="neu-card !p-6 space-y-4">
        <h2 className="font-display text-lg font-bold">Thông báo</h2>
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-background px-4 py-3 shadow-inset-sm">
          <div>
            <p className="font-medium">Email</p>
            <p className="text-xs text-muted">Nhận thông báo tuyển dụng / training qua email</p>
          </div>
          <Toggle
            checked={emailNotifications}
            onChange={setEmailNotifications}
            aria-label="Bật thông báo email"
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-background px-4 py-3 shadow-inset-sm">
          <div>
            <p className="font-medium">Trong ứng dụng</p>
            <p className="text-xs text-muted">Badge chuông trên thanh trên</p>
          </div>
          <Toggle
            checked={inAppNotifications}
            onChange={setInAppNotifications}
            aria-label="Bật thông báo in-app"
          />
        </div>
      </section>

      {/* Password */}
      <section className="neu-card !p-6 space-y-4">
        <h2 className="font-display text-lg font-bold">Bảo mật</h2>
        <label className="block space-y-1.5">
          <span className="neu-field-label">Mật khẩu hiện tại</span>
          <input
            type="password"
            className="neu-input !h-11"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            autoComplete="current-password"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="neu-field-label">Mật khẩu mới</span>
            <input
              type="password"
              className="neu-input !h-11"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Xác nhận</span>
            <input
              type="password"
              className="neu-input !h-11"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </label>
        </div>
        {pwdError && <p className="text-sm text-rose-500">{pwdError}</p>}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={savePassword}>
            Đổi mật khẩu
          </Button>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
