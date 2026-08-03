type Props = {
  dateLabel: string;
  total: number;
  scheduled: number;
  missing: number;
};

function DaySummaryCard({ dateLabel, total, scheduled, missing }: Props) {
  return (
    <section className="neu-card !p-5 space-y-4">
      <h3 className="font-display text-base font-bold">Tổng quan ngày {dateLabel}</h3>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 shadow-inset-sm">
          <span className="text-muted">Tổng ca phỏng vấn</span>
          <span className="font-bold text-accent">{total}</span>
        </li>
        <li className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 shadow-inset-sm">
          <span className="text-muted">Đã xếp lịch</span>
          <span className="font-bold text-emerald-600">{scheduled}</span>
        </li>
        <li className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 shadow-inset-sm">
          <span className="text-muted">Chưa xếp người PV</span>
          <span className="font-bold text-rose-500">{missing}</span>
        </li>
      </ul>
    </section>
  );
}

export default DaySummaryCard;
