import { useContext } from "react";
import { PortalUiContext } from "./portal-ui-context";

export function usePortalUi() {
  const ctx = useContext(PortalUiContext);
  if (!ctx) throw new Error("usePortalUi phải dùng trong PortalUiProvider");
  return ctx;
}
