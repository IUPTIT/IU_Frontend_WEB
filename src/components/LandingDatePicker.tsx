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
// Lịch mở sẵn ở mốc ~18 tuổi cho đỡ phải cuộn xa khi chọn ngày sinh
const DEFAULT_VIEW = new Date(CURRENT_YEAR - 18, 0, 1);

// Chỉ trả Date khi iso hợp lệ — KHÔNG bao giờ đẩy Invalid Date vào `selected`
// (react-datepicker gọi date-fns/format trên đó sẽ throw "Invalid time value").
function toDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Chỉ sinh ISO khi date hợp lệ — chặn "NaN-NaN-NaN" làm hỏng state vòng sau.
function toIso(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
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
      // Gõ tay sai/khuyết → null thay vì Date rác (tránh 13/10 hiểu nhầm)
      strictParsing
      openToDate={toDate(value) ?? DEFAULT_VIEW}
      className="landing-input"
      calendarClassName="landing-datepicker"
      wrapperClassName="w-full"
      portalId="landing-datepicker-portal"
      // Header tự dựng: chọn NĂM trước rồi THÁNG (đặt năm sinh trước, tránh
      // trạng thái tháng-đổi-trước-năm rơi ra ngoài maxDate) rồi bấm ngày ở lưới.
      renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
        <div className="flex items-center gap-1 px-1.5 pb-1 pt-1.5">
          <button
            type="button"
            onClick={decreaseMonth}
            aria-label="Tháng trước"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ‹
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-1">
            <LandingSelect
              compact
              isSearchable
              options={YEARS}
              value={String(date.getFullYear())}
              onChange={(y) => y && changeYear(Number(y))}
            />
            <LandingSelect
              compact
              options={MONTHS}
              value={MONTHS[date.getMonth()]}
              onChange={(m) => changeMonth(MONTHS.indexOf(m))}
            />
          </div>
          <button
            type="button"
            onClick={increaseMonth}
            aria-label="Tháng sau"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ›
          </button>
        </div>
      )}
    />
  );
}

export default LandingDatePicker;
