import { useCallback, useMemo, useState } from "react";
import type { DataTableColumn } from "./DataTable";

const DEFAULT_WIDTH = 140;
const DEFAULT_MIN = 72;

export function useColumnWidths(columns: DataTableColumn[]) {
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const widths = useMemo(() => {
    const next: Record<string, number> = { ...overrides };
    for (const c of columns) {
      if (next[c.id] == null) next[c.id] = c.width ?? DEFAULT_WIDTH;
    }
    return next;
  }, [columns, overrides]);

  const setWidth = useCallback((id: string, width: number, minWidth = DEFAULT_MIN) => {
    setOverrides((prev) => ({ ...prev, [id]: Math.max(minWidth, Math.round(width)) }));
  }, []);

  return { widths, setWidth };
}
