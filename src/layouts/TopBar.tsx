import { useAuth } from "../context/AuthContext";
import { usePortalUi } from "../context/PortalUiContext";
import { usePreferences } from "../context/PreferencesContext";
import { ROUTES } from "../constants/routes";
import type { Role } from "../types/navigation";
import Icon from "../components/ui/Icon";
import Avatar from "../components/ui/Avatar";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenMobileNav?: () => void;
  searchPlaceholder?: string;
  role: Role;
};

function settingsPath(role: Role) {
  if (role === "leader") return ROUTES.leader.settings;
  if (role === "member") return ROUTES.member.settings;
  return ROUTES.admin.settings;
}

function TopBar({
  search,
  onSearchChange,
  onOpenMobileNav,
  searchPlaceholder = "Tìm kiếm...",
  role,
}: Props) {
  const { user } = useAuth();
  const { navigate } = usePortalUi();
  const { theme, toggleTheme } = usePreferences();

  return (
    <header className="sticky top-4 sm:top-6 z-10">
      <div className="flex items-center gap-3 sm:gap-4 rounded-card bg-background/80 backdrop-blur px-4 sm:px-6 py-4 shadow-extruded">
        <button
          type="button"
          className="neu-btn h-12 w-12 !px-0 rounded-full shrink-0 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Mở menu"
          aria-controls="sidebar-nav"
          onClick={onOpenMobileNav}
        >
          <Icon icon={Menu} size={20} />
        </button>

        <label className="relative flex-1 max-w-xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" aria-hidden>
            <Icon icon={Search} size={20} />
          </span>
          <input
            className="neu-input pl-12"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="neu-btn h-12 w-12 !px-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            onClick={toggleTheme}
          >
            <Icon icon={theme === "dark" ? Sun : Moon} size={20} />
          </button>
          <button
            type="button"
            className="neu-btn h-12 w-12 !px-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Thông báo"
          >
            <Icon icon={Bell} size={20} />
          </button>
          <button
            type="button"
            className="neu-btn h-12 w-12 !px-0 rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Mở cài đặt tài khoản"
            onClick={() => navigate(settingsPath(role))}
          >
            {user ? (
              <Avatar name={user.name} src={user.avatarDataUrl} size="md" className="!h-full !w-full !rounded-none" />
            ) : (
              <span className="text-xs font-bold text-accent">?</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
