import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Icon from "./Icon";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Hiển thị phía trên trigger (optional) */
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  /** full = kéo full width; auto = theo nội dung */
  width?: "full" | "auto";
};

/**
 * Dropdown Soft UI — dùng chung mọi role (Admin / Leader / Member).
 * Trigger neu-btn + panel neu-card inset; không dùng native <select>.
 */
function Select({
  value,
  options,
  onChange,
  placeholder = "Chọn...",
  label,
  ariaLabel,
  className = "",
  triggerClassName = "",
  disabled = false,
  width = "auto",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

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
    <div
      ref={rootRef}
      className={`relative ${width === "full" ? "w-full" : "inline-block min-w-[200px]"} ${className}`}
    >
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? label}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`neu-btn h-11 w-full !px-4 justify-between gap-3 text-left text-sm font-medium disabled:opacity-50 disabled:pointer-events-none ${
          open ? "!shadow-inset-sm" : ""
        } ${triggerClassName}`}
      >
        <span className={`truncate ${selected ? "text-foreground" : "text-placeholder"}`}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon={ChevronDown}
          size={16}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel ?? label ?? placeholder}
          className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-background p-2 shadow-extruded ring-1 ring-black/5"
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted" role="presentation">
              Không có lựa chọn
            </li>
          )}
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none ${
                    isActive
                      ? "bg-accent/15 text-accent font-semibold shadow-inset-sm"
                      : "text-foreground hover:bg-accent/8"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Select;
