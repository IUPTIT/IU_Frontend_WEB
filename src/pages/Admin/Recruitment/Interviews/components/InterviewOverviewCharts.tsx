type Props = {
  /** Thống kê toàn đợt (Pass CV) */
  totalCandidates: number;
  bookedCandidates: number;
  unbookedCandidates: number;
  /** Thống kê ca */
  totalSlots: number;
  slotsWithInterviewers: number;
  slotsMissingInterviewers: number;
  /** Chỗ trống / đã đặt trên mọi ca */
  capacityTotal: number;
  bookedSeats: number;
};

function Donut({
  value,
  max,
  color,
  track = "rgba(124,58,237,0.12)",
}: {
  value: number;
  max: number;
  color: string;
  track?: string;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = pct * c;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 50 50)"
        className="transition-all duration-700 ease-out"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#191A2C] text-[18px] font-bold"
        style={{ fontSize: 18, fontWeight: 800 }}
      >
        {max > 0 ? Math.round(pct * 100) : 0}%
      </text>
    </svg>
  );
}

function StatBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#6B7086]">{label}</span>
        <span className="font-bold text-[#191A2C]">
          {value}/{total || 0}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#EDE9FE]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Overview lung linh — donut + thanh tiến độ cho trang Lịch PV.
 */
function InterviewOverviewCharts({
  totalCandidates,
  bookedCandidates,
  unbookedCandidates,
  totalSlots,
  slotsWithInterviewers,
  slotsMissingInterviewers,
  capacityTotal,
  bookedSeats,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="relative overflow-hidden rounded-2xl border border-[#E8EAF2] bg-white p-5 shadow-[0_12px_40px_rgba(88,28,135,0.08)]">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
          style={{ background: "linear-gradient(135deg,#A855F7,#E0348C)" }}
          aria-hidden
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9AA0B4]">
          Ứng viên Pass CV
        </p>
        <div className="mt-3 flex items-center gap-4">
          <Donut value={bookedCandidates} max={totalCandidates} color="#7C3AED" />
          <div className="min-w-0 space-y-2">
            <p className="font-grotesk text-3xl font-extrabold text-[#191A2C]">
              {totalCandidates}
            </p>
            <p className="text-xs text-[#6B7086]">
              <span className="font-semibold text-emerald-600">
                {bookedCandidates} đã đặt ca
              </span>
              {" · "}
              <span className="font-semibold text-amber-600">
                {unbookedCandidates} chưa đặt
              </span>
            </p>
          </div>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-2xl border border-[#E8EAF2] bg-white p-5 shadow-[0_12px_40px_rgba(88,28,135,0.08)]">
        <div
          className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full opacity-30 blur-2xl"
          style={{ background: "#34D399" }}
          aria-hidden
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9AA0B4]">
          Chỗ trong các ca
        </p>
        <div className="mt-4 space-y-3">
          <StatBar
            label="Đã đặt / sức chứa"
            value={bookedSeats}
            total={capacityTotal}
            color="linear-gradient(90deg,#6E2CE6,#A855F7)"
          />
          <StatBar
            label="Ca đã có người PV"
            value={slotsWithInterviewers}
            total={totalSlots}
            color="linear-gradient(90deg,#10B981,#34D399)"
          />
          <p className="text-xs text-[#6B7086]">
            {slotsMissingInterviewers > 0 ? (
              <span className="font-semibold text-rose-500">
                {slotsMissingInterviewers} ca thiếu người PV
              </span>
            ) : (
              <span className="font-semibold text-emerald-600">
                Mọi ca đã có người PV
              </span>
            )}
          </p>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-2xl border border-[#E8EAF2] bg-gradient-to-br from-[#F8F4FF] via-white to-[#FFF5FB] p-5 shadow-[0_12px_40px_rgba(88,28,135,0.08)] sm:col-span-2 xl:col-span-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9AA0B4]">
          Phân bố nhanh
        </p>
        <div className="mt-4 flex h-28 items-end justify-around gap-2 px-2">
          {[
            {
              label: "Đã ĐK ca",
              n: bookedCandidates,
              max: Math.max(totalCandidates, 1),
              fill: "linear-gradient(180deg,#A855F7,#6E2CE6)",
            },
            {
              label: "Chưa ĐK",
              n: unbookedCandidates,
              max: Math.max(totalCandidates, 1),
              fill: "linear-gradient(180deg,#FBBF24,#F59E0B)",
            },
            {
              label: "Ca PV",
              n: totalSlots,
              max: Math.max(totalSlots, capacityTotal || 1, 1),
              fill: "linear-gradient(180deg,#34D399,#059669)",
            },
            {
              label: "Chỗ trống",
              n: Math.max(0, capacityTotal - bookedSeats),
              max: Math.max(capacityTotal, 1),
              fill: "linear-gradient(180deg,#C4B5FD,#818CF8)",
            },
          ].map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#191A2C]">{b.n}</span>
              <div className="flex h-16 w-full max-w-[40px] items-end rounded-t-lg bg-[#F1E9FE]/50">
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${Math.max(8, (b.n / b.max) * 100)}%`,
                    background: b.fill,
                  }}
                />
              </div>
              <span className="text-center text-[10px] font-semibold text-[#9AA0B4]">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default InterviewOverviewCharts;
