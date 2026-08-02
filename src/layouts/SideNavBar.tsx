import { useState } from "react";
import type { ReactNode } from "react";
import type { NavChild, NavItem, Role } from "../types/navigation";
import { SIDEBAR_CONFIG } from "../constants/navigation";

const icons: Record<NavItem["icon"], ReactNode> = {
  dashboard: (
    <g fill="currentColor" stroke="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </g>
  ),
  recruitment: (
    <g>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5a5.5 5.5 0 0 1 11 0M15 6v5M12.5 8.5h5" strokeLinecap="round" />
    </g>
  ),
  training: <path d="m10 3 8 4-8 4-8-4 8-4Zm-5 6.5V14c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5V9.5" strokeLinejoin="round" />,
  members: (
    <g>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="14" cy="8" r="2" />
      <path d="M2.5 16a4.5 4.5 0 0 1 9 0M11.5 15.5a3.5 3.5 0 0 1 6 0" strokeLinecap="round" />
    </g>
  ),
  events: <path d="M3 4h14v13H3V4Zm0 4h14M7 2.5v3M13 2.5v3M7 12h2" strokeLinecap="round" />,
  profile: (
    <g>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3.5 17a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </g>
  ),
  settings: (
    <g>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" strokeLinecap="round" />
    </g>
  ),
};

type Props = {
  role: Role;
  activeId: string; // id của item cha hoặc item con đang active
  onSelect: (item: NavItem | NavChild) => void;
};

function SideNavBar({ role, activeId, onSelect }: Props) {
  const { brand, items } = SIDEBAR_CONFIG[role];
  // Mở sẵn group chứa item đang active
  const [openId, setOpenId] = useState<string | null>(
    () => items.find((i) => i.children?.some((c) => c.id === activeId))?.id ?? null,
  );

  const handleParentClick = (item: NavItem) => {
    if (item.children) {
      setOpenId(openId === item.id ? null : item.id);
      // Chọn item con đầu tiên khi mở group
      if (openId !== item.id) onSelect(item.children[0]);
    } else {
      onSelect(item);
    }
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-background p-6 shadow-extruded rounded-card">
      <div className="flex items-center gap-3 rounded-2xl bg-background p-3 shadow-extruded-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent font-display font-extrabold text-lg shadow-inset-sm">
          {brand.initial}
        </div>
        <div>
          <p className="font-display font-bold text-accent leading-tight">{brand.title}</p>
          <p className="text-xs text-muted">{brand.subtitle}</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {items.map((item) => {
          const open = openId === item.id;
          const childActive = item.children?.some((c) => c.id === activeId) ?? false;
          const active = item.id === activeId || childActive;

          return (
            <div key={item.id}>
              <button
                onClick={() => handleParentClick(item)}
                aria-expanded={item.children ? open : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 h-12 font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "text-accent shadow-inset"
                    : "text-muted hover:text-foreground hover:-translate-y-px hover:shadow-extruded-sm"
                }`}
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  {icons[item.icon]}
                </svg>
                <span className="text-left leading-tight">{item.label}</span>
                {item.children && (
                  <svg
                    className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Sidebar phụ (sub-menu) */}
              {item.children && open && (
                <div className="mt-2 ml-5 space-y-1 rounded-2xl p-2 shadow-inset-sm">
                  {item.children.map((child) => {
                    const isActive = child.id === activeId;
                    return (
                      <button
                        key={child.id}
                        onClick={() => onSelect(child)}
                        className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          isActive
                            ? "bg-accent/15 font-medium text-accent shadow-inset-sm"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default SideNavBar;
