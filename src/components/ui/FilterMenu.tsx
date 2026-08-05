import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ListFilter } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";

type Props = {
  /** Số điều kiện đang active — hiện badge trên nút */
  activeCount?: number;
  label?: string;
  applyLabel?: string;
  resetLabel?: string;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * Nút "Lọc" Soft UI + panel điều kiện thả xuống.
 * Nội dung điều kiện (Select, input…) do caller truyền vào — dùng chung mọi role.
 */
function FilterMenu({
  activeCount = 0,
  label = "Lọc",
  applyLabel = "Áp dụng",
  resetLabel = "Đặt lại",
  onApply,
  onReset,
  children,
  className = "",
}: Props) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`!h-11 !rounded-2xl ${open ? "!shadow-inset-sm" : ""}`}
        leftIcon={<Icon icon={ListFilter} size={16} />}
      >
        {label}
        {activeCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-bold text-accent">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Điều kiện lọc"
          className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,320px)] max-h-[min(70vh,480px)] overflow-y-auto rounded-2xl bg-background p-4 shadow-extruded ring-1 ring-black/5 space-y-4"
        >
          <div className="space-y-3">{children}</div>

          <div className="flex items-center justify-end gap-2 border-t border-black/5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="!h-10"
              onClick={() => {
                onReset();
              }}
            >
              {resetLabel}
            </Button>
            <Button
              variant="soft"
              size="sm"
              className="!h-10"
              onClick={() => {
                onApply();
                setOpen(false);
              }}
            >
              {applyLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterMenu;
