import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { PreferencesContext, type Preferences, type ThemeMode } from "./preferences-context";

export type { ThemeMode };

const STORAGE_KEY = "iuclub_preferences";

const DEFAULTS: Preferences = {
  theme: "light",
  emailNotifications: true,
  inAppNotifications: true,
};

function readPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULTS;
  }
}

function writePrefs(p: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() =>
    typeof window !== "undefined" ? readPrefs() : DEFAULTS,
  );

  useEffect(() => {
    writePrefs(prefs);
    document.documentElement.classList.toggle("dark", prefs.theme === "dark");
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" }));
  }, []);

  const setEmailNotifications = useCallback((emailNotifications: boolean) => {
    setPrefs((p) => ({ ...p, emailNotifications }));
  }, []);

  const setInAppNotifications = useCallback((inAppNotifications: boolean) => {
    setPrefs((p) => ({ ...p, inAppNotifications }));
  }, []);

  const value = useMemo(
    () => ({
      ...prefs,
      setTheme,
      toggleTheme,
      setEmailNotifications,
      setInAppNotifications,
    }),
    [prefs, setTheme, toggleTheme, setEmailNotifications, setInAppNotifications],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}
