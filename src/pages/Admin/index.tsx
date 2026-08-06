import { useCallback, useEffect, useMemo, useState } from "react";
import StatsCards from "./components/StatsCards";
import RecruitmentFunnel from "./components/RecruitmentFunnel";
import SubmissionChart from "./components/SubmissionChart";
import ScoreChart from "./components/ScoreChart";
import TraineeDonut from "./components/TraineeDonut";
import ReviewBanner from "./components/ReviewBanner";
import Button from "../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../components/ui/ExportDataModal";
import { usePortalUi } from "../../context/usePortalUi";
import { ROUTES } from "../../constants/routes";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "../../services/dashboardService";

type ReportRow = {
  id: string;
  section: string;
  metric: string;
  value: string;
  note: string;
};

function buildReportRows(overview: DashboardOverview): ReportRow[] {
  const rows: ReportRow[] = [];

  for (const card of overview.statCards) {
    rows.push({
      id: `kpi-${card.id}`,
      section: "KPI",
      metric: card.label,
      value: String(card.value),
      note: card.badge ?? "",
    });
  }
  for (const stage of overview.recruitmentFunnel) {
    rows.push({
      id: `funnel-${stage.id}`,
      section: "Phễu tuyển dụng",
      metric: stage.label,
      value: String(stage.value),
      note: `${stage.percent}%`,
    });
  }
  for (const w of overview.weeklySubmissions) {
    rows.push({
      id: `week-${w.week}`,
      section: "Hồ sơ theo tuần",
      metric: w.week,
      value: String(w.received),
      note: `Qua đơn: ${w.passed}`,
    });
  }
  for (const d of overview.traineeDepartments) {
    rows.push({
      id: `dept-${d.id}`,
      section: "Trainee theo ban",
      metric: d.label,
      value: `${d.percent}%`,
      note: `Tổng trainee: ${overview.traineeTotal}`,
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
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await getDashboardOverview());
    } catch (err) {
      setOverview(null);
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được tổng quan hoạt động.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reportRows = useMemo(
    () => (overview ? buildReportRows(overview) : []),
    [overview],
  );

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" />;
  }

  if (!overview) {
    return (
      <section className="neu-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">Tổng quan</h1>
        <p className="text-muted text-sm">{error ?? "Không có dữ liệu."}</p>
        <Button variant="secondary" onClick={() => void load()}>
          Thử lại
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tổng quan Hoạt động
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Báo cáo tổng hợp Tuyển dụng &amp; Đào tạo — dữ liệu thật trên hệ
            thống ({overview.label}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => void load()}>
            Làm mới
          </Button>
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

      <StatsCards cards={overview.statCards} />

      <section className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <RecruitmentFunnel stages={overview.recruitmentFunnel} />
        <SubmissionChart
          weeklyData={overview.weeklySubmissions}
          dailyData={
            overview.dailySubmissions.length > 0
              ? overview.dailySubmissions
              : overview.weeklySubmissions
          }
          periodLabel={overview.label}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {overview.trainingScores.length > 0 ? (
          <ScoreChart data={overview.trainingScores} />
        ) : (
          <section className="neu-card !p-6 text-sm text-muted">
            Chưa có điểm training trung bình để vẽ biểu đồ.
          </section>
        )}
        <TraineeDonut
          departments={overview.traineeDepartments}
          total={overview.traineeTotal}
        />
      </section>

      <ReviewBanner
        review={overview.pendingReview}
        onAction={() => navigate(ROUTES.admin.recruitment.interviews)}
      />

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất báo cáo tổng quan"
        description="Chọn cột và lọc nhóm chỉ số cần xuất:"
        columns={REPORT_COLUMNS}
        rows={reportRows}
        filenameBase="bao_cao_tong_quan"
        onExported={(n) => {
          setExportMsg(`Đã tải xuống báo cáo (${n} dòng).`);
          window.setTimeout(() => setExportMsg(null), 2800);
        }}
      />
    </>
  );
}

export default AdminPage;
