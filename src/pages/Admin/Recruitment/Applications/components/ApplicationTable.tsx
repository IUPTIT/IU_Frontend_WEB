import { useMemo } from "react";
import { MoreVertical } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import {
  DataTableCell,
  DataTableHead,
  DataTableShell,
  type DataTableColumn,
} from "../../../../../components/ui/DataTable";
import { useColumnWidths } from "../../../../../components/ui/useColumnWidths";
import Icon from "../../../../../components/ui/Icon";
import type { Application } from "../../../../../types/recruitment";
import { formatDate } from "../../../../../utils/formatDate";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import DepartmentCell from "./DepartmentCell";

type Props = {
  applications: Application[];
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  onOpenDetail: (app: Application) => void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function ApplicationTable({
  applications,
  selectedIds,
  onToggleOne,
  onToggleAll,
  onOpenDetail,
}: Props) {
  const allIds = applications.map((a) => a.id);
  const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someChecked = allIds.some((id) => selectedIds.has(id)) && !allChecked;

  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        id: "check",
        label: (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-accent/40 accent-accent"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = someChecked;
            }}
            onChange={(e) => onToggleAll(allIds, e.target.checked)}
            aria-label="Chọn tất cả trên trang"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        width: 56,
        minWidth: 48,
        align: "center",
      },
      { id: "applicant", label: "Ứng viên", width: 220, minWidth: 140, align: "left" },
      { id: "dept", label: "Ban nguyện vọng", width: 180, minWidth: 120, align: "center" },
      { id: "date", label: "Ngày nộp", width: 110, minWidth: 90, align: "center" },
      { id: "score", label: "Điểm ĐG", width: 100, minWidth: 80, align: "center" },
      { id: "status", label: "Trạng thái", width: 130, minWidth: 100, align: "center" },
      { id: "actions", label: "Thao tác", width: 88, minWidth: 72, align: "center" },
    ],
    [allChecked, someChecked, allIds, onToggleAll],
  );

  const { widths, setWidth } = useColumnWidths(columns);

  return (
    <DataTableShell minWidth={900}>
      <colgroup>
        {columns.map((c) => (
          <col key={c.id} style={{ width: widths[c.id] }} />
        ))}
      </colgroup>
      <DataTableHead columns={columns} widths={widths} onResize={setWidth} />
      <tbody>
        {applications.length === 0 ? (
          <tr>
            <DataTableCell colSpan={7} className="!py-16 text-muted">
              Không có hồ sơ phù hợp với bộ lọc.
            </DataTableCell>
          </tr>
        ) : (
          applications.map((app) => (
            <tr
              key={app.id}
              className="cursor-pointer"
              onClick={() => onOpenDetail(app)}
            >
              <DataTableCell>
                <span
                  className="inline-flex"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-accent/40 accent-accent"
                    checked={selectedIds.has(app.id)}
                    onChange={() => onToggleOne(app.id)}
                    aria-label={`Chọn ${app.fullName}`}
                  />
                </span>
              </DataTableCell>
              <DataTableCell align="left">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent shadow-inset-sm"
                    aria-hidden
                  >
                    {initials(app.fullName)}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-semibold text-foreground">{app.fullName}</p>
                    <p className="truncate text-xs text-muted">{app.email}</p>
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell>
                <div className="inline-flex justify-center">
                  <DepartmentCell
                    departmentId={app.preferredDepartmentId}
                    departmentName={app.preferredDepartmentName}
                  />
                </div>
              </DataTableCell>
              <DataTableCell>
                <span className="text-sm text-muted">{formatDate(app.submittedAt)}</span>
              </DataTableCell>
              <DataTableCell>
                {app.totalScore != null ? (
                  <span className="text-sm font-medium">
                    {app.totalScore.toFixed(1)}
                    <span className="text-muted font-normal"> /10</span>
                  </span>
                ) : (
                  <span className="text-muted">--</span>
                )}
              </DataTableCell>
              <DataTableCell>
                <div className="inline-flex justify-center">
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </DataTableCell>
              <DataTableCell>
                <span onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="icon"
                    size="sm"
                    aria-label={`Xem chi tiết ${app.fullName}`}
                    onClick={() => onOpenDetail(app)}
                  >
                    <Icon icon={MoreVertical} size={16} />
                  </Button>
                </span>
              </DataTableCell>
            </tr>
          ))
        )}
      </tbody>
    </DataTableShell>
  );
}

export default ApplicationTable;
