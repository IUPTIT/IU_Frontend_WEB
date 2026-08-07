import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import { usePortalUi } from "../context/usePortalUi";
import { usePreferences } from "../context/usePreferences";
import { ROUTES } from "../constants/routes";
import type { Role } from "../types/navigation";
import Icon from "../components/ui/Icon";
import Avatar from "../components/ui/Avatar";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../services/notificationService";

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

/** Map link BE sang portal đúng role hiện tại */
function resolveNotifLink(
  link: string | null,
  role: Role,
  isMentor?: boolean,
): string | null {
  if (!link) return null;
  if (role === "leader") {
    if (link.startsWith("/admin/recruitment/interviews")) {
      return link.replace("/admin/", "/leader/");
    }
    if (link.startsWith("/member/recruitment/interviews")) {
      return link.replace("/member/", "/leader/");
    }
    if (
      link.startsWith("/member/training") ||
      link.startsWith("/member/mentor")
    ) {
      return ROUTES.leader.training.groups;
    }
  }
  if (role === "admin") {
    if (link.startsWith("/leader/recruitment/interviews")) {
      return link.replace("/leader/", "/admin/");
    }
    if (link.startsWith("/member/recruitment/interviews")) {
      return link.replace("/member/", "/admin/");
    }
    if (link.startsWith("/member/training")) {
      return ROUTES.admin.training.teams;
    }
  }
  if (role === "member") {
    if (link.startsWith("/admin/recruitment/interviews")) {
      return link.replace("/admin/", "/member/");
    }
    if (link.startsWith("/leader/recruitment/interviews")) {
      return link.replace("/leader/", "/member/");
    }
    if (isMentor && link.startsWith("/member/training/progress")) {
      return ROUTES.member.mentorTasks;
    }
  }
  return link;
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
  const [openNotif, setOpenNotif] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshNotifs = () => {
    void listNotifications()
      .then((d) => {
        setItems(d.items ?? []);
        setUnread(d.unread ?? 0);
      })
      .catch(() => {
        setItems([]);
        setUnread(0);
      });
  };

  useEffect(() => {
    if (!user) return;
    refreshNotifs();
    const t = window.setInterval(refreshNotifs, 20_000);
    const onFocus = () => refreshNotifs();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  useEffect(() => {
    if (!openNotif) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenNotif(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openNotif]);

  const roleLabel: string = {
    admin: "Ban Chủ nhiệm",
    leader: "Trưởng nhóm",
    member: user?.isMentor ? "Mentor" : "Thành viên",
    candidate: "Ứng viên",
  }[role];

  return (
    <header>
      <div className="flex items-center gap-3 sm:gap-4 rounded-card bg-background px-4 sm:px-6 py-3 shadow-extruded">
        <button
          type="button"
          className="neu-btn h-12 w-12 !px-0 rounded-full shrink-0 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Mở menu"
          aria-controls="sidebar-nav"
          onClick={onOpenMobileNav}
        >
          <Icon icon={Menu} size={20} />
        </button>

        <label className="relative flex-1 max-w-lg">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-placeholder"
            aria-hidden
          >
            <Icon icon={Search} size={18} />
          </span>
          <input
            className="h-11 w-full rounded-full border-0 bg-background pl-11 pr-4 text-sm text-foreground shadow-extruded-sm outline-none transition placeholder:text-placeholder focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="neu-btn h-12 w-12 !px-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={
              theme === "dark"
                ? "Chuyển sang giao diện sáng"
                : "Chuyển sang giao diện tối"
            }
            title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            onClick={toggleTheme}
          >
            <Icon icon={theme === "dark" ? Sun : Moon} size={20} />
          </button>
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              className="neu-btn relative h-12 w-12 !px-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Thông báo"
              aria-expanded={openNotif}
              onClick={() => {
                setOpenNotif((v) => !v);
                if (!openNotif) refreshNotifs();
              }}
            >
              <Icon icon={Bell} size={20} />
              {unread > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {openNotif && (
              <div className="absolute right-0 top-14 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-background p-3 shadow-extruded ring-1 ring-black/5">
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <p className="text-sm font-semibold">
                    Thông báo{unread > 0 ? ` (${unread})` : ""}
                  </p>
                  {items.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() =>
                        void markAllNotificationsRead().then(refreshNotifs)
                      }
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {items.length === 0 ? (
                    <li className="px-2 py-6 text-center text-sm text-muted">
                      Chưa có thông báo
                    </li>
                  ) : (
                    items.map((n) => (
                      <li key={n._id}>
                        <button
                          type="button"
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-accent/10 ${
                            n.readAt ? "opacity-70" : "bg-accent/5"
                          }`}
                          onClick={() => {
                            void markNotificationRead(n._id).then(() => {
                              refreshNotifs();
                              const path = resolveNotifLink(
                                n.link,
                                role,
                                user?.isMentor,
                              );
                              if (path) navigate(path);
                              setOpenNotif(false);
                            });
                          }}
                        >
                          <p className="font-semibold text-foreground">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-xs text-muted line-clamp-2">
                              {n.body}
                            </p>
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full bg-background py-1 pl-1 pr-1.5 shadow-extruded-sm transition hover:shadow-extruded sm:pr-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Mở cài đặt tài khoản"
            onClick={() => navigate(settingsPath(role))}
          >
            {user ? (
              <Avatar name={user.name} src={user.avatarDataUrl} size="md" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/12 text-xs font-bold text-accent">
                ?
              </span>
            )}
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[130px] truncate text-sm font-semibold text-foreground">
                {user?.name ?? "—"}
              </span>
              <span className="block text-xs text-muted">{roleLabel}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
