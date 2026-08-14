import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import Icon from "./Icon";

type Props = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

/** Soft UI empty state for tables/lists. */
function EmptyState({
  title = "Không có dữ liệu",
  description = "Thử đổi bộ lọc hoặc thêm mục mới.",
  icon = Inbox,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-card px-6 py-16 text-center ${className}`}
      role="status"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent shadow-soft-sm">
        <Icon icon={icon} size={28} />
      </span>
      <div className="space-y-1">
        <p className="font-display text-lg font-bold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
