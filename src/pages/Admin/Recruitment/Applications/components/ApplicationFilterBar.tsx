import FilterMenu from "../../../../../components/ui/FilterMenu";
import Select from "../../../../../components/ui/Select";
import type { ApplicationStatus } from "../../../../../types/recruitment";
import { getApplicationStatusLabel } from "./applicationStatus";

export type ApplicationFilterDraft = {
  departmentId: string; // "" = tất cả
  status: ApplicationStatus | "";
  scoreMin: string; // "" | number string
};

type DeptOption = { id: string; name: string };

type Props = {
  draft: ApplicationFilterDraft;
  onDraftChange: (next: ApplicationFilterDraft) => void;
  departments: DeptOption[];
  activeCount: number;
  onApply: () => void;
  onReset: () => void;
};

const STATUS_OPTIONS: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "submitted", label: getApplicationStatusLabel("submitted") },
  { value: "interview", label: getApplicationStatusLabel("interview") },
  { value: "cv_failed", label: getApplicationStatusLabel("cv_failed") },
  { value: "interview_passed", label: getApplicationStatusLabel("interview_passed") },
  { value: "interview_failed", label: getApplicationStatusLabel("interview_failed") },
  { value: "accepted", label: getApplicationStatusLabel("accepted") },
  { value: "rejected", label: getApplicationStatusLabel("rejected") },
];

/**
 * Bộ lọc điều kiện dành riêng màn Vòng hồ sơ (Admin).
 * Dùng FilterMenu + Select Soft UI dùng chung.
 */
function ApplicationFilterBar({
  draft,
  onDraftChange,
  departments,
  activeCount,
  onApply,
  onReset,
}: Props) {
  return (
    <FilterMenu activeCount={activeCount} onApply={onApply} onReset={onReset}>
      <div>
        <span className="neu-field-label">Ban nguyện vọng</span>
        <Select
          width="full"
          value={draft.departmentId}
          ariaLabel="Lọc theo ban"
          options={[
            { value: "", label: "Tất cả ban" },
            ...departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
          onChange={(departmentId) => onDraftChange({ ...draft, departmentId })}
        />
      </div>

      <div>
        <span className="neu-field-label">Trạng thái</span>
        <Select
          width="full"
          value={draft.status}
          ariaLabel="Lọc theo trạng thái"
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(status) =>
            onDraftChange({ ...draft, status: status as ApplicationStatus | "" })
          }
        />
      </div>

      <div>
        <span className="neu-field-label">Điểm đánh giá tối thiểu</span>
        <input
          type="number"
          min={0}
          max={10}
          step={0.5}
          placeholder="VD: 7"
          className="neu-input !h-11 text-sm"
          value={draft.scoreMin}
          onChange={(e) => onDraftChange({ ...draft, scoreMin: e.target.value })}
        />
        <p className="mt-1 text-[11px] text-muted">Để trống = không lọc theo điểm</p>
      </div>
    </FilterMenu>
  );
}

export default ApplicationFilterBar;
