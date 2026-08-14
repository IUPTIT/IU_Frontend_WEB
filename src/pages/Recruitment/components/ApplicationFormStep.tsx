import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Save } from "lucide-react";
import LandingSelect from "../../../components/LandingSelect";
import LandingDatePicker from "../../../components/LandingDatePicker";
import SectionCard from "./SectionCard";
import FileDropzone from "./FileDropzone";
import type { ApplicationForm } from "../types";
import type { PublicCampaign, PublicQuestion } from "../../../services/publicRecruitmentService";
import { validatePersonName, validatePhoneVN } from "../../../utils/validateContact";

type Props = {
  campaign: PublicCampaign;
  value: ApplicationForm;
  onSubmit: (form: ApplicationForm) => void;
  /** Lưu nháp — chỉ cần email hợp lệ, backend gửi link điền tiếp qua email */
  onSaveDraft: (form: ApplicationForm) => Promise<void>;
};

const MAX_WISHES = 3;
const MAX_CV_MB = 5;
const MAX_AVATAR_MB = 2;
const MIN_AGE = 16;

function validate(form: ApplicationForm, questions: PublicQuestion[]): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameErr = validatePersonName(form.fullName);
  if (nameErr) errors.fullName = nameErr;
  if (!form.studentId.trim()) errors.studentId = "Bắt buộc nhập MSSV";
  if (!form.className.trim()) errors.className = "Bắt buộc nhập lớp";
  if (!form.faculty.trim()) errors.faculty = "Bắt buộc nhập khoa/ngành";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email không đúng định dạng";
  const phoneErr = validatePhoneVN(form.phone);
  if (phoneErr) errors.phone = phoneErr;

  if (!form.dateOfBirth) {
    errors.dateOfBirth = "Bắt buộc chọn ngày sinh";
  } else {
    const dob = new Date(form.dateOfBirth);
    const now = new Date();
    if (dob.getTime() > now.getTime()) {
      errors.dateOfBirth = "Ngày sinh không được ở tương lai";
    } else {
      const age = (now.getTime() - dob.getTime()) / (365.25 * 86_400_000);
      if (age < MIN_AGE) errors.dateOfBirth = `Tuổi tối thiểu là ${MIN_AGE}`;
    }
  }

  if (!form.avatar) {
    errors.avatar = "Bắt buộc chọn ảnh đại diện";
  } else {
    if (!/\.(jpe?g|png)$/i.test(form.avatar.name)) errors.avatar = "Ảnh phải là JPG/PNG";
    else if (form.avatar.size > MAX_AVATAR_MB * 1024 * 1024) errors.avatar = `Ảnh tối đa ${MAX_AVATAR_MB}MB`;
  }

  if (!form.cv) {
    errors.cv = "Bắt buộc nộp CV";
  } else {
    if (!/\.(pdf|docx?)$/i.test(form.cv.name)) errors.cv = "CV phải là PDF/DOCX";
    else if (form.cv.size > MAX_CV_MB * 1024 * 1024) errors.cv = `CV tối đa ${MAX_CV_MB}MB`;
  }

  const wishes = form.wishes.filter(Boolean);
  if (wishes.length === 0) errors.wishes = "Chọn ít nhất 1 ban nguyện vọng";
  else if (new Set(wishes).size !== wishes.length) errors.wishes = "Các nguyện vọng không được trùng nhau";

  for (const q of questions) {
    if (!q.required) continue;
    const answer = form.answers[q._id];
    const empty = answer == null || (typeof answer === "string" ? !answer.trim() : answer.length === 0);
    if (empty) errors[q._id] = "Câu hỏi bắt buộc";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-400">{message}</p>;
}

function ApplicationFormStep({ campaign, value, onSubmit, onSaveDraft }: Props) {
  const [form, setForm] = useState<ApplicationForm>(value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingDraft, setSavingDraft] = useState(false);

  const teams = campaign.quotas.map((q) => q.team).filter(Boolean);
  const questions = [...campaign.customQuestions].sort((a, b) => a.order - b.order);

  const set = <K extends keyof ApplicationForm>(field: K, fieldValue: ApplicationForm[K]) =>
    setForm((f) => ({ ...f, [field]: fieldValue }));

  const setWish = (index: number, team: string) =>
    setForm((f) => {
      const wishes = [...f.wishes];
      wishes[index] = team;
      return { ...f, wishes };
    });

  /** Options từng NV: chỉ Ban của đợt, loại ban đã chọn ở NV khác */
  const optionsForWish = (index: number) => {
    const taken = new Set(
      form.wishes
        .map((w, i) => (i !== index && w ? w : null))
        .filter(Boolean) as string[],
    );
    return teams.filter((t) => !taken.has(t) || form.wishes[index] === t);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form, questions);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...form, wishes: form.wishes.filter(Boolean) });
    }
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. Thông tin cá nhân */}
      <SectionCard step="01" eyebrow="Về bạn" title="Thông tin cá nhân" delay={0.1}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Họ và tên *</label>
            <input className="landing-input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            <FieldError message={errors.fullName} />
          </div>
          <div>
            <label className={labelClass}>MSSV *</label>
            <input className="landing-input" value={form.studentId} onChange={(e) => set("studentId", e.target.value)} />
            <FieldError message={errors.studentId} />
          </div>
          <div>
            <label className={labelClass}>Lớp *</label>
            <input className="landing-input" value={form.className} onChange={(e) => set("className", e.target.value)} />
            <FieldError message={errors.className} />
          </div>
          <div>
            <label className={labelClass}>Khoa/Ngành *</label>
            <input className="landing-input" value={form.faculty} onChange={(e) => set("faculty", e.target.value)} />
            <FieldError message={errors.faculty} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input className="landing-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className={labelClass}>Số điện thoại *</label>
            <input className="landing-input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <FieldError message={errors.phone} />
          </div>
          <div>
            <label className={labelClass}>Ngày sinh *</label>
            <LandingDatePicker
              value={form.dateOfBirth}
              onChange={(iso) => set("dateOfBirth", iso)}
              maxDate={new Date()}
            />
            <FieldError message={errors.dateOfBirth} />
          </div>
        </div>
      </SectionCard>

      {/* 2. Hồ sơ đính kèm */}
      <SectionCard step="02" eyebrow="Minh chứng" title="Hồ sơ đính kèm" delay={0.18}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FileDropzone
              label="Ảnh đại diện"
              hint={`JPG/PNG · tối đa ${MAX_AVATAR_MB}MB`}
              accept=".jpg,.jpeg,.png"
              file={form.avatar}
              onChange={(f) => set("avatar", f)}
            />
            <FieldError message={errors.avatar} />
          </div>
          <div>
            <FileDropzone
              label="CV của bạn"
              hint={`PDF/DOCX · tối đa ${MAX_CV_MB}MB`}
              accept=".pdf,.doc,.docx"
              file={form.cv}
              onChange={(f) => set("cv", f)}
            />
            <FieldError message={errors.cv} />
          </div>
        </div>
      </SectionCard>

      {/* 3. Ban nguyện vọng — options = Ban trong chỉ tiêu đợt tuyển */}
      <SectionCard step="03" eyebrow="Định hướng" title="Ban nguyện vọng" delay={0.26}>
        <p className="mb-5 -mt-2 text-sm text-[hsl(var(--landing-foreground)/0.6)]">
          Chọn tối đa {MAX_WISHES} ban theo thứ tự ưu tiên — nguyện vọng 1 là ban bạn mong muốn nhất.
          Danh sách ban lấy từ chỉ tiêu đợt tuyển.
        </p>
        {teams.length === 0 ? (
          <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Đợt tuyển chưa cấu hình ban / chỉ tiêu — liên hệ Ban Chủ nhiệm.
          </p>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: Math.min(MAX_WISHES, teams.length) }, (_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl bg-white/[0.03] p-3 sm:flex-row sm:items-center"
              >
                <span className="reg-wish-badge shrink-0">NV{i + 1}</span>
                <div className="flex-1">
                  <LandingSelect
                    options={optionsForWish(i)}
                    value={form.wishes[i] ?? ""}
                    onChange={(team) => setWish(i, team)}
                    placeholder={i === 0 ? "— Chọn ban mong muốn nhất —" : "— Không chọn —"}
                    isClearable
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <FieldError message={errors.wishes} />
      </SectionCard>

      {/* 4. Câu hỏi của đợt tuyển */}
      {questions.length > 0 && (
        <SectionCard step="04" eyebrow="Hiểu bạn hơn" title="Câu hỏi của đợt tuyển" delay={0.34}>
          <div className="space-y-5">
            {questions.map((q) => (
              <div key={q._id}>
                <label className={labelClass}>
                  {q.label} {q.required && "*"}
                </label>
                {q.type === "short_text" && (
                  <input
                    className="landing-input"
                    value={(form.answers[q._id] as string) ?? ""}
                    onChange={(e) => set("answers", { ...form.answers, [q._id]: e.target.value })}
                  />
                )}
                {q.type === "long_text" && (
                  <textarea
                    className="landing-input min-h-28 resize-y"
                    value={(form.answers[q._id] as string) ?? ""}
                    onChange={(e) => set("answers", { ...form.answers, [q._id]: e.target.value })}
                  />
                )}
                {q.type === "single_choice" && (
                  <div className="flex flex-wrap gap-3">
                    {q.options?.map((option) => (
                      <label
                        key={option}
                        className={`landing-input w-auto cursor-pointer px-4 py-2 text-sm ${
                          form.answers[q._id] === option ? "!border-purple-400 !bg-purple-500/20" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={q._id}
                          className="sr-only"
                          checked={form.answers[q._id] === option}
                          onChange={() => set("answers", { ...form.answers, [q._id]: option })}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "multi_choice" && (
                  <div className="flex flex-wrap gap-3">
                    {q.options?.map((option) => {
                      const selected = ((form.answers[q._id] as string[]) ?? []).includes(option);
                      return (
                        <label
                          key={option}
                          className={`landing-input w-auto cursor-pointer px-4 py-2 text-sm ${
                            selected ? "!border-purple-400 !bg-purple-500/20" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selected}
                            onChange={() => {
                              const current = (form.answers[q._id] as string[]) ?? [];
                              const next = selected ? current.filter((o) => o !== option) : [...current, option];
                              set("answers", { ...form.answers, [q._id]: next });
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                )}
                <FieldError message={errors[q._id]} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div
        className="reg-rise flex flex-col gap-3 md:flex-row"
        style={{ animationDelay: "0.42s" }}
      >
        <button
          type="button"
          disabled={savingDraft}
          onClick={async () => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
              setErrors({ email: "Nhập email hợp lệ để nhận link điền tiếp" });
              return;
            }
            setErrors({});
            setSavingDraft(true);
            try {
              await onSaveDraft(form);
            } finally {
              setSavingDraft(false);
            }
          }}
          className="landing-btn-secondary liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 disabled:opacity-50 md:w-auto"
        >
          <Save size={17} />
          {savingDraft ? "Đang lưu nháp..." : "Lưu nháp — nhận link qua email"}
        </button>
        <button
          type="submit"
          className="landing-btn-primary inline-flex flex-1 items-center justify-center gap-2 py-3.5 text-lg"
        >
          Xem lại &amp; xác nhận
          <ArrowRight size={19} />
        </button>
      </div>
    </form>
  );
}

export default ApplicationFormStep;
