import { useMemo } from "react";
import { FolderOpen, Pencil, Trash2 } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Button from "../../../../../components/ui/Button";
import {
  DataTableCell,
  DataTableHead,
  DataTableShell,
  type DataTableColumn,
} from "../../../../../components/ui/DataTable";
import { useColumnWidths } from "../../../../../components/ui/useColumnWidths";
import Icon from "../../../../../components/ui/Icon";
import Toggle from "../../../../../components/ui/Toggle";
import CampaignStatusBadge from "./CampaignStatusBadge";
import type { RecruitmentCampaign } from "../../../../../types/recruitment";
import { formatDate } from "../../../../../utils/formatDate";

type Props = {
  campaigns: RecruitmentCampaign[];
  page: number;
  pageSize: number;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (campaign: RecruitmentCampaign) => void;
  onDelete: (campaign: RecruitmentCampaign) => void;
};

const COLUMNS: DataTableColumn[] = [
  { id: "tt", label: "TT", width: 64, minWidth: 48, align: "center" },
  { id: "name", label: "Tên đợt đăng ký", width: 240, minWidth: 140, align: "left" },
  { id: "start", label: "Bắt đầu", width: 120, minWidth: 90, align: "center" },
  { id: "end", label: "Kết thúc", width: 120, minWidth: 90, align: "center" },
  { id: "status", label: "Trạng thái", width: 130, minWidth: 100, align: "center" },
  { id: "active", label: "Kích hoạt", width: 110, minWidth: 88, align: "center" },
  { id: "actions", label: "Thao tác", width: 110, minWidth: 88, align: "center" },
];

function displayDate(iso: string | null) {
  return iso ? formatDate(iso) : "--/--/----";
}

const columnHelper = createColumnHelper<RecruitmentCampaign>();

function CampaignTable({ campaigns, page, pageSize, onToggleActive, onEdit, onDelete }: Props) {
  const startIndex = (page - 1) * pageSize;
  const { widths, setWidth } = useColumnWidths(COLUMNS);

  // Cột định nghĩa qua TanStack Table — model bảng do thư viện quản lý
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "tt",
        cell: (info) => <span className="text-sm text-muted">{startIndex + info.row.index + 1}</span>,
      }),
      columnHelper.accessor("name", {
        id: "name",
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("openAt", {
        id: "start",
        cell: (info) => <span className="text-sm text-muted">{displayDate(info.getValue())}</span>,
      }),
      columnHelper.accessor("closeAt", {
        id: "end",
        cell: (info) => <span className="text-sm text-muted">{displayDate(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: "status",
        cell: (info) => (
          <div className="inline-flex justify-center">
            <CampaignStatusBadge campaign={info.row.original} />
          </div>
        ),
      }),
      columnHelper.display({
        id: "active",
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex justify-center">
              <Toggle
                checked={c.isActive}
                onChange={(checked) => onToggleActive(c.id, checked)}
                aria-label={`Kích hoạt ${c.name}`}
                disabled={c.status === "closed"}
              />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <Button variant="icon" size="sm" aria-label={`Sửa ${c.name}`} onClick={() => onEdit(c)}>
                <Icon icon={Pencil} size={16} />
              </Button>
              <Button variant="danger-icon" size="sm" aria-label={`Xóa ${c.name}`} onClick={() => onDelete(c)}>
                <Icon icon={Trash2} size={16} />
              </Button>
            </div>
          );
        },
      }),
    ],
    [startIndex, onToggleActive, onEdit, onDelete],
  );

  const table = useReactTable({
    data: campaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <DataTableShell minWidth={800}>
      <colgroup>
        {COLUMNS.map((c) => (
          <col key={c.id} style={{ width: widths[c.id] }} />
        ))}
      </colgroup>
      <DataTableHead columns={COLUMNS} widths={widths} onResize={setWidth} />
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={COLUMNS.length}>
              {/* Empty state — không để bảng trống trơn */}
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="neu-well h-16 w-16 text-muted">
                  <Icon icon={FolderOpen} size={28} />
                </div>
                <p className="font-medium text-foreground">Chưa có đợt tuyển nào</p>
                <p className="max-w-sm text-sm text-muted">
                  Bấm <span className="font-semibold text-accent">"Thêm mới"</span> ở góc phải để tạo
                  đợt tuyển thành viên đầu tiên.
                </p>
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const col = COLUMNS.find((c) => c.id === cell.column.id);
                return (
                  <DataTableCell key={cell.id} align={col?.align}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </DataTableCell>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </DataTableShell>
  );
}

export default CampaignTable;
