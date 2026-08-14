import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import Select from "../../../../components/ui/Select";
import { createMentorTask } from "../../../../services/trainingService";
import { ensureHttpUrl } from "../../../../utils/url";
import type { Trainee, TrainingGroup } from "../../../../types/training";

type Props = {
  groups: TrainingGroup[];
  trainees: Trainee[];
  onCreated: () => void;
};

export default function AssignTaskForm({
  groups,
  trainees,
  onCreated,
}: Props) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupTrainees = useMemo(
    () => trainees.filter((t) => t.groupId === groupId),
    [trainees, groupId],
  );

  const handleCreate = async () => {
    if (!groupId) {
      setError("Chọn team để giao task.");
      return;
    }
    if (!title.trim()) {
      setError("Tiêu đề task là bắt buộc.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createMentorTask({
        groupId,
        title: title.trim(),
        description: description.trim() || undefined,
        attachmentUrl: attachmentUrl.trim()
          ? ensureHttpUrl(attachmentUrl)
          : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        assigneeIds: assigneeId ? [assigneeId] : undefined,
      });
      setTitle("");
      setDescription("");
      setAttachmentUrl("");
      setDeadline("");
      setAssigneeId("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giao task thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="ui-card !p-5 space-y-4 h-fit">
      <h2 className="font-display text-lg font-bold">Giao task mới</h2>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="ui-field-label">Tiêu đề bài tập *</span>
          <input
            className="ui-input !h-11"
            placeholder="Vd: Thiết kế UI Landing Page..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="ui-field-label">Hạn chót</span>
            <input
              type="datetime-local"
              className="ui-input !h-11"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
          <div>
            <span className="ui-field-label">Team</span>
            <Select
              width="full"
              value={groupId}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              onChange={(v) => {
                setGroupId(v);
                setAssigneeId("");
              }}
              placeholder="Chọn team"
            />
          </div>
        </div>

        <div>
          <span className="ui-field-label">Người thực hiện</span>
          <Select
            width="full"
            value={assigneeId}
            options={[
              { value: "", label: "Cả team" },
              ...groupTrainees.map((t) => ({
                value: t.id,
                label: t.fullName,
              })),
            ]}
            onChange={setAssigneeId}
            placeholder="Cả team"
          />
        </div>

        <label className="block space-y-1.5">
          <span className="ui-field-label">Mô tả</span>
          <textarea
            className="ui-input !h-auto min-h-[72px] resize-y py-2 text-sm"
            placeholder="Yêu cầu, tiêu chí hoàn thành..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="ui-field-label">Link tài liệu đính kèm</span>
          <input
            className="ui-input !h-11"
            placeholder="https://..."
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <Button
        variant="primary"
        className="w-full"
        disabled={saving || groups.length === 0}
        onClick={() => void handleCreate()}
        leftIcon={<Icon icon={Send} size={16} />}
      >
        {saving ? "Đang giao..." : "Giao task"}
      </Button>

      <p className="rounded-2xl bg-accent/10 px-3 py-2.5 text-xs text-accent">
        Mẹo: để trống người thực hiện để giao cho cả team. Điểm & nhận xét
        chấm ở bảng theo dõi bên phải.
      </p>
    </section>
  );
}
