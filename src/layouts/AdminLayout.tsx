import { useEffect, type ReactNode } from "react";
import SideNavBar from "./SideNavBar";
import TopBar from "./TopBar";
import type { Role } from "../types/navigation";
import { PortalUiProvider } from "../context/PortalUiContext";
import { usePortalUi } from "../context/usePortalUi";

type Props = {
  role: Role;
  children: ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
};

function searchPlaceholderForPath(path: string): string {
  if (path.includes("/settings/email")) return "Tìm template, SMTP...";
  if (path.includes("/settings")) return "Tìm trong cài đặt...";
  if (path.includes("/permissions")) return "Tìm kiếm tài khoản, email...";
  if (path.includes("/members")) return "Tìm kiếm thành viên CLB...";
  if (path.includes("/training/teams")) return "Tìm kiếm theo tên đội training...";
  if (path.includes("/training/roadmap")) return "Tìm kiếm lộ trình, nhóm...";
  if (path.includes("/training/review")) return "Tìm kiếm học viên...";
  if (path.includes("/recruitment/results")) return "Tìm kiếm kết quả...";
  if (path.includes("/recruitment/applications")) return "Tìm kiếm tên ứng viên...";
  if (path.includes("/recruitment/open")) return "Tìm kiếm đợt tuyển...";
  if (path.includes("/recruitment/interviews")) return "Tìm kiếm lịch phỏng vấn...";
  return "Tìm kiếm...";
}

function LayoutInner({ role, children }: { role: Role; children: ReactNode }) {
  const {
    search,
    setSearch,
    activePath,
    mobileNavOpen,
    openMobileNav,
    closeMobileNav,
  } = usePortalUi();

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen, closeMobileNav]);

  // Đổi trang → reset ô tìm kiếm
  useEffect(() => {
    setSearch("");
  }, [activePath, setSearch]);

  return (
    <div className="portal-shell flex min-h-screen gap-4 sm:gap-6 bg-background p-4 sm:p-6">
      {/* Desktop / Tablet rail — ≥768px, cao full viewport */}
      <div className="hidden md:block shrink-0 sticky top-4 sm:top-6 h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] self-start">
        <SideNavBar role={role} variant="rail" />
      </div>

      {/* Mobile drawer — <768px */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-out ${
          mobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
          aria-label="Đóng menu"
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={closeMobileNav}
        />
        <div
          className={`absolute inset-y-0 left-0 flex p-3 transition-transform duration-300 ease-out ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!mobileNavOpen}
          aria-label="Menu điều hướng"
        >
          <div className="h-full w-[min(288px,85vw)] overflow-hidden rounded-card shadow-extruded">
            <SideNavBar role={role} variant="drawer" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <TopBar
          role={role}
          search={search}
          onSearchChange={setSearch}
          onOpenMobileNav={openMobileNav}
          searchPlaceholder={searchPlaceholderForPath(activePath)}
        />
        <main className="mx-auto max-w-7xl py-6 sm:py-8 space-y-6 sm:space-y-8 px-0">{children}</main>
      </div>
    </div>
  );
}

function AdminLayout({ role, children, activePath, onNavigate }: Props) {
  return (
    <PortalUiProvider activePath={activePath} onNavigate={onNavigate}>
      <LayoutInner role={role}>{children}</LayoutInner>
    </PortalUiProvider>
  );
}

export default AdminLayout;
