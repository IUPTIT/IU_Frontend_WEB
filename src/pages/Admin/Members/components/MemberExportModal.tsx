import { useMemo, useState } from "react";
import { Download, GripVertical, X } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import type { ClubMember } from "../../../../types/members";
import { formatDate } from "../../../../utils/formatDate";

export type ExportFieldId =
  | "fullName"
  | "email"
  | "phone"
  | "studentId"
  | "generation"
  | "departmentName"
  | "role"
  | "status"
  | "joinedAt";

type FieldDef = {
  id: ExportFieldId;
  label: string;
  getValue: (m: ClubMember, roleLabel: string) => string;
};

const STATUS_LABEL: Record<ClubMember["status"], string> = {
  active: "Đang hoạt động",
  inactive: "Không hoạt động",
  alumni: "Cựu thành viên",
};

const FIELDS: FieldDef[] = [
  { id: "fullName", label: "Họ tên", getValue: (m) => m.fullName },
  { id: "email", label: "Email", getValue: (m) => m.email },
  { id: "phone", label: "SĐT", getValue: (m) => m.phone || "" },
  { id: "studentId", label: "MSSV", getValue: (m) => m.studentId || "" },
  { id: "generation", label: "Lớp", getValue: (m) => m.generation || "" },
  {
    id: "departmentName",
    label: "Ban",
    getValue: (m) => m.departmentName || "",
  },
  { id: "role", label: "Vai trò", getValue: (_m, role) => role },
  {
    id: "status",
    label: "Trạng thái",
    getValue: (m) => STATUS_LABEL[m.status] ?? m.status,
  },
  {
    id: "joinedAt",
    label: "Ngày tham gia",
    getValue: (m) => (m.joinedAt ? formatDate(m.joinedAt) : ""),
  },
];

const EXPORT_FILENAME = "Danh sách thành viên Câu lạc bộ.xlsx";
const SHEET_NAME = "FULL_DATA";

type Props = {
  open: boolean;
  onClose: () => void;
  rows: ClubMember[];
  /** Map memberId → "Leader" | "Member" theo Ban head */
  roleOf: (m: ClubMember) => string;
  onExported?: (count: number) => void;
};

function MemberExportModal({
  open,
  onClose,
  rows,
  roleOf,
  onExported,
}: Props) {
  const defaultIds = useMemo(() => FIELDS.map((f) => f.id), []);
  const [orderedIds, setOrderedIds] = useState<ExportFieldId[]>(defaultIds);
  const [dragId, setDragId] = useState<ExportFieldId | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setOrderedIds(defaultIds);
  }

  if (!open) return null;

  const selectedSet = new Set(orderedIds);
  const selectedOrdered = orderedIds
    .map((id) => FIELDS.find((f) => f.id === id))
    .filter(Boolean) as FieldDef[];

  const toggleColumn = (id: ExportFieldId, checked: boolean) => {
    setOrderedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const selectAll = () => setOrderedIds(FIELDS.map((f) => f.id));
  const deselectAll = () => setOrderedIds([]);

  const moveItem = (fromId: ExportFieldId, toId: ExportFieldId) => {
    setOrderedIds((prev) => {
      const from = prev.indexOf(fromId);
      const to = prev.indexOf(toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, fromId);
      return next;
    });
  };

  const handleDownload = () => {
    if (selectedOrdered.length === 0) return;
    const headers = selectedOrdered.map((c) => c.label);
    const data = rows.map((row) => {
      const role = roleOf(row);
      return selectedOrdered.map((c) => c.getValue(row, role));
    });
    const aoa = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
    XLSX.writeFile(wb, EXPORT_FILENAME);
    onExported?.(rows.length);
    onClose();
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
        aria-labelledby="member-export-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="member-export-title"
              className="font-display text-xl font-extrabold sm:text-2xl"
            >
              Xuất dữ liệu
            </h2>
            <p className="mt-1 text-sm text-muted">
              Chọn cột và sắp xếp thứ tự — file Excel sheet FULL_DATA theo bộ lọc
              danh sách hiện tại ({rows.length} dòng).
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <Icon icon={X} size={16} />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-5 sm:grid-cols-2 sm:p-6">
          <section className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Available fields</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-accent hover:underline"
                  onClick={selectAll}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-muted hover:underline"
                  onClick={deselectAll}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-2xl bg-black/[0.03] p-2">
              {FIELDS.map((f) => (
                <li key={f.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5">
                    <input
                      type="checkbox"
                      className="accent-[var(--color-accent)]"
                      checked={selectedSet.has(f.id)}
                      onChange={(e) => toggleColumn(f.id, e.target.checked)}
                    />
                    <span className="text-sm">{f.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex min-h-0 flex-col gap-3">
            <h3 className="text-sm font-semibold">Fields to export</h3>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-2xl bg-black/[0.03] p-2">
              {selectedOrdered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  Chưa chọn cột nào
                </li>
              )}
              {selectedOrdered.map((f) => (
                <li
                  key={f.id}
                  draggable
                  onDragStart={() => setDragId(f.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) moveItem(dragId, f.id);
                    setDragId(null);
                  }}
                  className="flex cursor-grab items-center gap-2 rounded-xl bg-background px-3 py-2 shadow-extruded-sm active:cursor-grabbing"
                >
                  <Icon icon={GripVertical} size={14} className="text-muted" />
                  <span className="flex-1 text-sm font-medium">{f.label}</span>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-rose-600"
                    onClick={() => toggleColumn(f.id, false)}
                  >
                    Bỏ
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            leftIcon={<Icon icon={Download} size={16} />}
            disabled={selectedOrdered.length === 0}
            onClick={handleDownload}
          >
            Tải xuống dữ liệu
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default MemberExportModal;
