import { useState } from "react";
import type { FormEvent } from "react";
import { editApplication, type PublicApplication } from "../../../services/publicRecruitmentService";
import {
  validatePersonName,
  validatePhoneVN,
} from "../../../utils/validateContact";

type Props = {
  application: PublicApplication;
  onSaved: (app: PublicApplication) => void;
  onCancel: () => void;
};

function EditApplicationForm({ application, onSaved, onCancel }: Props) {
  const [fullName, setFullName] = useState(application.fullName);
  const [studentId, setStudentId] = useState(application.studentId);
  const [className, setClassName] = useState(application.className);
  const [faculty, setFaculty] = useState(application.faculty);
  const [phone, setPhone] = useState(application.phone);
  const [dateOfBirth, setDateOfBirth] = useState(
    application.dateOfBirth ? application.dateOfBirth.slice(0, 10) : "",
  );
  const [wishes, setWishes] = useState(application.wishes.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameErr = validatePersonName(fullName);
    if (nameErr) {
      setError(nameErr);
      return;
    }
    const phoneErr = validatePhoneVN(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    setSaving(true);
    try {
      const updated = await editApplication(application.code, {
        email: application.email,
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        className: className.trim(),
        faculty: faculty.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || undefined,
        wishes: wishes
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean)
          .slice(0, 3),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "mb-1.5 block text-sm font-medium text-[hsl(var(--landing-foreground)/0.8)]";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="liquid-glass landing-card-solid space-y-4 rounded-3xl p-6 md:p-8">
      <h3 className="landing-headline text-lg font-semibold text-[hsl(var(--landing-foreground))]">
        Sửa hồ sơ trước hạn
      </h3>
      <p className="text-sm text-[hsl(var(--landing-foreground)/0.55)]">
        Chỉ sửa được khi đơn còn Chờ xét duyệt, còn hạn nộp và chưa được BCN chấm điểm.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Họ và tên</label>
          <input className="landing-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>MSSV</label>
          <input className="landing-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Lớp</label>
          <input className="landing-input" value={className} onChange={(e) => setClassName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Khoa/Ngành</label>
          <input className="landing-input" value={faculty} onChange={(e) => setFaculty(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Số điện thoại</label>
          <input className="landing-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Ngày sinh</label>
          <input
            type="date"
            className="landing-input"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Ban nguyện vọng (cách nhau bởi dấu phẩy, tối đa 3)</label>
        <input className="landing-input" value={wishes} onChange={(e) => setWishes(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="landing-btn-primary flex-1 rounded-full py-3 font-medium disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button type="button" onClick={onCancel} className="landing-btn-secondary liquid-glass rounded-full px-6">
          Huỷ
        </button>
      </div>
    </form>
  );
}

export default EditApplicationForm;
