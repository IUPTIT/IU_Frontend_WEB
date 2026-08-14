import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Icon from "../../../../../components/ui/Icon";
import Avatar from "../../../../../components/ui/Avatar";
import Select from "../../../../../components/ui/Select";
import { updateTrainingGroup } from "../../../../../services/trainingService";
import type { Trainee, TrainingGroup, TrainingProgram } from "../../../../../types/training";

/**
 * Chỉnh sửa nhóm: phân Mentor, điều chỉnh thành viên (UC 37–38) —
 * kế thừa modal soft-UI của trang Chia đội Admin.
 */
export default function EditGroupModal({
  open,
  group,
  trainees,
  mentors,
  programs,
  onClose,
  onSaved,
}: {
  open: boolean;
  group: TrainingGroup | null;
  trainees: Trainee[];
  mentors: { id: string; name: string; roleLabel: string }[];
  programs: TrainingProgram[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [programId, setProgramId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!group || !open) return;
    setName(group.name);
    setMentorId(group.mentorId ?? "");
    setProgramId(group.programId ?? "");
    setMemberIds(
      trainees.filter((t) => t.groupId === group.id).map((t) => t.id),
    );
    setError(null);
  }, [group, open, trainees]);

  if (!open || !group) return null;

  const inThisGroup = trainees.filter((t) => t.groupId === group.id);
  const available = trainees.filter(
    (t) =>
      t.status !== "removed" &&
      (!t.groupId || t.groupId === group.id),
  );

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên nhóm bắt buộc.");
      return;
    }
    if (memberIds.length === 0) {
      setError("Nhóm cần ít nhất 1 thành viên.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateTrainingGroup(group.id, {
        name: name.trim(),
        mentorId: mentorId || null,
        programId: programId || null,
        memberIds,
      });
      onSaved(`Đã cập nhật nhóm "${name.trim()}".`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-background shadow-soft"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-extrabold">
              Chỉnh sửa nhóm training
            </h2>
            <p className="mt-1 text-sm text-muted">
              Đổi Mentor training (Member CLB), lộ trình hoặc điều chỉnh tân binh.
              Để trống Mentor = thu hồi quyền phụ trách đội này.
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:px-6">
          <label className="block space-y-1.5">
            <span className="ui-field-label">Tên nhóm *</span>
            <input
              className="ui-input w-full text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="ui-field-label">Mentor training (Member CLB)</span>
              <Select
                width="full"
                value={mentorId}
                onChange={setMentorId}
                placeholder="Chọn Member / Leader CLB"
                options={[
                  { value: "", label: "— Thu hồi / chưa gán —" },
                  ...mentors.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.roleLabel})`,
                  })),
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <span className="ui-field-label">Lộ trình</span>
              <Select
                width="full"
                value={programId}
                onChange={setProgramId}
                placeholder="Chọn lộ trình"
                options={[
                  { value: "", label: "— Chưa gán —" },
                  ...programs.map((p) => ({
                    value: p.id,
                    label: `${p.name} · ${p.departmentName}`,
                  })),
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="ui-field-label !mb-0">Thành viên trong nhóm</span>
              <span className="text-xs text-muted">
                {memberIds.length} đã chọn · {inThisGroup.length} hiện tại
              </span>
            </div>
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-hairline">
              {available.map((t) => {
                const checked = memberIds.includes(t.id);
                return (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/5">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--color-accent)]"
                        checked={checked}
                        onChange={() => toggleMember(t.id)}
                      />
                      <Avatar name={t.fullName} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {t.fullName}
                        </span>
                        <span className="text-xs text-muted">
                          {t.departmentName}
                          {t.groupId && t.groupId !== group.id
                            ? " · nhóm khác"
                            : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
              {available.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  Không còn tân binh khả dụng.
                </li>
              )}
            </ul>
          </div>

        </div>

        <footer className="space-y-3 border-t border-black/5 px-5 py-4 sm:px-6">
          {error && (
            <p role="alert" className="text-sm font-medium text-rose-500">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={saving}
              onClick={() => void handleSave()}
              leftIcon={<Icon icon={Pencil} size={16} />}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
