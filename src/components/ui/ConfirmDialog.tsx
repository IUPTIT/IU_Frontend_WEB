import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  /** Nội dung mô tả — string hoặc JSX */
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger = hành động phá huỷ (xoá, thu hồi...) — nút xác nhận màu đỏ */
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Dialog xác nhận dùng chung cho khu quản trị — thay window.confirm */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  tone = "default",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-[2px]"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="ui-card w-full max-w-md !p-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`ui-well-sm h-11 w-11 shrink-0 ${
              tone === "danger" ? "text-red-500" : "text-accent"
            }`}
          >
            {tone === "danger" ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M10 3 2.5 16h15L10 3Z" strokeLinejoin="round" />
                <path d="M10 8v4M10 14.5v.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 9v5M10 6v.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
            {message && <div className="mt-1.5 text-sm text-muted">{message}</div>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="ui-btn" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              tone === "danger"
                ? `inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-12 font-medium text-white
                   bg-red-500 shadow-soft transition-all duration-300 ease-out
                   hover:-translate-y-px hover:bg-red-600 active:translate-y-[0.5px]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-background
                   disabled:opacity-60 disabled:pointer-events-none`
                : "ui-btn-primary disabled:opacity-60 disabled:pointer-events-none"
            }
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
