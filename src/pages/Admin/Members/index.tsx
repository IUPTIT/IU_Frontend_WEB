import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, UserCheck, UserRound, Users } from "lucide-react";
import Button from "../../../components/ui/Button";
import {
  DataTableCell,
  DataTableHead,
  DataTableShell,
  type DataTableColumn,
} from "../../../components/ui/DataTable";
import { useColumnWidths } from "../../../components/ui/useColumnWidths";
import ExportDataModal, { type ExportColumnDef } from "../../../components/ui/ExportDataModal";
import FilterMenu from "../../../components/ui/FilterMenu";
import Icon from "../../../components/ui/Icon";
import MetricCard from "../../../components/ui/MetricCard";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import { usePortalUi } from "../../../context/usePortalUi";
import {
  createClubMember,
  getClubMembers,
  setClubMemberStatus,
  updateClubMemberRole,
} from "../../../services/membersService";
import type { ClubMember, ClubMemberRole, ClubMemberStatus } from "../../../types/members";
import { formatDate } from "../../../utils/formatDate";

const PAGE_SIZE = 6;

const MEMBER_COLUMNS: DataTableColumn[] = [
  { id: "member", label: "Thành viên", width: 240, minWidth: 160, align: "left" },
  { id: "role", label: "Vai trò", width: 160, minWidth: 100, align: "center" },
  { id: "dept", label: "Ban", width: 150, minWidth: 100, align: "center" },
  { id: "gen", label: "Thế hệ", width: 100, minWidth: 72, align: "center" },
  { id: "status", label: "Trạng thái", width: 140, minWidth: 100, align: "center" },
  { id: "actions", label: "Thao tác", width: 260, minWidth: 180, align: "center" },
];

const DEPTS = [
  { id: "dept-tech", name: "Ban Chuyên môn" },
  { id: "dept-media", name: "Ban Truyền thông" },
  { id: "dept-event", name: "Ban Sự kiện" },
  { id: "dept-hr", name: "Ban Nhân sự" },
];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function roleLabel(r: ClubMemberRole) {
  if (r === "admin") return "BCN / Admin";
  if (r === "leader") return "Leader (TV chính thức)";
  return "Member (TV chính thức)";
}

function statusLabel(s: ClubMemberStatus) {
  if (s === "active") return "Đang hoạt động";
  if (s === "inactive") return "Tạm nghỉ";
  return "Cựu thành viên";
}

function StatusBadge({ status }: { status: ClubMemberStatus }) {
  const cls =
    status === "active"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "inactive"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-muted/20 text-muted";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {statusLabel(status)}
    </span>
  );
}

function AddMemberDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"member" | "leader">("member");
  const [departmentId, setDepartmentId] = useState("dept-tech");
  const [generation, setGeneration] = useState("Gen 4");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("member");
      setDepartmentId("dept-tech");
      setGeneration("Gen 4");
      setStudentId("");
      setError(null);
    }
  }

  if (!open) return null;

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      setError("Họ tên và email là bắt buộc.");
      return;
    }
    setSaving(true);
    try {
      const dept = DEPTS.find((d) => d.id === departmentId)!;
      await createClubMember({
        fullName,
        email,
        phone: phone || undefined,
        role,
        departmentId,
        departmentName: dept.name,
        generation,
        studentId: studentId || undefined,
      });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-extrabold">Thêm thành viên chính thức</h2>
            <p className="mt-1 text-sm text-muted">Member hoặc Leader đều là thành viên chính của CLB.</p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:px-6">
          <label className="block space-y-1.5">
            <span className="neu-field-label">Họ tên *</span>
            <input className="neu-input !h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Email *</span>
            <input className="neu-input !h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Số điện thoại</span>
            <input className="neu-input !h-11" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div>
            <span className="neu-field-label">Vai trò trong CLB *</span>
            <div className="grid grid-cols-2 gap-2">
              {(["member", "leader"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
                    role === r ? "bg-accent/20 text-accent shadow-inset-sm" : "shadow-extruded-sm text-muted"
                  }`}
                >
                  {r === "leader" ? "Leader" : "Member"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="neu-field-label">Ban *</span>
            <Select
              width="full"
              value={departmentId}
              options={DEPTS.map((d) => ({ value: d.id, label: d.name }))}
              onChange={setDepartmentId}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="neu-field-label">Thế hệ</span>
              <input className="neu-input !h-11" value={generation} onChange={(e) => setGeneration(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="neu-field-label">MSSV</span>
              <input className="neu-input !h-11" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </label>
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <footer className="flex gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" className="flex-1" disabled={saving} onClick={() => void handleSave()}>
            Lưu thành viên
          </Button>
        </footer>
      </div>
    </div>
  );
}

function AdminMembersPage() {
  const { search } = usePortalUi();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState({ role: "" as ClubMemberRole | "", status: "" as ClubMemberStatus | "", departmentId: "" });
  const [applied, setApplied] = useState(draft);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await getClubMembers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Gọi qua microtask để setState chỉ chạy sau async boundary
    void Promise.resolve().then(load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (applied.role && m.role !== applied.role) return false;
      if (applied.status && m.status !== applied.status) return false;
      if (applied.departmentId && m.departmentId !== applied.departmentId) return false;
      if (q && !m.fullName.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, search, applied]);

  // Đổi tìm kiếm / bộ lọc → về trang 1 (adjust state during render)
  const [prevFilterKey, setPrevFilterKey] = useState("");
  const filterKey = `${search}|${JSON.stringify(applied)}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: members.filter((m) => m.status === "active").length,
      leaders: members.filter((m) => m.role === "leader" && m.status === "active").length,
      members: members.filter((m) => m.role === "member" && m.status === "active").length,
    }),
    [members],
  );

  const { widths, setWidth } = useColumnWidths(MEMBER_COLUMNS);

  const exportColumns: ExportColumnDef<ClubMember>[] = useMemo(
    () => [
      { id: "fullName", label: "Họ tên", getValue: (r) => r.fullName, defaultSelected: true },
      { id: "email", label: "Email", getValue: (r) => r.email, defaultSelected: true },
      { id: "phone", label: "SĐT", getValue: (r) => r.phone ?? "", defaultSelected: false },
      {
        id: "role",
        label: "Vai trò",
        getValue: (r) => roleLabel(r.role),
        getFilterKey: (r) => r.role,
        filterOptions: [
          { value: "member", label: "Member" },
          { value: "leader", label: "Leader" },
          { value: "admin", label: "Admin" },
        ],
        defaultSelected: true,
      },
      {
        id: "department",
        label: "Ban",
        getValue: (r) => r.departmentName,
        getFilterKey: (r) => r.departmentId,
        filterOptions: DEPTS.map((d) => ({ value: d.id, label: d.name })),
        defaultSelected: true,
      },
      {
        id: "status",
        label: "Trạng thái",
        getValue: (r) => statusLabel(r.status),
        getFilterKey: (r) => r.status,
        filterOptions: [
          { value: "active", label: "Đang hoạt động" },
          { value: "inactive", label: "Tạm nghỉ" },
          { value: "alumni", label: "Cựu thành viên" },
        ],
        defaultSelected: true,
      },
      { id: "generation", label: "Thế hệ", getValue: (r) => r.generation ?? "", defaultSelected: true },
      { id: "joinedAt", label: "Ngày vào CLB", getValue: (r) => formatDate(r.joinedAt), defaultSelected: false },
    ],
    [],
  );

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Quản lý thành viên
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Thành viên chính thức của CLB — bao gồm Member và Leader (trưởng ban / mentor).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" size="sm" className="!h-11" onClick={() => setExportOpen(true)}>
            Xuất danh sách
          </Button>
          <Button variant="primary" size="sm" className="!h-11" onClick={() => setDrawerOpen(true)} leftIcon={<Icon icon={Plus} size={18} />}>
            Thêm thành viên
          </Button>
        </div>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Đang hoạt động" value={stats.total} tone="emerald" icon={UserCheck} />
        <MetricCard label="Leader" value={stats.leaders} tone="sky" icon={Users} />
        <MetricCard label="Member chính thức" value={stats.members} tone="violet" icon={UserRound} />
      </div>

      <div className="flex justify-end">
        <FilterMenu
          activeCount={
            (applied.role ? 1 : 0) + (applied.status ? 1 : 0) + (applied.departmentId ? 1 : 0)
          }
          onApply={() => setApplied(draft)}
          onReset={() => {
            const empty = { role: "" as const, status: "" as const, departmentId: "" };
            setDraft(empty);
            setApplied(empty);
          }}
        >
          <div>
            <span className="neu-field-label">Vai trò</span>
            <Select
              width="full"
              value={draft.role}
              options={[
                { value: "", label: "Tất cả" },
                { value: "member", label: "Member" },
                { value: "leader", label: "Leader" },
                { value: "admin", label: "Admin" },
              ]}
              onChange={(role) => setDraft({ ...draft, role: role as ClubMemberRole | "" })}
            />
          </div>
          <div>
            <span className="neu-field-label">Trạng thái</span>
            <Select
              width="full"
              value={draft.status}
              options={[
                { value: "", label: "Tất cả" },
                { value: "active", label: "Đang hoạt động" },
                { value: "inactive", label: "Tạm nghỉ" },
                { value: "alumni", label: "Cựu TV" },
              ]}
              onChange={(status) => setDraft({ ...draft, status: status as ClubMemberStatus | "" })}
            />
          </div>
          <div>
            <span className="neu-field-label">Ban</span>
            <Select
              width="full"
              value={draft.departmentId}
              options={[
                { value: "", label: "Tất cả" },
                ...DEPTS.map((d) => ({ value: d.id, label: d.name })),
              ]}
              onChange={(departmentId) => setDraft({ ...draft, departmentId })}
            />
          </div>
        </FilterMenu>
      </div>

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : (
        <DataTableShell minWidth={860}>
          <colgroup>
            {MEMBER_COLUMNS.map((c) => (
              <col key={c.id} style={{ width: widths[c.id] }} />
            ))}
          </colgroup>
          <DataTableHead columns={MEMBER_COLUMNS} widths={widths} onResize={setWidth} />
          <tbody>
            {paged.map((m) => (
              <tr key={m.id}>
                <DataTableCell align="left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {initials(m.fullName)}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate font-semibold">{m.fullName}</p>
                      <p className="truncate text-xs text-muted">{m.email}</p>
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-sm">{roleLabel(m.role)}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-sm">{m.departmentName}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-sm text-muted">{m.generation ?? "—"}</span>
                </DataTableCell>
                <DataTableCell>
                  <div className="inline-flex justify-center">
                    <StatusBadge status={m.status} />
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {m.role !== "admin" && (
                      <Select
                        value={m.role}
                        options={[
                          { value: "member", label: "Member" },
                          { value: "leader", label: "Leader" },
                        ]}
                        onChange={async (role) => {
                          await updateClubMemberRole(m.id, role as ClubMemberRole);
                          await load();
                          showToast(`Đã cập nhật vai trò ${m.fullName}.`);
                        }}
                        className="min-w-[110px]"
                        triggerClassName="!h-9 !text-xs"
                      />
                    )}
                    <Select
                      value={m.status}
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Tạm nghỉ" },
                        { value: "alumni", label: "Alumni" },
                      ]}
                      onChange={async (status) => {
                        await setClubMemberStatus(m.id, status as ClubMemberStatus);
                        await load();
                        showToast("Đã cập nhật trạng thái.");
                      }}
                      className="min-w-[110px]"
                      triggerClassName="!h-9 !text-xs"
                    />
                  </div>
                </DataTableCell>
              </tr>
            ))}
          </tbody>
        </DataTableShell>
      )}

      <div className="flex justify-end">
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      <AddMemberDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => {
          showToast("Đã thêm thành viên chính thức.");
          void load();
        }}
      />

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất danh sách thành viên"
        columns={exportColumns}
        rows={filtered}
        filenameBase="thanh_vien_clb"
        onExported={(n) => showToast(`Đã tải ${n} dòng (CSV).`)}
      />
    </>
  );
}

export default AdminMembersPage;
