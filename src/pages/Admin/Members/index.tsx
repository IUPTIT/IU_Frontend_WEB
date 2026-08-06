import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import ColumnSettings from "../../../components/ui/ColumnSettings";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
  DataTableCell,
  DataTableHead,
  DataTableShell,
  type DataTableColumn,
} from "../../../components/ui/DataTable";
import { useColumnWidths } from "../../../components/ui/useColumnWidths";
import FilterMenu from "../../../components/ui/FilterMenu";
import Icon from "../../../components/ui/Icon";
import ListToolbar from "../../../components/ui/ListToolbar";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import { getDepartments } from "../../../services/departmentsService";
import {
  deleteClubMember,
  getClubMembers,
} from "../../../services/membersService";
import type { ClubDepartment } from "../../../types/departments";
import type { ClubMember } from "../../../types/members";
import MemberExportModal from "./components/MemberExportModal";
import MemberFormModal from "./components/MemberFormModal";
import MemberImportModal from "./components/MemberImportModal";

const PAGE_SIZE = 10;

const ALL_COLUMNS: DataTableColumn[] = [
  { id: "check", label: "", width: 48, minWidth: 40, align: "center" },
  { id: "stt", label: "TT", width: 56, minWidth: 48, align: "center" },
  { id: "name", label: "Họ tên", width: 180, minWidth: 120, align: "left" },
  { id: "email", label: "Email", width: 200, minWidth: 140, align: "left" },
  { id: "phone", label: "SĐT", width: 120, minWidth: 100, align: "center" },
  { id: "mssv", label: "MSSV", width: 120, minWidth: 90, align: "center" },
  { id: "class", label: "Lớp", width: 130, minWidth: 90, align: "center" },
  { id: "dept", label: "Ban", width: 130, minWidth: 90, align: "center" },
  { id: "status", label: "Trạng thái", width: 130, minWidth: 100, align: "center" },
  { id: "actions", label: "Thao tác", width: 110, minWidth: 90, align: "center" },
];

const COLUMN_SETTINGS = ALL_COLUMNS.filter((c) => c.id !== "check").map(
  (c) => ({
    id: c.id,
    label: typeof c.label === "string" && c.label ? c.label : c.id,
    locked: c.id === "actions" || c.id === "stt" || c.id === "name",
  }),
);

function organizationRole(
  member: ClubMember,
  departments: ClubDepartment[],
): "member" | "leader" {
  return departments.some((department) => department.headUserId === member.id)
    ? "leader"
    : "member";
}

function memberInUse(
  member: ClubMember,
  departments: ClubDepartment[],
): boolean {
  return (
    Boolean(member.departmentId) ||
    organizationRole(member, departments) === "leader"
  );
}

function statusLabel(status: ClubMember["status"]) {
  if (status === "active") return "Đang hoạt động";
  if (status === "alumni") return "Cựu thành viên";
  return "Không hoạt động";
}

import { useToast } from "../../../context/useToast";

export default function AdminMembersPage() {
  const toastApi = useToast();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [departments, setDepartments] = useState<ClubDepartment[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [draftDept, setDraftDept] = useState("");
  const [draftRole, setDraftRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleIds, setVisibleIds] = useState(() =>
    ALL_COLUMNS.map((c) => c.id),
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClubMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClubMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const visibleColumns = useMemo(
    () => ALL_COLUMNS.filter((c) => visibleIds.includes(c.id)),
    [visibleIds],
  );
  const { widths, setWidth } = useColumnWidths(visibleColumns);

  const showToast = (msg: string) => {
    toastApi.info(msg);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [memberList, departmentList] = await Promise.all([
        getClubMembers(),
        getDepartments(),
      ]);
      setMembers(memberList);
      setDepartments(departmentList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách thành viên CLB.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMembers = useMemo(() => {
    const query = localSearch.trim().toLowerCase();
    return members.filter((member) => {
      if (
        departmentFilter &&
        (departmentFilter === "unassigned"
          ? Boolean(member.departmentId)
          : member.departmentId !== departmentFilter)
      ) {
        return false;
      }
      if (
        roleFilter &&
        organizationRole(member, departments) !== roleFilter
      ) {
        return false;
      }
      return (
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.phone ?? "").toLowerCase().includes(query) ||
        (member.studentId ?? "").toLowerCase().includes(query) ||
        (member.generation ?? "").toLowerCase().includes(query) ||
        (member.departmentName ?? "").toLowerCase().includes(query)
      );
    });
  }, [departmentFilter, departments, localSearch, members, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredMembers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [departmentFilter, roleFilter, localSearch]);

  const filterActiveCount =
    (departmentFilter ? 1 : 0) + (roleFilter ? 1 : 0);

  const allPageSelected =
    pageRows.length > 0 && pageRows.every((m) => selectedIds.has(m.id));

  const toggleAllPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const m of pageRows) {
        if (checked) next.add(m.id);
        else next.delete(m.id);
      }
      return next;
    });
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClubMember(deleteTarget.id);
      toastApi.deleted("thành viên");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toastApi.error(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const colVisible = (id: string) => visibleIds.includes(id);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Danh sách thành viên CLB
        </h1>
        <p className="mt-2 text-sm text-muted">
          CRUD thành viên, nhập/xuất Excel. Phân Ban Leader vẫn quản tại màn
          Ban.
        </p>
      </header>

      {toast && (
        <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <ListToolbar
        search={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Tìm theo: Họ tên, Email, MSSV, SĐT…"
        total={filteredMembers.length}
        settings={
          <ColumnSettings
            columns={COLUMN_SETTINGS}
            visibleIds={visibleIds.filter((id) => id !== "check")}
            onApply={(ids) =>
              setVisibleIds(["check", ...ids.filter((id) => id !== "check")])
            }
          />
        }
        filter={
          <FilterMenu
            activeCount={filterActiveCount}
            onApply={() => {
              setDepartmentFilter(draftDept);
              setRoleFilter(draftRole);
            }}
            onReset={() => {
              setDraftDept("");
              setDraftRole("");
              setDepartmentFilter("");
              setRoleFilter("");
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase text-muted">
                Ban
              </span>
              <Select
                value={draftDept}
                onChange={setDraftDept}
                width="full"
                options={[
                  { value: "", label: "Tất cả Ban" },
                  { value: "unassigned", label: "Chưa phân Ban" },
                  ...departments.map((department) => ({
                    value: department.id,
                    label: department.name,
                  })),
                ]}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase text-muted">
                Vai trò
              </span>
              <Select
                value={draftRole}
                onChange={setDraftRole}
                width="full"
                options={[
                  { value: "", label: "Tất cả vai trò" },
                  { value: "member", label: "Member" },
                  { value: "leader", label: "Leader" },
                ]}
              />
            </label>
          </FilterMenu>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon icon={RefreshCw} size={15} />}
              onClick={() => void load()}
              disabled={loading}
            >
              Làm mới
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon icon={Upload} size={15} />}
              onClick={() => setImportOpen(true)}
            >
              Nhập dữ liệu
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon icon={Download} size={15} />}
              onClick={() => setExportOpen(true)}
            >
              Xuất dữ liệu
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon icon={Plus} size={15} />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Thêm thành viên
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="neu-card h-52 animate-pulse" aria-busy="true" />
      ) : (
        <>
          <DataTableShell minWidth={900}>
            <DataTableHead
              columns={visibleColumns}
              widths={widths}
              onResize={setWidth}
            />
            <tbody>
              {pageRows.map((member, idx) => (
                <tr key={member.id}>
                  {colVisible("check") && (
                    <DataTableCell align="center">
                      <input
                        type="checkbox"
                        className="accent-[var(--color-accent)]"
                        checked={selectedIds.has(member.id)}
                        onChange={(e) =>
                          toggleOne(member.id, e.target.checked)
                        }
                        aria-label={`Chọn ${member.fullName}`}
                      />
                    </DataTableCell>
                  )}
                  {colVisible("stt") && (
                    <DataTableCell align="center">
                      {(safePage - 1) * PAGE_SIZE + idx + 1}
                    </DataTableCell>
                  )}
                  {colVisible("name") && (
                    <DataTableCell align="left">
                      <span className="font-semibold">{member.fullName}</span>
                      {organizationRole(member, departments) === "leader" && (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          Leader
                        </span>
                      )}
                    </DataTableCell>
                  )}
                  {colVisible("email") && (
                    <DataTableCell align="left">
                      <span className="text-muted">{member.email}</span>
                    </DataTableCell>
                  )}
                  {colVisible("phone") && (
                    <DataTableCell align="center">
                      {member.phone || "—"}
                    </DataTableCell>
                  )}
                  {colVisible("mssv") && (
                    <DataTableCell align="center">
                      {member.studentId || "—"}
                    </DataTableCell>
                  )}
                  {colVisible("class") && (
                    <DataTableCell align="center">
                      {member.generation || "—"}
                    </DataTableCell>
                  )}
                  {colVisible("dept") && (
                    <DataTableCell align="center">
                      {member.departmentName || "—"}
                    </DataTableCell>
                  )}
                  {colVisible("status") && (
                    <DataTableCell align="center">
                      {statusLabel(member.status)}
                    </DataTableCell>
                  )}
                  {colVisible("actions") && (
                    <DataTableCell align="center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="icon"
                          size="sm"
                          aria-label="Sửa"
                          onClick={() => {
                            setEditing(member);
                            setFormOpen(true);
                          }}
                        >
                          <Icon icon={Pencil} size={15} />
                        </Button>
                        <Button
                          variant="danger-icon"
                          size="sm"
                          aria-label="Xóa"
                          onClick={() => setDeleteTarget(member)}
                        >
                          <Icon icon={Trash2} size={15} />
                        </Button>
                      </div>
                    </DataTableCell>
                  )}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-10 text-center text-muted"
                  >
                    Không có thành viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </DataTableShell>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                className="accent-[var(--color-accent)]"
                checked={allPageSelected}
                onChange={(e) => toggleAllPage(e.target.checked)}
              />
              Đã chọn {selectedIds.size} / Tổng số{" "}
              <span className="font-bold text-red-500">
                {filteredMembers.length}
              </span>
            </label>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </>
      )}

      <MemberFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          if (editing) toastApi.updated("thành viên");
          else toastApi.created("thành viên");
          void load();
        }}
        departments={departments}
        member={editing}
      />

      <MemberImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(count) => {
          toastApi.success(`Nhập thành công ${count} thành viên.`);
          void load();
        }}
      />

      <MemberExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rows={filteredMembers}
        roleOf={(m) =>
          organizationRole(m, departments) === "leader" ? "Leader" : "Member"
        }
        onExported={(count) => toastApi.success(`Đã xuất ${count} dòng.`)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete"
        message={
          deleteTarget
            ? memberInUse(deleteTarget, departments)
              ? "This data has been used. Are you sure you want to delete it?"
              : "Are you sure you want to delete this data?"
            : undefined
        }
        tone="danger"
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
