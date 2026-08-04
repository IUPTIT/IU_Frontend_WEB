import type { ApplicationForm } from "../types";
import type { PublicCampaign } from "../../../services/publicRecruitmentService";

type Props = {
  form: ApplicationForm;
  campaign: PublicCampaign;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-white/10 py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-[hsl(var(--landing-foreground)/0.55)]">{label}</span>
      <span className="text-right font-medium text-[hsl(var(--landing-foreground))]">{value || "—"}</span>
    </div>
  );
}

function ReviewConfirmStep({ form, campaign, submitting, error, onBack, onConfirm }: Props) {
  const questions = [...campaign.customQuestions].sort((a, b) => a.order - b.order);

  return (
    <div className="liquid-glass landing-card-solid rounded-3xl p-6 md:p-8">
      <h2 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
        Xác nhận thông tin trước khi gửi
      </h2>
      <p className="mt-1 text-sm text-[hsl(var(--landing-foreground)/0.6)]">
        Sau khi gửi, bạn chỉ có thể sửa hồ sơ khi đơn còn ở trạng thái "Chờ xét duyệt" và còn hạn nộp.
      </p>

      <div className="mt-6">
        <Row label="Họ và tên" value={form.fullName} />
        <Row label="MSSV" value={form.studentId} />
        <Row label="Lớp" value={form.className} />
        <Row label="Khoa/Ngành" value={form.faculty} />
        <Row label="Email" value={form.email} />
        <Row label="Số điện thoại" value={form.phone} />
        <Row label="Số CCCD" value={form.nationalId} />
        <Row label="Ngày sinh" value={form.dateOfBirth} />
        <Row label="Ảnh đại diện" value={form.avatar?.name ?? ""} />
        <Row label="CV" value={form.cv?.name ?? ""} />
        <Row label="Ban nguyện vọng" value={form.wishes.map((w, i) => `NV${i + 1}: ${w}`).join(" · ")} />
        {questions.map((q) => {
          const answer = form.answers[q._id];
          return <Row key={q._id} label={q.label} value={Array.isArray(answer) ? answer.join(", ") : (answer ?? "")} />;
        })}
      </div>

      {error && (
        <p className="mt-5 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
      )}

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <button
          onClick={onBack}
          disabled={submitting}
          className="landing-btn-secondary liquid-glass flex-1 rounded-full py-3 disabled:opacity-50"
        >
          ← Quay lại sửa
        </button>
        <button onClick={onConfirm} disabled={submitting} className="landing-btn-primary flex-1 py-3 disabled:opacity-60">
          {submitting ? "Đang gửi..." : "Gửi đơn chính thức"}
        </button>
      </div>
    </div>
  );
}

export default ReviewConfirmStep;
