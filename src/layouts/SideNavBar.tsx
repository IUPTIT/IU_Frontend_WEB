import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  UserRound,
  X,
} from "lucide-react";
import type { NavChild, NavIcon, NavItem, Role } from "../types/navigation";
import { SIDEBAR_CONFIG } from "../constants/navigation";
import { usePortalUi } from "../context/usePortalUi";
import { useAuth } from "../context/useAuth";
import Icon from "../components/ui/Icon";
import logoMark from "../assets/logo-mark.png";

const icons: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  recruitment: UserPlus,
  training: BookOpen,
  members: Users,
  events: CalendarDays,
  profile: UserRound,
  settings: Settings,
  permissions: ShieldCheck,
  roadmap: Route,
  tasks: CheckSquare,
  progress: BarChart3,
  help: HelpCircle,
  logout: LogOut,
};

type Props = {
  role: Role;
  /** drawer = mobile offcanvas (luôn expanded); rail = desktop/tablet */
  variant?: "rail" | "drawer";
};

// Điểm khớp path — chọn mục CỤ THỂ NHẤT (dài nhất). Tránh việc /admin (overview)
// nuốt hết mọi path con.
function pathScore(itemPath: string | undefined, active: string): number {
  if (!itemPath || itemPath.startsWith("#")) return -1;
  if (itemPath === active) return itemPath.length + 1;
  if (active.startsWith(`${itemPath}/`)) return itemPath.length;
  return -1;
}

function SideNavBar({ role, variant = "rail" }: Props) {
  const {
    activePath,
    navigate,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    closeMobileNav,
  } = usePortalUi();
  const { logout, user } = useAuth();
  const isMentor = user?.isMentor === true;

  const { brand: baseBrand, sections: allSections } = SIDEBAR_CONFIG[role];
  // Sidebar theo vai trò thực tế: mentor thấy khu mentor, member thường thấy khu đào tạo
  const sections = allSections
    .filter((s) => !(isMentor && s.hideForMentor))
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.mentorOnly || isMentor) }))
    .filter((s) => s.items.length > 0);

  const brand =
    role === "member" && isMentor
      ? { ...baseBrand, subtitle: "Mentor Console" }
      : baseBrand;

  // Xác định mục đang active bằng cách chọn path khớp cụ thể nhất
  let activeId = "";
  let bestScore = 0;
  let activeParentId: string | null = null;
  for (const section of sections) {
    for (const item of section.items) {
      // Mục có children: path của cha trùng path con đầu → chỉ khớp qua children
      if (item.children) {
        for (const child of item.children) {
          const cs = pathScore(child.path, activePath);
          if (cs > bestScore) {
            bestScore = cs;
            activeId = child.id;
            activeParentId = item.id;
          }
        }
      } else {
        const sc = pathScore(item.path, activePath);
        if (sc > bestScore) {
          bestScore = sc;
          activeId = item.id;
          activeParentId = null;
        }
      }
    }
  }

  const collapsed = variant === "rail" && sidebarCollapsed;

  const [openId, setOpenId] = useState<string | null>(activeParentId);
  // Mở đúng nhóm khi đổi route (adjust state during render)
  const [prevActivePath, setPrevActivePath] = useState(activePath);
  if (activePath !== prevActivePath) {
    setPrevActivePath(activePath);
    if (activeParentId) setOpenId(activeParentId);
  }

  const handleParentClick = (item: NavItem) => {
    if (item.action === "logout") {
      closeMobileNav();
      logout();
      return;
    }
    if (item.children) {
      // Rail thu gọn: không mở accordion được → vào thẳng mục con đang active (hoặc mục đầu)
      if (collapsed) {
        const activeChild = item.children.find((c) => c.id === activeId);
        navigate(activeChild?.path ?? item.children[0].path);
        return;
      }
      // Mở nhóm: chỉ vào mục con đầu khi CHƯA đứng ở trang con nào của nhóm
      // → đóng/mở lại vẫn giữ đúng trang đang xem, không nhảy về mục đầu.
      const nextOpen = openId === item.id ? null : item.id;
      setOpenId(nextOpen);
      if (nextOpen && !item.children.some((c) => c.id === activeId)) {
        navigate(item.children[0].path);
      }
    } else {
      navigate(item.path);
    }
  };

  const handleChildClick = (child: NavChild) => navigate(child.path);

  const widthClass = collapsed ? "w-[72px]" : "w-[264px]";
  const mainSections = sections.filter((s) => s.id !== "footer");
  const footerSection = sections.find((s) => s.id === "footer");

  const ring =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const renderSection = (
    section: (typeof sections)[number],
    isFooter = false,
  ) => (
    <div
      key={section.id}
      className={`space-y-1 ${isFooter ? "shrink-0 border-t border-black/5 pt-3" : "shrink-0"}`}
    >
      {section.label && !collapsed && (
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {section.label}
        </p>
      )}

      {section.items.map((item) => {
        const open = openId === item.id && !collapsed;
        const isActive = item.id === activeId;
        const sectionActive = item.id === activeParentId; // có mục con đang active
        const danger = item.tone === "danger";

        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => handleParentClick(item)}
              aria-expanded={item.children ? open : undefined}
              aria-current={
                isActive || (sectionActive && collapsed) ? "page" : undefined
              }
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={`group relative flex w-full items-center rounded-xl text-sm transition-colors duration-200 ${ring} ${
                collapsed ? "h-11 justify-center" : "gap-3 px-3 py-2.5"
              } ${
                danger
                  ? "font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  : isActive
                    ? "bg-accent/12 font-semibold text-accent"
                    : sectionActive
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted hover:bg-accent/[0.07] hover:text-foreground"
              }`}
            >
              <Icon icon={icons[item.icon]} size={20} className="shrink-0" />

              {!collapsed && (
                <span className="min-w-0 flex-1 text-left leading-snug">
                  {item.label}
                </span>
              )}

              {item.children && !collapsed && (
                <Icon
                  icon={ChevronDown}
                  size={16}
                  className={`ml-1 shrink-0 text-muted transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
                />
              )}

              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {item.label}
                </span>
              )}
            </button>

            {item.children && !collapsed && (
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                aria-hidden={!open}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 space-y-0.5">
                    {item.children.map((child) => {
                      const childOn = child.id === activeId;
                      return (
                        <button
                          type="button"
                          key={child.id}
                          onClick={() => handleChildClick(child)}
                          aria-current={childOn ? "page" : undefined}
                          tabIndex={open ? 0 : -1}
                          className={`relative block w-full rounded-lg py-2 pl-11 pr-3 text-left text-sm leading-snug transition-colors duration-200 ${ring} ${
                            childOn
                              ? "bg-accent/12 font-semibold text-accent"
                              : "font-medium text-muted hover:bg-accent/[0.07] hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`absolute left-[22px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${
                              childOn ? "bg-accent" : "bg-muted/40"
                            }`}
                            aria-hidden
                          />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`relative flex h-full flex-col overflow-hidden bg-background transition-[width] duration-300 ease-out
        ${widthClass}
        ${variant === "rail" ? "border-r border-black/[0.06]" : "w-full !w-full"}
        ${collapsed ? "items-center p-3" : "p-4"}
      `}
      aria-label="Menu điều hướng"
      data-collapsed={collapsed ? "true" : "false"}
    >
      {/* Brand */}
      <div
        className={`flex w-full shrink-0 items-center gap-3 ${collapsed ? "justify-center" : "pr-10"}`}
      >
        <img
          src={logoMark}
          alt="IU Club"
          className="h-10 w-10 shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-[15px] font-bold text-foreground">
              {brand.title}
            </p>
            <p className="truncate text-xs text-muted">{brand.subtitle}</p>
          </div>
        )}
      </div>

      {variant === "rail" && (
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent/[0.07] hover:text-foreground ${ring} ${
            collapsed ? "mt-3" : "absolute right-3 top-3 z-10"
          }`}
        >
          <Icon
            icon={ChevronLeft}
            size={16}
            className={`transition-transform duration-300 ease-out ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {variant === "drawer" && (
        <button
          type="button"
          onClick={closeMobileNav}
          aria-label="Đóng menu"
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent/[0.07] hover:text-foreground ${ring}`}
        >
          <Icon icon={X} size={16} />
        </button>
      )}

      <div
        className={`mt-5 shrink-0 border-t border-black/5 ${collapsed ? "w-8" : "w-full"}`}
        aria-hidden
      />

      <nav
        id="sidebar-nav"
        className={`mt-4 flex min-h-0 w-full flex-1 flex-col overflow-y-auto ${collapsed ? "space-y-1" : "space-y-1.5"}`}
      >
        {mainSections.map((section) => renderSection(section))}
      </nav>

      {footerSection && (
        <div className="mt-2 w-full shrink-0">{renderSection(footerSection, true)}</div>
      )}
    </aside>
  );
}

export default SideNavBar;
