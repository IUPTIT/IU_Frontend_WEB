import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ToastContext, type ToastItem, type ToastVariant } from "./toast-context";
import ToastViewport from "../components/ui/ToastViewport";

const AUTO_DISMISS_MS = 3200;
/** Khớp thời lượng animation toast-out trong tailwind.config.js */
const EXIT_MS = 440;

type Props = { children: ReactNode };

export function ToastProvider({ children }: Props) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Đánh dấu leaving → chạy hiệu ứng thoát → gỡ khỏi danh sách sau EXIT_MS */
  const dismiss = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      window.setTimeout(() => remove(id), EXIT_MS);
    },
    [remove],
  );

  const push = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-4), { id, message, variant }]);
    window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  const api = useMemo(
    () => ({
      push,
      success: (message: string) => push(message, "success"),
      error: (message: string) => push(message, "error"),
      info: (message: string) => push(message, "info"),
      created: (entity?: string) =>
        push(entity ? `Đã thêm ${entity} thành công.` : "Thêm thành công.", "success"),
      updated: (entity?: string) =>
        push(
          entity ? `Đã cập nhật ${entity} thành công.` : "Cập nhật thành công.",
          "success",
        ),
      deleted: (entity?: string) =>
        push(entity ? `Đã xóa ${entity} thành công.` : "Xóa thành công.", "success"),
      sent: (count?: number) =>
        push(
          count != null && count > 0
            ? `Gửi thành công ${count} email.`
            : "Gửi thành công.",
          "success",
        ),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
