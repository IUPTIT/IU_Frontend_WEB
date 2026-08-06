import type { ToastItem } from "../../context/toast-context";

type Props = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

const VARIANT_CLASS: Record<ToastItem["variant"], string> = {
  success: "border-emerald-500/30 bg-emerald-50 text-emerald-900 shadow-extruded-sm",
  error: "border-rose-500/30 bg-rose-50 text-rose-900 shadow-extruded-sm",
  info: "border-accent/30 bg-accent/10 text-foreground shadow-extruded-sm",
};

/**
 * Toast nổi góc phải — Thêm / Sửa / Xóa / Gửi thành công.
 */
function ToastViewport({ items, onDismiss }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${VARIANT_CLASS[t.variant]}`}
        >
          <span className="mt-0.5 shrink-0" aria-hidden>
            {t.variant === "success" ? "✓" : t.variant === "error" ? "!" : "i"}
          </span>
          <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            className="shrink-0 rounded-lg px-1.5 text-lg leading-none opacity-60 hover:opacity-100"
            aria-label="Đóng"
            onClick={() => onDismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
