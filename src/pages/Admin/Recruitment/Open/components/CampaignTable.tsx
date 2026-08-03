import { Pencil, Trash2 } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import {
  DataTableCell,
  DataTableHead,
  DataTableShell,
  useColumnWidths,
  type DataTableColumn,
} from "../../../../../components/ui/DataTable";
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

function CampaignTable({ campaigns, page, pageSize, onToggleActive, onEdit, onDelete }: Props) {
  const startIndex = (page - 1) * pageSize;
  const { widths, setWidth } = useColumnWidths(COLUMNS);

  return (
    <DataTableShell minWidth={800}>
      <colgroup>
        {COLUMNS.map((c) => (
          <col key={c.id} style={{ width: widths[c.id] }} />
        ))}
      </colgroup>
      <DataTableHead columns={COLUMNS} widths={widths} onResize={setWidth} />
      <tbody>
        {campaigns.map((c, i) => (
          <tr key={c.id}>
            <DataTableCell>
              <span className="text-sm text-muted">{startIndex + i + 1}</span>
            </DataTableCell>
            <DataTableCell align="left">
              <span className="font-medium text-foreground">{c.name}</span>
            </DataTableCell>
            <DataTableCell>
              <span className="text-sm text-muted">{displayDate(c.openAt)}</span>
            </DataTableCell>
            <DataTableCell>
              <span className="text-sm text-muted">{displayDate(c.closeAt)}</span>
            </DataTableCell>
            <DataTableCell>
              <div className="inline-flex justify-center">
                <CampaignStatusBadge campaign={c} />
              </div>
            </DataTableCell>
            <DataTableCell>
              <div className="flex justify-center">
                <Toggle
                  checked={c.isActive}
                  onChange={(checked) => onToggleActive(c.id, checked)}
                  aria-label={`Kích hoạt ${c.name}`}
                  disabled={c.status === "closed"}
                />
              </div>
            </DataTableCell>
            <DataTableCell>
              <div className="flex items-center justify-center gap-2">
                <Button variant="icon" size="sm" aria-label={`Sửa ${c.name}`} onClick={() => onEdit(c)}>
                  <Icon icon={Pencil} size={16} />
                </Button>
                <Button
                  variant="danger-icon"
                  size="sm"
                  aria-label={`Xóa ${c.name}`}
                  onClick={() => onDelete(c)}
                >
                  <Icon icon={Trash2} size={16} />
                </Button>
              </div>
            </DataTableCell>
          </tr>
        ))}
      </tbody>
    </DataTableShell>
  );
}

export default CampaignTable;
