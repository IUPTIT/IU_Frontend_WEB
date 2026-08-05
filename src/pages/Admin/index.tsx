import { useMemo, useState } from "react";
import StatsCards from "./components/StatsCards";
import JourneyStrip from "./components/JourneyStrip";
import RecruitmentFunnel from "./components/RecruitmentFunnel";
import SubmissionChart from "./components/SubmissionChart";
import ScoreChart from "./components/ScoreChart";
import TraineeDonut from "./components/TraineeDonut";
import ReviewBanner from "./components/ReviewBanner";
import { DASHBOARD_SEASONS } from "./mockData";
import Button from "../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../components/ui/ExportDataModal";
import { usePortalUi } from "../../context/usePortalUi";
import { ROUTES } from "../../constants/routes";

type ReportRow = {
  id: string;
  section: string;
  metric: string;
  value: string;
  note: string;
};

function buildReportRows(seasonId: string): ReportRow[] {
  const season = DASHBOARD_SEASONS.find((s) => s.id === seasonId) ?? DASHBOARD_SEASONS[0];
  const rows: ReportRow[] = [];

  for (const card of season.statCards) {
    rows.push({
      id: `kpi-${card.id}`,
      section: "KPI",
      metric: card.label,
      value: `${card.value}${card.suffix ?? ""}`,
      note: card.badge ?? "",
    });
  }
  for (const stage of season.recruitmentFunnel) {
    rows.push({
      id: `funnel-${stage.id}`,
      section: "Phễu tuyển dụng",
      metric: stage.label,
      value: String(stage.value),
      note: `${stage.percent}%`,
    });
  }
  for (const w of season.weeklySubmissions) {
    rows.push({
      id: `week-${w.week}`,
      section: "Hồ sơ theo tuần",
      metric: w.week,
      value: String(w.received),
      note: `Qua đơn: ${w.passed}`,
    });
  }
  for (const d of season.traineeDepartments) {
    rows.push({
      id: `dept-${d.id}`,
      section: "Trainee theo ban",
      metric: d.label,
      value: `${d.percent}%`,
      note: `Tổng trainee: ${season.traineeTotal}`,
    });
  }

  return rows;
}

const REPORT_COLUMNS: ExportColumnDef<ReportRow>[] = [
  {
    id: "section",
    label: "Nhóm chỉ số",
    getValue: (r) => r.section,
    getFilterKey: (r) => r.section,
    filterOptions: [
      { value: "KPI", label: "KPI" },
      { value: "Phễu tuyển dụng", label: "Phễu tuyển dụng" },
      { value: "Hồ sơ theo tuần", label: "Hồ sơ theo tuần" },
      { value: "Trainee theo ban", label: "Trainee theo ban" },
    ],
    defaultSelected: true,
  },
  { id: "metric", label: "Chỉ số", getValue: (r) => r.metric, defaultSelected: true },
  { id: "value", label: "Giá trị", getValue: (r) => r.value, defaultSelected: true },
  { id: "note", label: "Ghi chú", getValue: (r) => r.note, defaultSelected: true },
];

function AdminPage() {
  const { navigate } = usePortalUi();
  const [seasonId, setSeasonId] = useState(DASHBOARD_SEASONS[0].id);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const season = useMemo(
    () => DASHBOARD_SEASONS.find((s) => s.id === seasonId) ?? DASHBOARD_SEASONS[0],
    [seasonId],
  );

  const reportRows = useMemo(() => buildReportRows(seasonId), [seasonId]);

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tổng quan Hoạt động
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Báo cáo tổng hợp Tuyển dụng &amp; Đào tạo đợt {season.label}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="relative">
            <span className="sr-only">Chọn đợt / mùa</span>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="neu-btn cursor-pointer appearance-none pr-10 shadow-inset-sm hover:translate-y-0 hover:shadow-inset-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {DASHBOARD_SEASONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>

          <Button
            variant="secondary"
            onClick={() => setExportOpen(true)}
            className="text-accent font-bold"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Xuất báo cáo
          </Button>
        </div>
      </section>

      {exportMsg && (
        <p className="rounded-2xl bg-accent-secondary/15 px-4 py-3 text-sm text-accent-secondary" role="status">
          {exportMsg}
        </p>
      )}

      <JourneyStrip
        stages={season.recruitmentFunnel}
        periodLabel={season.label}
        totalMembers={season.totalMembers}
      />

      <StatsCards cards={season.statCards} />

      <section className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <RecruitmentFunnel stages={season.recruitmentFunnel} />
        <SubmissionChart
          weeklyData={season.weeklySubmissions}
          dailyData={season.dailySubmissions}
          periodLabel={season.label}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <ScoreChart data={season.trainingScores} />
        <TraineeDonut departments={season.traineeDepartments} total={season.traineeTotal} />
      </section>

      <ReviewBanner
        review={season.pendingReview}
        onAction={() => navigate(ROUTES.admin.recruitment.interviews)}
      />

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất báo cáo tổng quan"
        description="Chọn cột và lọc nhóm chỉ số cần xuất:"
        columns={REPORT_COLUMNS}
        rows={reportRows}
        filenameBase={`bao_cao_${seasonId}`}
        onExported={(n) => {
          setExportMsg(`Đã tải xuống báo cáo ${season.label} (${n} dòng).`);
          window.setTimeout(() => setExportMsg(null), 2800);
        }}
      />
    </>
  );
}

export default AdminPage;
