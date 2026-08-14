import type { ToastItem } from "../../context/toast-context";

type Props = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

/** Chip icon tô nền tonal — phẳng, cùng ngôn ngữ với MetricCard / khu quản lý */
const CHIP_CLASS: Record<ToastItem["variant"], string> = {
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  error: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  info: "bg-accent/12 text-accent",
};

function VariantIcon({ variant }: { variant: ToastItem["variant"] }) {
  if (variant === "success") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="m5.5 10.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M10 5.5v5.5" strokeLinecap="round" />
        <circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 9v5" strokeLinecap="round" />
      <circle cx="10" cy="6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Toast nổi góc phải — Thêm / Sửa / Xóa / Gửi thành công.
 *
 * ToastProvider mount ở gốc app (ngoài .portal-shell), nên phải tự bọc
 * .portal-shell để thừa hưởng ngôn ngữ FLAT của khu quản lý (thẻ trắng bo
 * mềm, bóng đổ nhẹ, không phải neumorphism lồi/lõm). Wrapper để nền trong
 * suốt để không sơn màu canvas của shell.
 */
function ToastViewport({ items, onDismiss }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      className="portal-shell pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(100%-2rem,22rem)] flex-col"
      style={{ background: "transparent" }}
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`ui-card pointer-events-auto mb-3 flex w-full items-center gap-3 !rounded-2xl !px-4 !py-3 ${
            t.leaving ? "overflow-hidden animate-toast-out" : "animate-toast-in"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${CHIP_CLASS[t.variant]}`}
            aria-hidden
          >
            <VariantIcon variant={t.variant} />
          </span>
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
            {t.message}
          </p>
          <button
            type="button"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Đóng"
            onClick={() => onDismiss(t.id)}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
