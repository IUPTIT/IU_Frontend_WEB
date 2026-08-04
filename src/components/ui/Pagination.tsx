import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

/** Phân trang dạng < 1 2 3 > — dùng dưới bảng/list */
function Pagination({ page, totalPages, onChange, className = "" }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      aria-label="Phân trang"
    >
      <Button
        variant="icon"
        size="sm"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="disabled:opacity-40 disabled:pointer-events-none"
      >
        <Icon icon={ChevronLeft} size={16} />
      </Button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
          className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            p === page
              ? "bg-accent/15 text-accent shadow-inset-sm"
              : "text-muted hover:text-foreground hover:shadow-extruded-sm"
          }`}
        >
          {p}
        </button>
      ))}

      <Button
        variant="icon"
        size="sm"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="disabled:opacity-40 disabled:pointer-events-none"
      >
        <Icon icon={ChevronRight} size={16} />
      </Button>
    </nav>
  );
}

export default Pagination;
