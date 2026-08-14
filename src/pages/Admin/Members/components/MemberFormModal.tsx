import { useState } from "react";
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
