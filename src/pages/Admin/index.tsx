import StatsCards from "./components/StatsCards";
import RecruitmentFunnel from "./components/RecruitmentFunnel";
import SubmissionChart from "./components/SubmissionChart";
import ScoreChart from "./components/ScoreChart";
import TraineeDonut from "./components/TraineeDonut";
import ReviewBanner from "./components/ReviewBanner";
import {
  CURRENT_SEASON,
  statCards,
  recruitmentFunnel,
  weeklySubmissions,
  trainingScores,
  traineeDepartments,
  traineeTotal,
  pendingReview,
} from "./mockData";

function AdminPage() {
  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tổng quan Hoạt động
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Báo cáo tổng hợp Tuyển dụng &amp; Đào tạo đợt {CURRENT_SEASON}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="neu-btn cursor-default shadow-inset-sm hover:translate-y-0 hover:shadow-inset-sm">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="14" height="13" rx="2" />
              <path d="M3 8h14M7 2.5V5.5M13 2.5V5.5" strokeLinecap="round" />
            </svg>
            {CURRENT_SEASON}
          </span>
          <button className="neu-btn text-accent font-bold">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </section>

      <StatsCards cards={statCards} />

      <section className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <RecruitmentFunnel stages={recruitmentFunnel} />
        <SubmissionChart data={weeklySubmissions} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <ScoreChart data={trainingScores} />
        <TraineeDonut departments={traineeDepartments} total={traineeTotal} />
      </section>

      <ReviewBanner review={pendingReview} onAction={() => {}} />
    </>
  );
}

export default AdminPage;
