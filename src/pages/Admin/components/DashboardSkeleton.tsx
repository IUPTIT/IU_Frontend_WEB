/** Khung skeleton cho trang Tổng quan — khớp bố cục thật (header, journey,
 *  4 thẻ KPI, 2 hàng biểu đồ) để lúc tải/làm mới trông mượt, không giật layout. */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Đang tải tổng quan">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-64 max-w-full rounded-2xl bg-foreground/[0.07]" />
          <div className="h-4 w-80 max-w-full rounded-full bg-foreground/[0.05]" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 w-28 rounded-2xl bg-foreground/[0.06]" />
          <div className="h-11 w-32 rounded-2xl bg-foreground/[0.06]" />
        </div>
      </div>

      {/* Journey strip */}
      <div className="ui-card h-40" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ui-card !p-5">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-foreground/[0.07]" />
              <div className="h-2 w-2 rounded-full bg-foreground/[0.07]" />
            </div>
            <div className="mt-4 h-8 w-16 rounded-lg bg-foreground/[0.07]" />
            <div className="mt-2 h-3.5 w-24 rounded-full bg-foreground/[0.05]" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="ui-card h-72" />
        <div className="ui-card h-72" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="ui-card h-64" />
        <div className="ui-card h-64" />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
