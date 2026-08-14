import { createContext } from "react";

export type ThemeMode = "light" | "dark";

export type Preferences = {
  theme: ThemeMode;
  emailNotifications: boolean;
  inAppNotifications: boolean;
};

export type PreferencesContextValue = Preferences & {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setEmailNotifications: (v: boolean) => void;
  setInAppNotifications: (v: boolean) => void;
};

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
