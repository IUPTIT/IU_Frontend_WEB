import { Search } from "lucide-react";
import type { ReactNode } from "react";
import Icon from "./Icon";
import Input from "./Input";

type Props = {
  /** Placeholder ô tìm kiếm local */
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  /** Tổng số bản ghi sau lọc */
  total: number;
  totalLabel?: string;
  /** Nút cài đặt cột (ColumnSettings) */
  settings?: ReactNode;
  /** Nút/panel bộ lọc (FilterMenu) */
  filter?: ReactNode;
  /** Nút hành động bên phải (Thêm, Xuất…) */
  actions?: ReactNode;
  className?: string;
};

/**
 * Thanh tiện ích bắt buộc cho màn danh sách:
 * Cài đặt cột · Tìm kiếm · Tổng số · Bộ lọc · Actions
 */
function ListToolbar({
  searchPlaceholder = "Tìm…",
  search,
  onSearchChange,
  total,
  totalLabel = "Tổng số",
  settings,
  filter,
  actions,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}
    >
      {settings}
      <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="!pr-11"
          aria-label={searchPlaceholder}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon icon={Search} size={16} />
        </span>
      </div>
      <p className="shrink-0 text-sm text-foreground">
        {totalLabel}:{" "}
        <span className="font-bold text-red-500">{total}</span>
      </p>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {filter}
        {actions}
      </div>
    </div>
  );
}

export default ListToolbar;
