import Button from "../../../../../components/ui/Button";

type Props = {
  year: number;
  month: number; // 0-11
  selectedDate: string; // YYYY-MM-DD
  markedDates: Set<string>;
  onSelectDate: (iso: string) => void;
  onMonthChange: (year: number, month: number) => void;
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

  return (
    <section className="neu-card !p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
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
        <h3 className="font-display text-base font-bold capitalize">{title}</h3>
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
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
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
                  ? "bg-accent text-white font-bold shadow-extruded-sm"
                  : "text-foreground hover:bg-accent/10"
              }`}
            >
              {day}
              {marked && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default InterviewCalendar;
