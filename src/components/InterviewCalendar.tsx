import Button from "./ui/Button";

type Props = {
  year: number;
  month: number; // 0-11
  selectedDate: string; // YYYY-MM-DD
  markedDates: Set<string>;
  onSelectDate: (iso: string) => void;
  onMonthChange: (year: number, month: number) => void;
  /** Flat 2D (candidate) — mặc định Soft UI cho admin */
  flat?: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function InterviewCalendar({
  year,
  month,
  selectedDate,
  markedDates,
  onSelectDate,
  onMonthChange,
  flat,
}: Props) {
  const firstDow = new Date(year, month, 1).getDay(); // 0 Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const title = new Date(year, month, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const navBtn = flat
    ? "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E8F0] bg-white text-[#3D4458] transition-colors hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
    : undefined;

  return (
    <section
      className={
        flat
          ? "space-y-4 rounded-2xl border border-[#E8EAF2] bg-white p-5"
          : "neu-card !p-5 space-y-4"
      }
    >
      <div className="flex items-center justify-between gap-2">
        {flat ? (
          <button
            type="button"
            className={navBtn}
            aria-label="Tháng trước"
            onClick={() => {
              const d = new Date(year, month - 1, 1);
              onMonthChange(d.getFullYear(), d.getMonth());
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <Button
            variant="icon"
            size="sm"
            aria-label="Tháng trước"
            onClick={() => {
              const d = new Date(year, month - 1, 1);
              onMonthChange(d.getFullYear(), d.getMonth());
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        )}
        <h3
          className={
            flat
              ? "font-grotesk text-base font-bold capitalize text-[#191A2C]"
              : "font-display text-base font-bold capitalize"
          }
        >
          {title}
        </h3>
        {flat ? (
          <button
            type="button"
            className={navBtn}
            aria-label="Tháng sau"
            onClick={() => {
              const d = new Date(year, month + 1, 1);
              onMonthChange(d.getFullYear(), d.getMonth());
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <Button
            variant="icon"
            size="sm"
            aria-label="Tháng sau"
            onClick={() => {
              const d = new Date(year, month + 1, 1);
              onMonthChange(d.getFullYear(), d.getMonth());
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        )}
      </div>

      <div
        className={`grid grid-cols-7 gap-1 text-center text-[11px] font-semibold ${
          flat ? "text-[#9AA0B4]" : "text-muted"
        }`}
      >
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null) return <span key={`e-${i}`} />;
          const iso = toIso(year, month, day);
          const selected = iso === selectedDate;
          const marked = markedDates.has(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-xl text-sm transition-all duration-200 ${
                selected
                  ? flat
                    ? "bg-[#7C3AED] font-bold text-white"
                    : "bg-accent text-white font-bold shadow-extruded-sm"
                  : flat
                    ? "text-[#191A2C] hover:bg-[#F1E9FE]"
                    : "text-foreground hover:bg-accent/10"
              }`}
            >
              {day}
              {marked && !selected && (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default InterviewCalendar;
