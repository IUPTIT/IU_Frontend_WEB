import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

type Preferences = {
  theme: ThemeMode;
  emailNotifications: boolean;
  inAppNotifications: boolean;
};

type PreferencesContextValue = Preferences & {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setEmailNotifications: (v: boolean) => void;
  setInAppNotifications: (v: boolean) => void;
};

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

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

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

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences phải dùng trong PreferencesProvider");
  return ctx;
}
