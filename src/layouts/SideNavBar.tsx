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
import { SIDEBAR_CONFIG, findNavIdByPath } from "../constants/navigation";
import { usePortalUi } from "../context/usePortalUi";
import { useAuth } from "../context/useAuth";
import Icon from "../components/ui/Icon";

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
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => !i.mentorOnly || isMentor),
    }))
    .filter((s) => s.items.length > 0);
  const brand =
    role === "member" && isMentor
      ? { ...baseBrand, initial: "M", title: "Mentor Portal" }
      : baseBrand;
  const activeId = findNavIdByPath(role, activePath);
  const collapsed = variant === "rail" && sidebarCollapsed;

  const [openId, setOpenId] = useState<string | null>(() => {
    for (const section of sections) {
      const parent = section.items.find((i) =>
        i.children?.some(
          (c) => c.path === activePath || activePath.startsWith(`${c.path}/`),
        ),
      );
      if (parent) return parent.id;
    }
    return null;
  });

  // Đồng bộ accordion với route — không reset khi chỉ collapse (adjust state during render)
  const [prevActivePath, setPrevActivePath] = useState(activePath);
  if (activePath !== prevActivePath) {
    setPrevActivePath(activePath);
    for (const section of sections) {
      const parent = section.items.find((i) =>
        i.children?.some(
          (c) => c.path === activePath || activePath.startsWith(`${c.path}/`),
        ),
      );
      if (parent) {
        setOpenId(parent.id);
        break;
      }
    }
  }

  const handleParentClick = (item: NavItem) => {
    if (item.action === "logout") {
      closeMobileNav();
      logout();
      return;
    }
    if (item.children) {
      if (collapsed) {
        const activeChild = item.children.find((c) => c.id === activeId);
        navigate(activeChild?.path ?? item.children[0].path);
        return;
      }
      const nextOpen = openId === item.id ? null : item.id;
      setOpenId(nextOpen);
      if (nextOpen) navigate(item.children[0].path);
    } else {
      navigate(item.path);
    }
  };

  const handleChildClick = (child: NavChild) => {
    navigate(child.path);
  };

  const widthClass = collapsed ? "w-[72px]" : "w-[288px]";
  const mainSections = sections.filter((s) => s.id !== "footer");
  const footerSection = sections.find((s) => s.id === "footer");

  const renderSection = (
    section: (typeof sections)[number],
    isFooter = false,
  ) => (
    <div
      key={section.id}
      className={`space-y-2 ${isFooter ? "mt-auto pt-4 border-t border-accent/10 shrink-0" : "shrink-0"}`}
    >
      {section.label && !collapsed && (
        <p className="px-3 text-[11px] font-semibold tracking-wider text-muted uppercase transition-opacity duration-300">
          {section.label}
        </p>
      )}

      {section.items.map((item) => {
        const open = openId === item.id && !collapsed;
        const childActive =
          item.children?.some((c) => c.id === activeId) ?? false;
        const selfActive =
          item.action !== "logout" && item.id === activeId && !item.children;
        const groupActive = childActive || (item.children != null && open);
        const danger = item.tone === "danger";

        return (
          <div
            key={item.id}
            className={`relative rounded-2xl transition-all duration-300 ease-out ${
              groupActive && item.children && !collapsed
                ? "bg-background p-1.5 shadow-extruded-sm"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => handleParentClick(item)}
              aria-expanded={item.children ? open : undefined}
              aria-current={
                selfActive || (childActive && collapsed) ? "page" : undefined
              }
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={`group relative flex w-full items-center rounded-2xl min-h-12 font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                collapsed ? "h-12 justify-center px-0" : "gap-3 px-3 py-2.5"
              } ${
                danger
                  ? "text-red-500 hover:text-red-600 hover:-translate-y-px hover:shadow-extruded-sm"
                  : selfActive
                    ? "bg-accent/15 text-accent font-semibold shadow-inset-sm"
                    : childActive || (groupActive && item.children)
                      ? "text-accent font-semibold"
                      : "text-muted hover:text-foreground hover:-translate-y-px hover:shadow-extruded-sm"
              }`}
            >
              <Icon icon={icons[item.icon]} size={20} className="shrink-0" />

              <span
                className={`text-left leading-snug transition-opacity duration-300 ease-out ${
                  collapsed
                    ? "w-0 overflow-hidden opacity-0"
                    : "min-w-0 flex-1 opacity-100 break-words"
                }`}
              >
                {item.label}
              </span>

              {item.children && !collapsed && (
                <Icon
                  icon={ChevronDown}
                  size={16}
                  className={`ml-1 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
                />
              )}

              {collapsed && (selfActive || childActive) && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                  aria-hidden
                />
              )}

              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-foreground px-3 py-1.5 text-xs text-background opacity-0 shadow-extruded-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {item.label}
                </span>
              )}
            </button>

            {item.children && open && (
              <div className="mt-1.5 space-y-1 px-1 pb-1">
                {item.children.map((child) => {
                  const isActive = child.id === activeId;
                  return (
                    <button
                      type="button"
                      key={child.id}
                      onClick={() => handleChildClick(child)}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative block w-full rounded-xl px-3 py-2.5 text-left text-sm leading-snug transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isActive
                          ? "bg-accent/20 font-semibold text-accent shadow-[inset_0_0_0_1px_rgba(74,144,226,0.35)] ring-1 ring-accent/25"
                          : "text-muted hover:bg-accent/8 hover:text-foreground hover:shadow-extruded-sm"
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                          aria-hidden
                        />
                      )}
                      <span className={isActive ? "pl-1.5" : ""}>
                        {child.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`relative flex shrink-0 flex-col bg-background shadow-extruded rounded-card
        transition-[width,padding] duration-300 ease-out overflow-x-hidden
        ${widthClass}
        ${
          variant === "rail"
            ? "h-full overflow-y-auto"
            : "h-full w-full !w-full overflow-y-auto"
        }
        ${collapsed ? "p-3 items-center" : "p-4"}
      `}
      aria-label="Menu điều hướng"
      data-collapsed={collapsed ? "true" : "false"}
    >
      {/* Brand full width — không chia chỗ với nút toggle */}
      <div
        className={`flex w-full shrink-0 items-center gap-3 rounded-2xl bg-background shadow-extruded-sm
          ${collapsed ? "justify-center p-2" : "p-3 pr-12"}
        `}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent font-display font-extrabold text-lg shadow-inset-sm">
          {brand.initial}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-accent leading-tight">
              {brand.title}
            </p>
            <p className="text-xs text-muted leading-snug">{brand.subtitle}</p>
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
          className={`neu-btn h-9 w-9 !px-0 rounded-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            collapsed ? "mt-3" : "absolute top-4 right-3 z-10"
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
          className="neu-btn absolute top-4 right-3 z-10 h-9 w-9 !px-0 rounded-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Icon icon={X} size={16} />
        </button>
      )}

      <nav
        id="sidebar-nav"
        className={`mt-6 w-full flex flex-1 flex-col min-h-0 ${collapsed ? "space-y-2" : "space-y-3"}`}
      >
        {mainSections.map((section) => renderSection(section))}
        {footerSection && renderSection(footerSection, true)}
      </nav>
    </aside>
  );
}

export default SideNavBar;
