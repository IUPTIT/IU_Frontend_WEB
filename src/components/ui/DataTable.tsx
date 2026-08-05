import { useEffect, useRef, type ReactNode } from "react";

export type DataTableColumn = {
  id: string;
  label: ReactNode;
  /** Initial width in px */
  width?: number;
  minWidth?: number;
  /** Header + default cell alignment */
  align?: "left" | "center" | "right";
};

const DEFAULT_WIDTH = 140;
const DEFAULT_MIN = 72;

type ShellProps = {
  minWidth?: number;
  children: ReactNode;
  className?: string;
};

/** Soft UI table shell — horizontal scroll on small screens. */
export function DataTableShell({ minWidth = 800, children, className = "" }: ShellProps) {
  return (
    <div className={`neu-card overflow-hidden !p-0 ${className}`}>
      <div className="overflow-x-auto">
        <table className="data-table w-full border-collapse text-sm" style={{ minWidth, tableLayout: "fixed" }}>
          {children}
        </table>
      </div>
    </div>
  );
}

type HeadProps = {
  columns: DataTableColumn[];
  widths: Record<string, number>;
  onResize: (id: string, width: number, minWidth?: number) => void;
};

/**
 * Centered headers + vertical dividers + drag-to-resize handles (enterprise table UX).
 */
export function DataTableHead({ columns, widths, onResize }: HeadProps) {
  const dragRef = useRef<{ id: string; startX: number; startW: number; min: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      onResize(d.id, d.startW + (e.clientX - d.startX), d.min);
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onResize]);

  return (
    <thead>
      <tr>
        {columns.map((col, i) => {
          const align = col.align ?? "center";
          const alignClass =
            align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
          const min = col.minWidth ?? DEFAULT_MIN;
          return (
            <th
              key={col.id}
              scope="col"
              style={{ width: widths[col.id] ?? col.width ?? DEFAULT_WIDTH }}
              className={`data-table-th relative select-none px-3 py-3.5 font-semibold uppercase tracking-wide text-[11px] sm:text-xs ${alignClass}`}
            >
              <span className="inline-flex items-center justify-center gap-1.5">{col.label}</span>
              {i < columns.length - 1 && (
                <button
                  type="button"
                  aria-label={`Kéo đổi độ rộng cột ${typeof col.label === "string" ? col.label : col.id}`}
                  title="Kéo để đổi độ rộng cột"
                  className="data-table-resize absolute right-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    dragRef.current = {
                      id: col.id,
                      startX: e.clientX,
                      startW: widths[col.id] ?? col.width ?? DEFAULT_WIDTH,
                      min,
                    };
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                  }}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

type CellProps = {
  align?: "left" | "center" | "right";
  children: ReactNode;
  className?: string;
  colSpan?: number;
};

export function DataTableCell({ align = "center", children, className = "", colSpan }: CellProps) {
  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <td colSpan={colSpan} className={`data-table-td px-3 py-4 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

export default DataTableShell;
