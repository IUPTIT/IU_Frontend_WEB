import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import LandingSelect from "./LandingSelect";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("vi", vi);

type Props = {
  value: string; // yyyy-MM-dd hoặc rỗng
  onChange: (isoDate: string) => void;
  placeholder?: string;
  maxDate?: Date;
};

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => String(CURRENT_YEAR - i));

function toDate(iso: string): Date | null {
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

function toIso(date: Date | null): string {
  if (!date) return "";
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function LandingDatePicker({ value, onChange, placeholder, maxDate }: Props) {
  return (
    <DatePicker
      selected={toDate(value)}
      onChange={(date: Date | null) => onChange(toIso(date))}
      locale="vi"
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder ?? "dd/mm/yyyy"}
      maxDate={maxDate}
      className="landing-input"
      calendarClassName="landing-datepicker"
      wrapperClassName="w-full"
      portalId="landing-datepicker-portal"
      // Header tự dựng: chọn tháng/năm bằng LandingSelect thay cho <select> gốc của browser
      renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
        <div className="flex items-center gap-1.5 px-2 pb-1 pt-2">
          <button
            type="button"
            onClick={decreaseMonth}
            aria-label="Tháng trước"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-[hsl(var(--landing-foreground)/0.8)] transition-colors hover:bg-white/10 hover:text-[hsl(var(--landing-foreground))]"
          >
            ‹
          </button>
          <div className="w-[104px]">
            <LandingSelect
              compact
              options={MONTHS}
              value={MONTHS[date.getMonth()]}
              onChange={(m) => changeMonth(MONTHS.indexOf(m))}
            />
          </div>
          <div className="w-[96px]">
            <LandingSelect
              compact
              isSearchable
              options={YEARS}
              value={String(date.getFullYear())}
              onChange={(y) => y && changeYear(Number(y))}
            />
          </div>
          <button
            type="button"
            onClick={increaseMonth}
            aria-label="Tháng sau"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-[hsl(var(--landing-foreground)/0.8)] transition-colors hover:bg-white/10 hover:text-[hsl(var(--landing-foreground))]"
          >
            ›
          </button>
        </div>
      )}
    />
  );
}

export default LandingDatePicker;
