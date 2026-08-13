import { useState } from "react";
import type { RecruitmentCampaign } from "../../../../../types/recruitment";
import CampaignWizardStepper from "./CampaignWizardStepper";
import CampaignGeneralStep from "./CampaignGeneralStep";
import CampaignFormBuilderStep from "./CampaignFormBuilderStep";
import CampaignPublishStep from "./CampaignPublishStep";
import type { CampaignDraft, WizardStepId } from "../wizard/types";
import { createEmptyDraft } from "../wizard/types";
import {
  findCampaignConflicts,
  formatConflictErrors,
} from "../wizard/campaignConflicts";

type Props = {
  onCancel: () => void;
  onPublished: (draft: CampaignDraft, mode: "draft" | "publish") => void;
  initialDraft?: CampaignDraft;
  locks?: { nameAndOpen?: boolean; questions?: boolean };
  existingCampaigns?: RecruitmentCampaign[];
  excludeCampaignId?: string | null;
};

function CampaignWizard({
  onCancel,
  onPublished,
  initialDraft,
  locks,
  existingCampaigns = [],
  excludeCampaignId = null,
}: Props) {
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

  const conflicts = findCampaignConflicts(draft, existingCampaigns, excludeCampaignId);
  const nameConflict = conflicts.find((c) => c.kind === "name") ?? null;
  const overlapConflict = conflicts.find((c) => c.kind === "overlap") ?? null;
  const conflictText = formatConflictErrors(conflicts);

  const setConflictsError = () => {
    if (!conflictText) return false;
    setError(conflictText);
    return true;
  };

  const validateStep1 = () => {
    const parts: string[] = [];
    if (!draft.name.trim()) parts.push("Vui lòng nhập tên đợt tuyển.");
    if (!draft.openAt || !draft.closeAt) {
      parts.push("Vui lòng chọn thời gian mở và đóng đơn.");
    } else if (draft.closeAt < draft.openAt) {
      parts.push("Ngày đóng đơn phải sau ngày mở đơn.");
    }
    if (draft.quotas.length === 0) {
      parts.push("Chưa có Ban CLB — tạo Ban trước khi đặt chỉ tiêu.");
    } else if (!draft.quotas.some((q) => q.quota > 0)) {
      parts.push("Cần ít nhất 1 ban có chỉ tiêu ≥ 1.");
    }
    // Báo đủ mọi conflict (tên + thời gian) cùng lúc
    for (const c of conflicts) parts.push(c.message);

    if (parts.length > 0) {
      setError(parts.join("\n"));
      return false;
    }
    return true;
  };

  const validateBeforePublishStep = () => {
    if (!validateStep1()) return false;
    if (setConflictsError()) return false;
    return true;
  };

  const handleNextFrom1 = () => {
    if (!validateStep1()) return;
    goStep(2);
  };

  const handleNextFrom2 = () => {
    if (!validateBeforePublishStep()) return;
    goStep(3);
  };

  const handleStepChange = (next: WizardStepId) => {
    if (next > 1 && !validateStep1()) return;
    if (next >= 3 && !validateBeforePublishStep()) return;
    goStep(next);
  };

  const handleSaveDraft = () => {
    if (nameConflict) {
      setError(nameConflict.message);
      return;
    }
    // Nháp: vẫn chặn nếu form cơ bản thiếu; overlap time chỉ chặn khi xuất bản
    const parts: string[] = [];
    if (!draft.name.trim()) parts.push("Vui lòng nhập tên đợt tuyển.");
    if (!draft.openAt || !draft.closeAt) {
      parts.push("Vui lòng chọn thời gian mở và đóng đơn.");
    } else if (draft.closeAt < draft.openAt) {
      parts.push("Ngày đóng đơn phải sau ngày mở đơn.");
    }
    if (draft.quotas.length === 0) {
      parts.push("Chưa có Ban CLB — tạo Ban trước khi đặt chỉ tiêu.");
    } else if (!draft.quotas.some((q) => q.quota > 0)) {
      parts.push("Cần ít nhất 1 ban có chỉ tiêu ≥ 1.");
    }
    if (nameConflict) parts.push(nameConflict.message);
    if (parts.length > 0) {
      setError(parts.join("\n"));
      return;
    }
    onPublished(draft, "draft");
  };

  const handlePublish = () => {
    if (!validateBeforePublishStep()) return;
    if (!draft.activateOnPublish) {
      setError('Bật "Kích hoạt ngay" để xuất bản, hoặc dùng Lưu nháp.');
      return;
    }
    onPublished(draft, "publish");
  };

  return (
    <div className="space-y-8">
      <div className="neu-card !py-5 !px-4 sticky top-20 z-[5] backdrop-blur bg-background/90">
        <CampaignWizardStepper current={step} onChange={handleStepChange} />
      </div>

      {error && (
        <div
          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 space-y-1 whitespace-pre-line"
          role="alert"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <CampaignGeneralStep
          draft={draft}
          onChange={patchDraft}
          onCancel={onCancel}
          onNext={handleNextFrom1}
          lockNameAndOpen={locks?.nameAndOpen}
          nameError={nameConflict?.message ?? null}
          timeError={overlapConflict?.message ?? null}
        />
      )}

      {step === 2 && (
        <CampaignFormBuilderStep
          draft={draft}
          onChange={patchDraft}
          onBack={() => goStep(1)}
          onNext={handleNextFrom2}
          onSaveDraft={handleSaveDraft}
          locked={locks?.questions}
        />
      )}

      {step === 3 && (
        <CampaignPublishStep
          draft={draft}
          onChange={patchDraft}
          onBack={() => goStep(2)}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          nameConflict={nameConflict?.message ?? null}
          overlapConflict={overlapConflict?.message ?? null}
        />
      )}
    </div>
  );
}

export default CampaignWizard;
