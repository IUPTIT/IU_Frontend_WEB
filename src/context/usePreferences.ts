import { useContext } from "react";
import { PreferencesContext } from "./preferences-context";

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences phải dùng trong PreferencesProvider");
  return ctx;
}
