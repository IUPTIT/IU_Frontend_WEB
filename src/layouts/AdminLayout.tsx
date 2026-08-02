import { useState } from "react";
import type { ReactNode } from "react";
import SideNavBar from "./SideNavBar";
import TopBar from "./TopBar";
import type { Role } from "../types/navigation";
import { SIDEBAR_CONFIG } from "../constants/navigation";

type Props = {
  role: Role;
  children: ReactNode;
};

function AdminLayout({ role, children }: Props) {
  const [activeNav, setActiveNav] = useState(SIDEBAR_CONFIG[role].items[0].id);
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen gap-6 bg-background p-4 sm:p-6">
      <SideNavBar role={role} activeId={activeNav} onSelect={(item) => setActiveNav(item.id)} />

      <div className="flex-1 min-w-0">
        <TopBar search={search} onSearchChange={setSearch} />
        <main className="mx-auto max-w-7xl py-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
