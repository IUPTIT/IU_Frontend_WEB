import { useState } from "react";
import CampaignWizardStepper from "./CampaignWizardStepper";
import CampaignGeneralStep from "./CampaignGeneralStep";
import CampaignFormBuilderStep from "./CampaignFormBuilderStep";
import CampaignPublishStep from "./CampaignPublishStep";
import type { CampaignDraft, WizardStepId } from "../wizard/types";
import { createEmptyDraft } from "../wizard/types";

type Props = {
  onCancel: () => void;
  onPublished: (draft: CampaignDraft, mode: "draft" | "publish") => void;
  /** Sửa đợt tuyển có sẵn — prefill draft thay vì form trống */
  initialDraft?: CampaignDraft;
  /** Các phần bị khoá khi sửa (đợt đã publish / đã có hồ sơ) */
  locks?: { nameAndOpen?: boolean; questions?: boolean };
};

function CampaignWizard({ onCancel, onPublished, initialDraft, locks }: Props) {
  const [step, setStep] = useState<WizardStepId>(1);
  const [draft, setDraft] = useState<CampaignDraft>(() => initialDraft ?? createEmptyDraft());
  const [error, setError] = useState<string | null>(null);

  const patchDraft = (patch: Partial<CampaignDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const goStep = (next: WizardStepId) => {
    setError(null);
    setStep(next);
  };

  const validateStep1 = () => {
    if (!draft.name.trim()) {
      setError("Vui lòng nhập tên đợt tuyển.");
      return false;
    }
    if (!draft.openAt || !draft.closeAt) {
      setError("Vui lòng chọn thời gian mở và đóng đơn.");
      return false;
    }
    if (draft.closeAt < draft.openAt) {
      setError("Ngày đóng đơn phải sau ngày mở đơn.");
      return false;
    }
    return true;
  };

  const handleNextFrom1 = () => {
    if (!validateStep1()) return;
    goStep(2);
  };

  const handleStepChange = (next: WizardStepId) => {
    if (next > 1 && !validateStep1()) return;
    goStep(next);
  };

  return (
    <div className="space-y-8">
      {/* Stepper cố định */}
      <div className="neu-card !py-5 !px-4 sticky top-20 z-[5] backdrop-blur bg-background/90">
        <CampaignWizardStepper current={step} onChange={handleStepChange} />
      </div>

      {error && (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <CampaignGeneralStep
          draft={draft}
          onChange={patchDraft}
          onCancel={onCancel}
          onNext={handleNextFrom1}
          lockNameAndOpen={locks?.nameAndOpen}
        />
      )}

      {step === 2 && (
        <CampaignFormBuilderStep
          draft={draft}
          onChange={patchDraft}
          onBack={() => goStep(1)}
          onNext={() => goStep(3)}
          onSaveDraft={() => onPublished(draft, "draft")}
          locked={locks?.questions}
        />
      )}

      {step === 3 && (
        <CampaignPublishStep
          draft={draft}
          onChange={patchDraft}
          onBack={() => goStep(2)}
          onSaveDraft={() => onPublished(draft, "draft")}
          onPublish={() => onPublished(draft, "publish")}
        />
      )}
    </div>
  );
}

export default CampaignWizard;
