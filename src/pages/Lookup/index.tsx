import { useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LookupForm from "./components/LookupForm";
import ApplicationStatusCard from "./components/ApplicationStatusCard";
import { lookupApplication } from "./mockData";
import { ACTIVE_CAMPAIGN } from "../Recruitment/mockData";
import type { ApplicationRecord } from "./types";
import "../../styles/landing.css";

function LookupPage() {
  const [result, setResult] = useState<ApplicationRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (query: string) => {
    // TODO: thay bằng services/recruitmentService khi backend có endpoint tra cứu
    const found = lookupApplication(query);
    setResult(found ?? null);
    setNotFound(!found);
  };

  const handleWithdraw = () => {
    if (result) setResult({ ...result, status: "da_rut_don", note: "Bạn đã rút đơn ứng tuyển đợt này." });
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
            Nhập email đã dùng để nộp đơn hoặc mã hồ sơ trong email xác nhận để xem trạng thái ứng tuyển. Không cần đăng
            nhập.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <LookupForm onSearch={handleSearch} notFound={notFound} />
          {result && (
            <ApplicationStatusCard
              application={result}
              closeAt={ACTIVE_CAMPAIGN.closeAt}
              onWithdraw={handleWithdraw}
            />
          )}
        </div>
        </main>
      </div>
    </div>
  );
}

export default LookupPage;
