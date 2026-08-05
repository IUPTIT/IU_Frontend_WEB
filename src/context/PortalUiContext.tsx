import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "sidebarCollapsed";
const DESKTOP_MIN = 1200;
const TABLET_MIN = 768;

import { PortalUiContext } from "./portal-ui-context";

function readStoredCollapsed(): boolean | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return raw === "true";
  } catch {
    return null;
  }
}

function writeStoredCollapsed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore quota / private mode */
  }
}

function defaultCollapsedForWidth(width: number): boolean {
  const stored = readStoredCollapsed();
  if (stored !== null) return stored;
  // Chưa có preference: desktop mở, tablet thu gọn
  if (width >= DESKTOP_MIN) return false;
  if (width >= TABLET_MIN) return true;
  return false;
}

type Props = {
  activePath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
};

export function PortalUiProvider({ activePath, onNavigate, children }: Props) {
  const [search, setSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() =>
    typeof window !== "undefined" ? defaultCollapsedForWidth(window.innerWidth) : false,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      // Chỉ áp default khi chưa từng lưu localStorage
      if (readStoredCollapsed() !== null) return;
      const w = window.innerWidth;
      if (w >= TABLET_MIN) {
        setSidebarCollapsedState(defaultCollapsedForWidth(w));
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Khóa scroll body khi drawer mở
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsedState(value);
    writeStoredCollapsed(value);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      writeStoredCollapsed(next);
      return next;
    });
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const navigate = useCallback(
    (path: string) => {
      onNavigate(path);
      setMobileNavOpen(false);
    },
    [onNavigate],
  );

  const value = useMemo(
    () => ({
      search,
      setSearch,
      navigate,
      activePath,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      openMobileNav,
      closeMobileNav,
    }),
    [
      search,
      navigate,
      activePath,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      openMobileNav,
      closeMobileNav,
    ],
  );

  return <PortalUiContext.Provider value={value}>{children}</PortalUiContext.Provider>;
}
