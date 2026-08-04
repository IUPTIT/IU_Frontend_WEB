import { useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingFooter from "../../components/LandingFooter";
import LookupForm from "./components/LookupForm";
import ApplicationStatusCard from "./components/ApplicationStatusCard";
import { lookupApplication, withdrawApplication } from "../../services/publicRecruitmentService";
import type { PublicApplication } from "../../services/publicRecruitmentService";
import "../../styles/landing.css";

function LookupPage() {
  const [result, setResult] = useState<PublicApplication | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleSearch = async (query: string) => {
    setSearching(true);
    setNotFound(false);
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
    try {
      setResult(await withdrawApplication(result.code, result.email));
    } catch {
      // giữ nguyên kết quả cũ nếu rút thất bại
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="landing-theme relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10">
        <LandingNavBar />

        <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="landing-headline text-4xl font-semibold text-[hsl(var(--landing-foreground))] md:text-5xl">
              Tra cứu hồ sơ
            </h1>
            <p className="mt-4 text-[hsl(var(--landing-foreground)/0.7)]">
              Nhập email đã dùng để nộp đơn hoặc mã hồ sơ trong email xác nhận để xem trạng thái ứng tuyển. Không cần
              đăng nhập.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <LookupForm onSearch={handleSearch} notFound={notFound} searching={searching} />
            {result && (
              <ApplicationStatusCard application={result} withdrawing={withdrawing} onWithdraw={handleWithdraw} />
            )}
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

export default LookupPage;
