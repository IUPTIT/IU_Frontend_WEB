import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** max width of dialog panel */
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-4xl",
} as const;

/**
 * Centered Soft UI dialog — shared shell for Admin forms/overlays.
 */
function Modal({ open, onClose, title, description, children, footer, size = "md" }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px] transition-opacity duration-200"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex max-h-[min(90vh,720px)] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-card bg-background shadow-soft animate-fade-in`}
      >
        <header className="shrink-0 border-b border-black/5 px-6 py-5">
          <h2 id="modal-title" className="font-display text-xl font-bold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="shrink-0 flex flex-wrap items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
