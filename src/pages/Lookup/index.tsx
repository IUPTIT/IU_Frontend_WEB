import { useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingFooter from "../../components/LandingFooter";
import LookupForm from "./components/LookupForm";
import ApplicationStatusCard from "./components/ApplicationStatusCard";
import EditApplicationForm from "./components/EditApplicationForm";
import { lookupApplication, withdrawApplication } from "../../services/publicRecruitmentService";
import type { PublicApplication } from "../../services/publicRecruitmentService";
import "../../styles/landing.css";
import { usePageMeta } from "../../hooks/usePageMeta";

function LookupPage() {
  usePageMeta(
    "Tra cứu hồ sơ ứng tuyển | IU Club — IU PTIT",
    "Tra cứu trạng thái hồ sơ ứng tuyển thành viên IU Club (IUPTIT) bằng mã hồ sơ hoặc email.",
    "/tra-cuu"
  );
  const [result, setResult] = useState<PublicApplication | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const handleSearch = async (query: string) => {
    setSearching(true);
    setNotFound(false);
    setWithdrawn(false);
    setWithdrawError(null);
    setEditing(false);
    try {
      setResult(await lookupApplication(query));
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleWithdraw = async () => {
    if (!result || withdrawing) return;
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      await withdrawApplication(result.code, result.email);
      setResult(null);
      setWithdrawn(true);
      setEditing(false);
    } catch (err) {
      setWithdrawError(
        err instanceof Error ? err.message : "Rút đơn thất bại — thử lại.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="landing-theme lp-home relative min-h-screen">
      <BackgroundVideo />
      <div className="lp-page-veil" />
      <div className="relative z-10">
        <LandingNavBar />

        <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="landing-headline text-3xl font-semibold text-[hsl(var(--landing-foreground))] sm:text-4xl md:text-5xl">
              Tra cứu hồ sơ
            </h1>
            <p className="mt-4 text-[hsl(var(--landing-foreground)/0.7)]">
              Nhập email đã dùng để nộp đơn hoặc mã hồ sơ trong email xác nhận để xem trạng thái ứng tuyển. Không cần
              đăng nhập.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <LookupForm onSearch={handleSearch} notFound={notFound} searching={searching} />
            {withdrawn && (
              <p className="liquid-glass landing-card-solid rounded-3xl p-6 text-center text-[hsl(var(--landing-foreground)/0.8)]">
                Đã rút đơn thành công — hồ sơ của bạn đã được xoá. Bạn có thể nộp đơn mới khi đợt tuyển còn mở.
              </p>
            )}
            {result && !editing && (
              <ApplicationStatusCard
                application={result}
                withdrawing={withdrawing}
                withdrawError={withdrawError}
                onWithdraw={handleWithdraw}
                onEdit={() => setEditing(true)}
              />
            )}
            {result && editing && (
              <EditApplicationForm
                application={result}
                onSaved={(app) => {
                  setResult(app);
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            )}
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

export default LookupPage;
