import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Shield, Trash2, UserCog, UserRound, Users } from "lucide-react";
import Button from "../../../components/ui/Button";
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
import MetricCard from "../../../components/ui/MetricCard";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import { usePortalUi } from "../../../context/usePortalUi";
import {
  createManagedAccount,
  deactivateAccount,
  getManagedAccounts,
  updateAccountRole,
} from "../../../services/permissionsService";
import type { AccountRole, ManagedAccount } from "../../../types/permissions";
import { formatDate } from "../../../utils/formatDate";

const PAGE_SIZE = 6;

const ACCOUNT_COLUMNS: DataTableColumn[] = [
  { id: "user", label: "Người dùng", width: 240, minWidth: 160, align: "left" },
  { id: "role", label: "Role", width: 130, minWidth: 90, align: "center" },
  { id: "dept", label: "Ban", width: 150, minWidth: 100, align: "center" },
  { id: "created", label: "Ngày tạo", width: 120, minWidth: 90, align: "center" },
  { id: "actions", label: "Thao tác", width: 220, minWidth: 160, align: "center" },
];

const DEPTS = [
  { id: "dept-tech", name: "Ban Chuyên môn" },
  { id: "dept-media", name: "Ban Truyền thông" },
  { id: "dept-event", name: "Ban Sự kiện" },
  { id: "dept-hr", name: "Ban Nhân sự" },
];

const ROLE_LABEL: Record<AccountRole, string> = {
  admin: "Admin (BCN)",
  leader: "Leader",
  member: "Member",
};

function roleBadgeClass(role: AccountRole) {
  if (role === "admin") return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  if (role === "leader") return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function CreateAccountDrawer({
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
  const [role, setRole] = useState<AccountRole>("member");
  const [departmentId, setDepartmentId] = useState("dept-tech");
  const [password, setPassword] = useState("Temp@123");
  const [isTraining, setIsTraining] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form mỗi lần mở modal (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFullName("");
      setEmail("");
      setRole("member");
      setDepartmentId("dept-tech");
      setPassword("Temp@123");
      setIsTraining(true);
      setError(null);
    }
  }

  if (!open) return null;

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Họ tên là bắt buộc.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Mật khẩu tạm tối thiểu 6 ký tự.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createManagedAccount({
        fullName,
        email,
        role,
        departmentId,
        temporaryPassword: password,
        isTrainingMember: role === "member" ? isTraining : false,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tạo tài khoản.");
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
            <h2 className="font-display text-xl font-extrabold">Cấp tài khoản mới</h2>
            <p className="mt-1 text-sm text-muted">Chọn role và gửi thông tin đăng nhập tạm.</p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:px-6">
          <label className="block space-y-1.5">
            <span className="neu-field-label">Họ và tên *</span>
            <input className="neu-input !h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Email *</span>
            <input
              type="email"
              className="neu-input !h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.iu.edu.vn"
            />
          </label>

          <div>
            <span className="neu-field-label">Role *</span>
            <div className="grid grid-cols-3 gap-2">
              {(["member", "leader", "admin"] as AccountRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold transition-all ${
                    role === r
                      ? "bg-accent/20 text-accent shadow-inset-sm"
                      : "shadow-extruded-sm text-muted hover:text-foreground"
                  }`}
                >
                  {ROLE_LABEL[r]}
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

          {role === "member" && (
            <label className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 shadow-inset-sm text-sm">
              <input
                type="checkbox"
                className="accent-accent"
                checked={isTraining}
                onChange={(e) => setIsTraining(e.target.checked)}
              />
              Tài khoản Member đang training
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="neu-field-label">Mật khẩu tạm *</span>
            <input
              className="neu-input !h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-[11px] text-muted">User nên đổi mật khẩu sau lần đăng nhập đầu.</p>
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <footer className="flex gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" className="flex-1" disabled={saving} onClick={() => void handleSave()}>
            Tạo tài khoản
          </Button>
        </footer>
      </div>
    </div>
  );
}

function AdminPermissionsPage() {
  const { search } = usePortalUi();
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<AccountRole | "">("");
  const [draftRole, setDraftRole] = useState<AccountRole | "">("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ManagedAccount | null>(null);
  const [revoking, setRevoking] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  // loading khởi tạo true — refresh sau thao tác giữ nguyên bảng cũ
  const load = useCallback(async () => {
    try {
      setAccounts(await getManagedAccounts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (roleFilter && a.role !== roleFilter) return false;
      if (
        q &&
        !a.fullName.toLowerCase().includes(q) &&
        !a.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [accounts, search, roleFilter]);

  // Đổi tìm kiếm / lọc role → về trang 1 (adjust state during render)
  const [prevFilterKey, setPrevFilterKey] = useState("");
  const filterKey = `${search}|${roleFilter}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const counts = useMemo(() => {
    return {
      all: accounts.length,
      member: accounts.filter((a) => a.role === "member").length,
      leader: accounts.filter((a) => a.role === "leader").length,
      admin: accounts.filter((a) => a.role === "admin").length,
    };
  }, [accounts]);

  const { widths, setWidth } = useColumnWidths(ACCOUNT_COLUMNS);

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Phân quyền &amp; Tài khoản
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Cấp tài khoản, chọn role (Member / Leader / Admin) và quản lý quyền truy cập portal.
          </p>
        </div>
        <Button variant="primary" onClick={() => setDrawerOpen(true)} leftIcon={<Icon icon={Plus} size={18} />}>
          Cấp tài khoản
        </Button>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tổng TK" value={counts.all} tone="slate" icon={Users} />
        <MetricCard label="Member" value={counts.member} tone="emerald" icon={UserRound} />
        <MetricCard label="Leader" value={counts.leader} tone="sky" icon={UserCog} />
        <MetricCard label="Admin" value={counts.admin} tone="violet" icon={Shield} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Hiển thị <span className="font-semibold text-foreground">{filtered.length}</span> tài khoản
        </p>
        <FilterMenu
          activeCount={roleFilter ? 1 : 0}
          onApply={() => setRoleFilter(draftRole)}
          onReset={() => {
            setDraftRole("");
            setRoleFilter("");
          }}
        >
          <div>
            <span className="neu-field-label">Lọc theo role</span>
            <Select
              width="full"
              value={draftRole}
              options={[
                { value: "", label: "Tất cả" },
                { value: "member", label: "Member" },
                { value: "leader", label: "Leader" },
                { value: "admin", label: "Admin" },
              ]}
              onChange={(v) => setDraftRole(v as AccountRole | "")}
            />
          </div>
        </FilterMenu>
      </div>

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : (
        <DataTableShell minWidth={760}>
          <colgroup>
            {ACCOUNT_COLUMNS.map((c) => (
              <col key={c.id} style={{ width: widths[c.id] }} />
            ))}
          </colgroup>
          <DataTableHead columns={ACCOUNT_COLUMNS} widths={widths} onResize={setWidth} />
          <tbody>
            {paged.map((a) => (
              <tr key={a.id}>
                <DataTableCell align="left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {initials(a.fullName)}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate font-semibold">{a.fullName}</p>
                      <p className="truncate text-xs text-muted">{a.email}</p>
                      {a.isTrainingMember && (
                        <span className="text-[11px] text-accent">Training member</span>
                      )}
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(a.role)}`}>
                    {ROLE_LABEL[a.role]}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-sm">{a.departmentName ?? "—"}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-sm text-muted">{formatDate(a.createdAt)}</span>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Select
                      value={a.role}
                      options={[
                        { value: "member", label: "Member" },
                        { value: "leader", label: "Leader" },
                        { value: "admin", label: "Admin" },
                      ]}
                      onChange={async (role) => {
                        await updateAccountRole(a.id, role as AccountRole);
                        await load();
                        showToast(`Đã đổi role ${a.fullName} → ${ROLE_LABEL[role as AccountRole]}.`);
                      }}
                      className="min-w-[120px]"
                      triggerClassName="!h-9 !text-xs"
                      ariaLabel={`Đổi role ${a.fullName}`}
                    />
                    <Button
                      variant="danger-icon"
                      size="sm"
                      aria-label={`Thu hồi ${a.fullName}`}
                      onClick={() => setRevokeTarget(a)}
                    >
                      <Icon icon={Trash2} size={16} />
                    </Button>
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

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Thu hồi tài khoản"
        message={
          revokeTarget ? (
            <>
              Thu hồi tài khoản <b>{revokeTarget.fullName}</b>? Người này sẽ không đăng nhập được nữa.
            </>
          ) : undefined
        }
        confirmLabel="Thu hồi"
        tone="danger"
        loading={revoking}
        onConfirm={async () => {
          if (!revokeTarget) return;
          setRevoking(true);
          try {
            await deactivateAccount(revokeTarget.id);
            await load();
            showToast("Đã thu hồi tài khoản.");
          } finally {
            setRevoking(false);
            setRevokeTarget(null);
          }
        }}
        onClose={() => setRevokeTarget(null)}
      />

      <CreateAccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => {
          showToast("Đã tạo tài khoản thành công.");
          void load();
        }}
      />
    </>
  );
}

export default AdminPermissionsPage;
