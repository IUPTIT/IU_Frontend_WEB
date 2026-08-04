import { useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import CampaignHeader from "./components/CampaignHeader";
import ApplicationFormStep from "./components/ApplicationFormStep";
import ReviewConfirmStep from "./components/ReviewConfirmStep";
import SuccessScreen from "./components/SuccessScreen";
import { ACTIVE_CAMPAIGN, CUSTOM_QUESTIONS } from "./mockData";
import { EMPTY_APPLICATION } from "./types";
import type { ApplicationForm } from "./types";
import "../../styles/landing.css";

type Step = "form" | "review" | "done";

// Mock mã hồ sơ — sau này backend sinh khi có endpoint recruitment
function generateApplicationCode() {
  const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `APP-2026F-${sequence}`;
}

function RecruitmentPage() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<ApplicationForm>(EMPTY_APPLICATION);
  const [applicationCode, setApplicationCode] = useState("");

  const handleFormSubmit = (value: ApplicationForm) => {
    setForm(value);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = () => {
    // TODO: gọi services/recruitmentService.submitApplication khi backend sẵn sàng
    setApplicationCode(generateApplicationCode());
    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-theme relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10">
        <LandingNavBar />

        <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {step !== "done" && <CampaignHeader campaign={ACTIVE_CAMPAIGN} />}

        <div className="mt-10">
          {step === "form" && (
            <ApplicationFormStep
              campaign={ACTIVE_CAMPAIGN}
              questions={CUSTOM_QUESTIONS}
              value={form}
              onSubmit={handleFormSubmit}
            />
          )}
          {step === "review" && (
            <ReviewConfirmStep
              form={form}
              questions={CUSTOM_QUESTIONS}
              onBack={() => setStep("form")}
              onConfirm={handleConfirm}
            />
          )}
          {step === "done" && <SuccessScreen applicationCode={applicationCode} email={form.email} />}
        </div>
        </main>
      </div>
    </div>
  );
}

export default RecruitmentPage;
