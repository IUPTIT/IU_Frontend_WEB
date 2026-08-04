import { createContext } from "react";

export type PortalUiContextValue = {
  search: string;
  setSearch: (value: string) => void;
  navigate: (path: string) => void;
  activePath: string;
  /** true = sidebar thu gọn (desktop/tablet rail) */
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  /** Drawer mobile */
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

export const PortalUiContext = createContext<PortalUiContextValue | null>(null);
