import { useEffect, useId, useRef, useState } from "react";
import { Settings } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";

export type ColumnSettingItem = {
  id: string;
  label: string;
  /** Không cho ẩn (vd. Thao tác) */
  locked?: boolean;
};

type Props = {
  columns: ColumnSettingItem[];
  /** id cột đang hiện */
  visibleIds: string[];
  onApply: (visibleIds: string[]) => void;
  className?: string;
};

/**
 * Popover "Cấu hình cột" — gear → chọn cột hiển thị → Áp dụng.
 */
function ColumnSettings({ columns, visibleIds, onApply, className = "" }: Props) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(visibleIds);

  useEffect(() => {
    if (open) setDraft(visibleIds);
  }, [open, visibleIds]);

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

  const toggle = (id: string, locked?: boolean) => {
    if (locked) return;
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const reset = () => setDraft(columns.map((c) => c.id));

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Cấu hình cột"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`!h-11 !w-11 !rounded-2xl !px-0 ${open ? "!shadow-hairline" : ""}`}
      >
        <Icon icon={Settings} size={16} />
      </Button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Cấu hình cột"
          className="absolute left-0 z-30 mt-2 w-[min(100vw-2rem,280px)] rounded-2xl bg-background p-4 shadow-soft ring-1 ring-black/5"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold">Cấu hình cột</h3>
            <button
              type="button"
              className="text-xs font-semibold text-accent hover:underline"
              onClick={reset}
            >
              Khôi phục
            </button>
          </div>
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {columns.map((col) => {
              const checked = draft.includes(col.id);
              return (
                <li key={col.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-black/5 ${
                      col.locked ? "opacity-60" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[var(--color-accent)]"
                      checked={checked}
                      disabled={col.locked}
                      onChange={() => toggle(col.id, col.locked)}
                    />
                    <span className="text-sm">{col.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex justify-end gap-2 border-t border-black/5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="!h-10"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="!h-10"
              onClick={() => {
                const locked = columns.filter((c) => c.locked).map((c) => c.id);
                const next = [...new Set([...draft, ...locked])];
                if (next.length === 0) return;
                onApply(next);
                setOpen(false);
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColumnSettings;
