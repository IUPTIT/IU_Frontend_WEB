import { useEffect, useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingFooter from "../../components/LandingFooter";
import CampaignHeader from "./components/CampaignHeader";
import ApplicationFormStep from "./components/ApplicationFormStep";
import ReviewConfirmStep from "./components/ReviewConfirmStep";
import SuccessScreen from "./components/SuccessScreen";
import { getActiveCampaign, submitApplication } from "../../services/publicRecruitmentService";
import type { PublicCampaign } from "../../services/publicRecruitmentService";
import { EMPTY_APPLICATION } from "./types";
import type { ApplicationForm } from "./types";
import "../../styles/landing.css";

type Step = "form" | "review" | "done";

function RecruitmentPage() {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<ApplicationForm>(EMPTY_APPLICATION);
  const [applicationCode, setApplicationCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getActiveCampaign()
      .then(setCampaign)
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, []);

  const handleFormSubmit = (value: ApplicationForm) => {
    setForm(value);
    setSubmitError(null);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = async () => {
    if (!campaign || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const application = await submitApplication({
        fullName: form.fullName,
        studentId: form.studentId,
        className: form.className,
        faculty: form.faculty,
        email: form.email,
        phone: form.phone,
        nationalId: form.nationalId,
        dateOfBirth: form.dateOfBirth,
        // TODO: upload file thật khi backend có endpoint upload — tạm gửi tên file
        avatarUrl: form.avatar?.name ?? "",
        cvUrl: form.cv?.name ?? "",
        wishes: form.wishes.filter(Boolean),
        answers: form.answers,
      });
      setApplicationCode(application.code);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gửi đơn thất bại — thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-theme relative min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10">
        <LandingNavBar />

        <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
          {loading ? (
            <p className="py-20 text-center text-[hsl(var(--landing-foreground)/0.6)]">
              Đang tải đợt tuyển...
            </p>
          ) : !campaign ? (
            <div className="liquid-glass landing-card-solid mx-auto max-w-xl rounded-3xl p-10 text-center">
              <h1 className="landing-headline text-3xl font-semibold text-[hsl(var(--landing-foreground))]">
                Chưa có đợt tuyển nào đang mở
              </h1>
              <p className="mt-4 text-[hsl(var(--landing-foreground)/0.7)]">
                Theo dõi fanpage IU Club để nhận thông báo khi đợt tuyển thành viên tiếp theo bắt đầu nhé!
              </p>
            </div>
          ) : (
            <>
              {step !== "done" && <CampaignHeader campaign={campaign} />}

              <div className="mt-10">
                {step === "form" && Date.now() < new Date(campaign.openAt).getTime() ? (
                  <div className="liquid-glass landing-card-solid mx-auto max-w-xl rounded-3xl p-8 text-center">
                    <p className="text-[hsl(var(--landing-foreground)/0.75)]">
                      Đợt tuyển chưa mở đơn — quay lại khi đến thời gian mở đơn nhé!
                    </p>
                  </div>
                ) : step === "form" && (
                  <ApplicationFormStep
                    campaign={campaign}
                    value={form}
                    onSubmit={handleFormSubmit}
                  />
                )}
                {step === "review" && (
                  <ReviewConfirmStep
                    form={form}
                    campaign={campaign}
                    submitting={submitting}
                    error={submitError}
                    onBack={() => setStep("form")}
                    onConfirm={handleConfirm}
                  />
                )}
                {step === "done" && <SuccessScreen applicationCode={applicationCode} email={form.email} />}
              </div>
            </>
          )}
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

export default RecruitmentPage;
