import { useEffect, useMemo, useState } from "react";
import { Download, GripVertical, X } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";
import { downloadCsv, stampFilename } from "../../utils/csvExport";

export type ExportFilterOption = {
  value: string;
  label: string;
};

export type ExportColumnDef<T> = {
  id: string;
  label: string;
  /** Giá trị ô trong file xuất */
  getValue: (row: T) => string;
  /** Cột có nhiều giá trị → cho chọn lọc khi xuất */
  filterOptions?: ExportFilterOption[];
  /** Key để đối chiếu filter (mặc định = getValue) */
  getFilterKey?: (row: T) => string;
  defaultSelected?: boolean;
};

export type ExportDataModalProps<T> = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  columns: ExportColumnDef<T>[];
  /** Dữ liệu đã qua bộ lọc trang (nếu có) */
  rows: T[];
  filenameBase: string;
  onExported?: (count: number) => void;
};

/**
 * Modal Soft UI — chọn cột xuất, sắp xếp thứ tự, lọc giá trị cột (vd. trạng thái).
 * Dùng chung mọi role / màn có nút Xuất.
 */
function ExportDataModal<T>({
  open,
  onClose,
  title = "Xuất dữ liệu",
  description = "Chọn các trường dữ liệu cần trích xuất và lọc giá trị cột nếu cần:",
  columns,
  rows,
  filenameBase,
  onExported,
}: ExportDataModalProps<T>) {
  const defaultIds = useMemo(
    () => columns.filter((c) => c.defaultSelected !== false).map((c) => c.id),
    [columns],
  );

  const [orderedIds, setOrderedIds] = useState<string[]>(defaultIds);
  /** columnId → danh sách value được giữ; [] hoặc thiếu = tất cả */
  const [valueFilters, setValueFilters] = useState<Record<string, string[]>>({});
  const [dragId, setDragId] = useState<string | null>(null);

  // Reset lựa chọn mỗi lần mở modal (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setOrderedIds(defaultIds);
      const init: Record<string, string[]> = {};
      for (const c of columns) {
        if (c.filterOptions?.length) {
          init[c.id] = c.filterOptions.map((o) => o.value);
        }
      }
      setValueFilters(init);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedSet = new Set(orderedIds);
  const available = columns;
  const selectedOrdered = orderedIds
    .map((id) => columns.find((c) => c.id === id))
    .filter(Boolean) as ExportColumnDef<T>[];

  const toggleColumn = (id: string, checked: boolean) => {
    setOrderedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const selectAll = () => setOrderedIds(columns.map((c) => c.id));
  const deselectAll = () => setOrderedIds([]);

  const toggleFilterValue = (colId: string, value: string, checked: boolean) => {
    setValueFilters((prev) => {
      const cur = prev[colId] ?? [];
      const next = checked ? [...new Set([...cur, value])] : cur.filter((v) => v !== value);
      return { ...prev, [colId]: next };
    });
  };

  const moveItem = (fromId: string, toId: string) => {
    setOrderedIds((prev) => {
      const from = prev.indexOf(fromId);
      const to = prev.indexOf(toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, fromId);
      return next;
    });
  };

  const handleDownload = () => {
    if (selectedOrdered.length === 0) return;

    const filterCols = selectedOrdered.filter((c) => c.filterOptions?.length);
    const filteredRows = rows.filter((row) =>
      filterCols.every((col) => {
        const allowed = valueFilters[col.id];
        if (!allowed || allowed.length === 0) return false;
        if (allowed.length === col.filterOptions!.length) return true;
        const key = (col.getFilterKey ?? col.getValue)(row);
        return allowed.includes(key);
      }),
    );

    const headers = selectedOrdered.map((c) => c.label);
    const data = filteredRows.map((row) => selectedOrdered.map((c) => c.getValue(row)));
    downloadCsv(stampFilename(filenameBase), headers, data);
    onExported?.(filteredRows.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 id="export-modal-title" className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <Icon icon={X} size={16} />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-5 sm:grid-cols-2 sm:p-6">
          {/* Left — available fields */}
          <section className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-foreground">Các trường khả dụng</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="soft" size="sm" className="!h-9 !text-xs" onClick={selectAll}>
                  Chọn tất cả
                </Button>
                <Button variant="secondary" size="sm" className="!h-9 !text-xs" onClick={deselectAll}>
                  Bỏ chọn tất cả
                </Button>
              </div>
            </div>

            <ul className="neu-card !p-3 flex-1 space-y-1 overflow-y-auto shadow-inset-sm !rounded-2xl">
              {available.map((col) => {
                const checked = selectedSet.has(col.id);
                return (
                  <li key={col.id} className="rounded-xl px-2 py-2 hover:bg-accent/[0.06]">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-accent/40 accent-accent"
                        checked={checked}
                        onChange={(e) => toggleColumn(col.id, e.target.checked)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{col.label}</span>
                        {checked && col.filterOptions && col.filterOptions.length > 0 && (
                          <fieldset className="mt-2 space-y-1.5 rounded-xl bg-background/80 p-2 shadow-inset-sm">
                            <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                              Lọc giá trị xuất
                            </legend>
                            <div className="flex flex-wrap gap-1.5">
                              {col.filterOptions.map((opt) => {
                                const on = (valueFilters[col.id] ?? []).includes(opt.value);
                                return (
                                  <label
                                    key={opt.value}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                      on
                                        ? "bg-accent/15 text-accent shadow-inset-sm"
                                        : "bg-background text-muted shadow-extruded-sm"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={on}
                                      onChange={(e) =>
                                        toggleFilterValue(col.id, opt.value, e.target.checked)
                                      }
                                    />
                                    {opt.label}
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Right — extract order */}
          <section className="flex min-h-0 flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">Các trường để trích xuất</h3>
            <div className="neu-card !p-0 flex-1 overflow-hidden !rounded-2xl shadow-inset-sm">
              <div className="grid grid-cols-[40px_1fr] gap-2 bg-accent/15 px-3 py-2.5 text-xs font-semibold text-accent">
                <span>TT</span>
                <span>Tên trường</span>
              </div>
              {selectedOrdered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">Chưa chọn trường nào.</p>
              ) : (
                <ul className="max-h-[min(48vh,380px)] overflow-y-auto p-2 space-y-1">
                  {selectedOrdered.map((col, index) => (
                    <li
                      key={col.id}
                      draggable
                      onDragStart={() => setDragId(col.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragId) moveItem(dragId, col.id);
                        setDragId(null);
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={`grid grid-cols-[28px_40px_1fr] items-center gap-1 rounded-xl px-2 py-2.5 text-sm transition-shadow ${
                        dragId === col.id
                          ? "bg-accent/10 shadow-extruded-sm"
                          : "hover:bg-accent/[0.05]"
                      }`}
                    >
                      <span
                        className="cursor-grab text-muted active:cursor-grabbing"
                        title="Kéo để sắp xếp"
                        aria-hidden
                      >
                        <Icon icon={GripVertical} size={16} />
                      </span>
                      <span className="font-semibold text-muted">{index + 1}</span>
                      <span className="truncate font-medium text-foreground">{col.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-muted">
              Kéo thả để đổi thứ tự cột. Dữ liệu xuất theo bộ lọc trang hiện tại
              {rows.length > 0 ? ` (${rows.length} dòng nguồn)` : ""}.
            </p>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" size="md" onClick={onClose}>
            HỦY
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={selectedOrdered.length === 0}
            onClick={handleDownload}
            leftIcon={<Icon icon={Download} size={16} />}
          >
            TẢI XUỐNG DỮ LIỆU
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default ExportDataModal;
