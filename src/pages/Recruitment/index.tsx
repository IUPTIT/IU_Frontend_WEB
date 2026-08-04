import { useEffect, useState } from "react";
import LandingNavBar from "../../components/LandingNavBar";
import BackgroundVideo from "../../components/LandingBackgroundVideo";
import LandingFooter from "../../components/LandingFooter";
import CampaignHeader from "./components/CampaignHeader";
import ApplicationFormStep from "./components/ApplicationFormStep";
import ReviewConfirmStep from "./components/ReviewConfirmStep";
import SuccessScreen from "./components/SuccessScreen";
import {
  getActiveCampaign,
  getDraft,
  saveDraft,
  submitApplication,
  uploadRecruitmentFile,
} from "../../services/publicRecruitmentService";
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
  // Token đơn nháp từ link email (?token=...) — có token thì submit tiếp từ nháp
  const [draftToken, setDraftToken] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    void (async () => {
      try {
        const active = await getActiveCampaign();
        setCampaign(active);
        if (token) {
          try {
            const draft = await getDraft(token);
            setDraftToken(token);
            setForm((f) => ({
              ...f,
              fullName: draft.fullName,
              studentId: draft.studentId,
              className: draft.className,
              faculty: draft.faculty,
              email: draft.email,
              phone: draft.phone,
              dateOfBirth: draft.dateOfBirth,
              wishes: draft.wishes.length ? draft.wishes : f.wishes,
              answers: draft.answers,
            }));
            setDraftNotice("Đã khôi phục đơn nháp của bạn — điền tiếp và nộp trước hạn nhé. Ảnh và CV cần chọn lại.");
          } catch {
            setDraftNotice("Link đơn nháp không hợp lệ hoặc đã hết hạn — bạn có thể điền đơn mới.");
          }
        }
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveDraft = async (value: ApplicationForm) => {
    if (!campaign) return;
    setForm(value);
    try {
      await saveDraft({
        campaignId: campaign.id,
        email: value.email,
        fullName: value.fullName,
        studentId: value.studentId,
        className: value.className,
        faculty: value.faculty,
        phone: value.phone,
        dateOfBirth: value.dateOfBirth,
        wishes: value.wishes,
        answers: value.answers,
      });
      setDraftNotice("Đã lưu nháp — link tiếp tục điền đã được gửi tới email của bạn.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setDraftNotice(err instanceof Error ? err.message : "Lưu nháp thất bại — thử lại sau.");
    }
  };

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
      // Upload ảnh + CV lên Cloudinary trước, lấy URL thật đính vào hồ sơ
      const [avatarUrl, cvUrl] = await Promise.all([
        form.avatar ? uploadRecruitmentFile("avatar", form.avatar) : Promise.resolve(""),
        form.cv ? uploadRecruitmentFile("cv", form.cv) : Promise.resolve(""),
      ]);

      const application = await submitApplication(
        {
          campaignId: campaign.id,
          fullName: form.fullName,
          studentId: form.studentId,
          className: form.className,
          faculty: form.faculty,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          avatarUrl,
          cvUrl,
          wishes: form.wishes.filter(Boolean),
          answers: form.answers,
        },
        draftToken ?? undefined,
      );
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

              {draftNotice && step === "form" && (
                <p
                  className="liquid-glass landing-card-solid mt-6 rounded-2xl p-4 text-center text-sm text-[hsl(var(--landing-foreground)/0.85)]"
                  role="status"
                >
                  {draftNotice}
                </p>
              )}

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
                    onSaveDraft={handleSaveDraft}
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
