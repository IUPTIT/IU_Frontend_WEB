import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import {
  assignMemberToDepartment,
  removeMemberFromDepartment,
} from "../../../../services/departmentsService";
import {
  createClubMember,
  setClubMemberStatus,
  updateClubMember,
} from "../../../../services/membersService";
import type { ClubDepartment } from "../../../../types/departments";
import type { ClubMember, ClubMemberStatus } from "../../../../types/members";
import {
  validatePersonName,
  validatePhoneVN,
} from "../../../../utils/validateContact";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  departments: ClubDepartment[];
  /** null = thêm mới */
  member: ClubMember | null;
};

const STATUS_OPTIONS: { value: ClubMemberStatus; label: string }[] = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "alumni", label: "Cựu thành viên" },
];

/** Modal hiện mật khẩu tạm để admin copy sau khi tạo thành viên */
function TempPasswordModal({
  open,
  email,
  tempPassword,
  onClose,
}: {
  open: boolean;
  email: string;
  tempPassword: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tài khoản đã được tạo"
      size="sm"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đã hiểu, đóng
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-violet-500/10 p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-500">
            <KeyRound className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Email chào mừng đã được gửi tới
            </p>
            <p className="text-sm text-muted break-all">{email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Mật khẩu tạm thời (backup)
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 font-mono text-base tracking-widest text-[var(--color-text)]">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] transition-colors hover:border-violet-500 hover:text-violet-500"
              aria-label="Sao chép mật khẩu"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Thành viên sẽ được yêu cầu <strong>đổi mật khẩu ngay</strong> khi đăng nhập lần đầu.
            Dùng mật khẩu này làm backup nếu email không tới.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function MemberFormModal({
  open,
  onClose,
  onSaved,
  departments,
  member,
}: Props) {
  const isEdit = Boolean(member);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [generation, setGeneration] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<ClubMemberStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Mật khẩu tạm — hiện sau khi tạo thành viên mới
  const [tempInfo, setTempInfo] = useState<{ email: string; password: string } | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFullName(member?.fullName ?? "");
      setEmail(member?.email ?? "");
      setPhone(member?.phone ?? "");
      setStudentId(member?.studentId ?? "");
      setGeneration(member?.generation ?? "");
      setDepartmentId(member?.departmentId ?? "");
      setStatus(member?.status ?? "active");
      setError(null);
      setSaving(false);
    }
  }

  const activeDepts = departments.filter((d) => d.status === "active");

  const handleSave = async () => {
    const nameErr = validatePersonName(fullName);
    if (nameErr) {
      setError(nameErr);
      return;
    }
    if (!isEdit && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    const phoneErr = validatePhoneVN(phone, { emptyOk: true });
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    const dept = activeDepts.find((d) => d.id === departmentId);

    setSaving(true);
    setError(null);
    try {
      if (isEdit && member) {
        await updateClubMember(member.id, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          studentId: studentId.trim(),
          generation: generation.trim(),
        });
        if (status !== member.status) {
          await setClubMemberStatus(member.id, status);
        }
        const prevDept = member.departmentId || "";
        const nextDept = departmentId || "";
        if (prevDept !== nextDept) {
          if (nextDept) {
            await assignMemberToDepartment(member.id, nextDept, {
              reason: "Cập nhật Ban từ Quản lý thành viên",
            });
          } else if (prevDept) {
            await removeMemberFromDepartment(
              member.id,
              "Gỡ Ban từ Quản lý thành viên",
            );
          }
        }
        onSaved();
        onClose();
      } else {
        const { tempPassword } = await createClubMember({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          role: "member",
          departmentId: dept?.id,
          departmentName: dept?.name,
          studentId: studentId.trim() || undefined,
          generation: generation.trim() || undefined,
        });
        onSaved();
        onClose();
        // Hiện modal mật khẩu tạm sau khi đóng form
        setTempInfo({ email: email.trim().toLowerCase(), password: tempPassword });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được thành viên.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => !saving && onClose()}
        title={isEdit ? "Sửa thành viên" : "Thêm thành viên"}
        description={
          isEdit
            ? "Cập nhật thông tin hồ sơ. Email không đổi được tại đây."
            : "Tạo Member chính thức. Mật khẩu tạm sẽ được gửi qua email cho thành viên."
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" disabled={saving} onClick={onClose}>
              Huỷ
            </Button>
            <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Họ tên *
            </span>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoFocus
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Email *
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              disabled={isEdit}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                SĐT
              </span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0xxxxxxxxx"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                MSSV
              </span>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="B24DCCC000"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Lớp
              </span>
              <Input
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                placeholder="D24CQCC01-B"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Ban
              </span>
              <Select
                value={departmentId}
                onChange={setDepartmentId}
                options={[
                  { value: "", label: "Chưa phân Ban" },
                  ...activeDepts.map((d) => ({ value: d.id, label: d.name })),
                ]}
              />
            </label>
          </div>
          {isEdit && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Trạng thái
              </span>
              <Select
                value={status}
                onChange={(v) => setStatus(v as ClubMemberStatus)}
                options={STATUS_OPTIONS}
              />
            </label>
          )}
        </div>
      </Modal>

      {tempInfo && (
        <TempPasswordModal
          open={Boolean(tempInfo)}
          email={tempInfo.email}
          tempPassword={tempInfo.password}
          onClose={() => setTempInfo(null)}
        />
      )}
    </>
  );
}

export default MemberFormModal;


type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  departments: ClubDepartment[];
  /** null = thêm mới */
  member: ClubMember | null;
};

const STATUS_OPTIONS: { value: ClubMemberStatus; label: string }[] = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "alumni", label: "Cựu thành viên" },
];

function MemberFormModal({
  open,
  onClose,
  onSaved,
  departments,
  member,
}: Props) {
  const isEdit = Boolean(member);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [generation, setGeneration] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<ClubMemberStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFullName(member?.fullName ?? "");
      setEmail(member?.email ?? "");
      setPhone(member?.phone ?? "");
      setStudentId(member?.studentId ?? "");
      setGeneration(member?.generation ?? "");
      setDepartmentId(member?.departmentId ?? "");
      setStatus(member?.status ?? "active");
      setError(null);
      setSaving(false);
    }
  }

  const activeDepts = departments.filter((d) => d.status === "active");

  const handleSave = async () => {
    const nameErr = validatePersonName(fullName);
    if (nameErr) {
      setError(nameErr);
      return;
    }
    if (!isEdit && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    const phoneErr = validatePhoneVN(phone, { emptyOk: true });
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    const dept = activeDepts.find((d) => d.id === departmentId);

    setSaving(true);
    setError(null);
    try {
      if (isEdit && member) {
        await updateClubMember(member.id, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          studentId: studentId.trim(),
          generation: generation.trim(),
        });
        if (status !== member.status) {
          await setClubMemberStatus(member.id, status);
        }
        const prevDept = member.departmentId || "";
        const nextDept = departmentId || "";
        if (prevDept !== nextDept) {
          if (nextDept) {
            await assignMemberToDepartment(member.id, nextDept, {
              reason: "Cập nhật Ban từ Quản lý thành viên",
            });
          } else if (prevDept) {
            await removeMemberFromDepartment(
              member.id,
              "Gỡ Ban từ Quản lý thành viên",
            );
          }
        }
      } else {
        await createClubMember({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          role: "member",
          departmentId: dept?.id,
          departmentName: dept?.name,
          studentId: studentId.trim() || undefined,
          generation: generation.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được thành viên.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={isEdit ? "Sửa thành viên" : "Thêm thành viên"}
      description={
        isEdit
          ? "Cập nhật thông tin hồ sơ. Email không đổi được tại đây."
          : "Tạo Member chính thức. Mật khẩu tạm sẽ được hệ thống sinh tự động."
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Đang lưu…" : "Lưu"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Họ tên *
          </span>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoFocus
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Email *
          </span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@gmail.com"
            disabled={isEdit}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              SĐT
            </span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0xxxxxxxxx"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              MSSV
            </span>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="B24DCCC000"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Lớp
            </span>
            <Input
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              placeholder="D24CQCC01-B"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Ban
            </span>
            <Select
              value={departmentId}
              onChange={setDepartmentId}
              options={[
                { value: "", label: "Chưa phân Ban" },
                ...activeDepts.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </label>
        </div>
        {isEdit && (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Trạng thái
            </span>
            <Select
              value={status}
              onChange={(v) => setStatus(v as ClubMemberStatus)}
              options={STATUS_OPTIONS}
            />
          </label>
        )}
      </div>
    </Modal>
  );
}

export default MemberFormModal;
