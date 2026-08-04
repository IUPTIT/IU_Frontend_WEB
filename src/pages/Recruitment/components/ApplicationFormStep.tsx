import { useState } from "react";
import type { FormEvent } from "react";
import LandingSelect from "../../../components/LandingSelect";
import LandingDatePicker from "../../../components/LandingDatePicker";
import type { ApplicationForm } from "../types";
import type { PublicCampaign, PublicQuestion } from "../../../services/publicRecruitmentService";

type Props = {
  campaign: PublicCampaign;
  value: ApplicationForm;
  onSubmit: (form: ApplicationForm) => void;
};

const MAX_WISHES = 3;
const MAX_CV_MB = 5;
const MAX_AVATAR_MB = 2;
const MIN_AGE = 16;

function validate(form: ApplicationForm, questions: PublicQuestion[]): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.fullName.trim()) errors.fullName = "Bắt buộc nhập họ và tên";
  if (!form.studentId.trim()) errors.studentId = "Bắt buộc nhập MSSV";
  if (!form.className.trim()) errors.className = "Bắt buộc nhập lớp";
  if (!form.faculty.trim()) errors.faculty = "Bắt buộc nhập khoa/ngành";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email không đúng định dạng";
  if (!/^0\d{9}$/.test(form.phone)) errors.phone = "Số điện thoại phải đủ 10 số";

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

function ApplicationFormStep({ campaign, value, onSubmit }: Props) {
  const [form, setForm] = useState<ApplicationForm>(value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const teams = campaign.quotas.map((q) => q.team);
  const questions = [...campaign.customQuestions].sort((a, b) => a.order - b.order);

  const set = <K extends keyof ApplicationForm>(field: K, fieldValue: ApplicationForm[K]) =>
    setForm((f) => ({ ...f, [field]: fieldValue }));

  const setWish = (index: number, team: string) =>
    setForm((f) => {
      const wishes = [...f.wishes];
      wishes[index] = team;
      return { ...f, wishes };
    });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form, questions);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...form, wishes: form.wishes.filter(Boolean) });
    }
  };

  const sectionClass = "liquid-glass landing-card-solid rounded-3xl p-6 md:p-8";
  const labelClass = "mb-1.5 block text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. Thông tin cá nhân */}
      <section className={sectionClass}>
        <h2 className="landing-headline mb-5 text-xl font-semibold text-[hsl(var(--landing-foreground))]">
          1. Thông tin cá nhân
        </h2>
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
      </section>

      {/* 2. Hồ sơ */}
      <section className={sectionClass}>
        <h2 className="landing-headline mb-5 text-xl font-semibold text-[hsl(var(--landing-foreground))]">
          2. Hồ sơ đính kèm
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Ảnh đại diện * (JPG/PNG, tối đa {MAX_AVATAR_MB}MB)</label>
            <input
              className="landing-input file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-[hsl(var(--landing-foreground))]"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => set("avatar", e.target.files?.[0] ?? null)}
            />
            <FieldError message={errors.avatar} />
          </div>
          <div>
            <label className={labelClass}>CV * (PDF/DOCX, tối đa {MAX_CV_MB}MB)</label>
            <input
              className="landing-input file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-[hsl(var(--landing-foreground))]"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => set("cv", e.target.files?.[0] ?? null)}
            />
            <FieldError message={errors.cv} />
          </div>
        </div>
      </section>

      {/* 3. Ban nguyện vọng */}
      <section className={sectionClass}>
        <h2 className="landing-headline mb-2 text-xl font-semibold text-[hsl(var(--landing-foreground))]">
          3. Ban nguyện vọng
        </h2>
        <p className="mb-5 text-sm text-[hsl(var(--landing-foreground)/0.6)]">
          Chọn tối đa {MAX_WISHES} ban theo thứ tự ưu tiên — nguyện vọng 1 là ban bạn mong muốn nhất.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: MAX_WISHES }, (_, i) => (
            <div key={i}>
              <label className={labelClass}>
                Nguyện vọng {i + 1} {i === 0 ? "*" : "(tuỳ chọn)"}
              </label>
              <LandingSelect
                options={teams}
                value={form.wishes[i] ?? ""}
                onChange={(team) => setWish(i, team)}
                placeholder="— Không chọn —"
                isClearable
              />
            </div>
          ))}
        </div>
        <FieldError message={errors.wishes} />
      </section>

      {/* 4. Câu hỏi của đợt tuyển */}
      <section className={sectionClass}>
        <h2 className="landing-headline mb-5 text-xl font-semibold text-[hsl(var(--landing-foreground))]">
          4. Câu hỏi của đợt tuyển
        </h2>
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
      </section>

      <button type="submit" className="landing-btn-primary w-full py-3.5 text-lg">
        Xem lại & xác nhận
      </button>
    </form>
  );
}

export default ApplicationFormStep;
