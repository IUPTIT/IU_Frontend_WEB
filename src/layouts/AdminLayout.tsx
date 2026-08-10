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
  if (path.includes("/departments")) return "Tìm kiếm Ban, lĩnh vực...";
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
    <div className="portal-shell flex min-h-screen bg-background">
      {/* Desktop / Tablet rail — ≥768px, full màn, sát mép trái */}
      <div className="sticky top-0 z-20 hidden h-screen shrink-0 self-start md:block">
        <SideNavBar role={role} variant="rail" />
      </div>

      {/* Mobile drawer — chỉ mount khi mở để không chặn click trang */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden pointer-events-auto opacity-100 transition-opacity duration-300 ease-out">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
            aria-label="Đóng menu"
            onClick={closeMobileNav}
          />
          <div
            className="absolute inset-y-0 left-0 flex translate-x-0 p-3 transition-transform duration-300 ease-out"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
          >
            <div className="h-full w-[min(288px,85vw)] overflow-hidden rounded-card shadow-extruded">
              <SideNavBar role={role} variant="drawer" />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Sticky top bar — nền canvas đục, che nội dung cuộn phía sau */}
          <div className="portal-topbar-bg sticky top-0 z-30 pb-3 pt-4 sm:pt-6">
            <TopBar
              role={role}
              search={search}
              onSearchChange={setSearch}
              onOpenMobileNav={openMobileNav}
              searchPlaceholder={searchPlaceholderForPath(activePath)}
            />
          </div>
          <main className="space-y-6 pb-8 sm:space-y-8">{children}</main>
        </div>
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
