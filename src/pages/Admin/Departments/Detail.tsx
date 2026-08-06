import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import Select from "../../../components/ui/Select";
import { ROUTES } from "../../../constants/routes";
import { usePortalUi } from "../../../context/usePortalUi";
import { formatDate } from "../../../utils/formatDate";
import {
  appointLeader,
  assignMemberToDepartment,
  getDepartment,
  getDepartmentMembers,
  getLeadershipHistory,
  getUnassignedOfficialMembers,
  removeMemberFromDepartment,
  revokeLeader,
} from "../../../services/departmentsService";
import type {
  ClubDepartment,
  DepartmentMember,
  LeadershipHistoryEvent,
} from "../../../types/departments";

type Tab = "members" | "unassigned" | "leaders" | "history";

export default function AdminDepartmentDetailPage({
  departmentId,
}: {
  departmentId: string;
}) {
  const { navigate } = usePortalUi();
  const [tab, setTab] = useState<Tab>("members");
  const [dept, setDept] = useState<ClubDepartment | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [unassigned, setUnassigned] = useState<DepartmentMember[]>([]);
  const [history, setHistory] = useState<LeadershipHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [appointUserId, setAppointUserId] = useState("");
  const [termLabel, setTermLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, m, u, h] = await Promise.all([
        getDepartment(departmentId),
        getDepartmentMembers(departmentId),
        getUnassignedOfficialMembers(),
        getLeadershipHistory(departmentId),
      ]);
      setDept(d);
      setMembers(m);
      setUnassigned(u);
      setHistory(h);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tải được Ban");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const leaders = useMemo(
    () => members.filter((m) => m.leadershipTitle),
    [members],
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!selected.length) return;
    setBusy(true);
    try {
      for (const id of selected) {
        await assignMemberToDepartment(id, departmentId);
      }
      setSelected([]);
      showToast(`Đã gán ${selected.length} thành viên vào Ban.`);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gán thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Gỡ thành viên khỏi Ban này?")) return;
    setBusy(true);
    try {
      await removeMemberFromDepartment(userId);
      showToast("Đã gỡ khỏi Ban.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gỡ thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleAppoint = async () => {
    if (!appointUserId) {
      showToast("Chọn thành viên thuộc Ban.");
      return;
    }
    setBusy(true);
    try {
      await appointLeader(departmentId, {
        userId: appointUserId,
        title: "head",
        startAt: new Date().toISOString(),
        termLabel: termLabel || undefined,
      });
      setAppointUserId("");
      setTermLabel("");
      showToast("Đã chỉ định Leader.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Chỉ định thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!window.confirm("Thu hồi toàn bộ vai trò Leader của thành viên này?")) {
      return;
    }
    setBusy(true);
    try {
      await revokeLeader(departmentId, userId);
      showToast("Đã thu hồi vai trò Leader.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Thu hồi thất bại");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !dept) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" />;
  }
  if (!dept) {
    return (
      <section className="neu-card !p-8 text-center text-muted">
        Không tìm thấy Ban.
      </section>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "members", label: `Thành viên (${members.length})` },
    { id: "unassigned", label: `Chưa phân ban (${unassigned.length})` },
    { id: "leaders", label: `Leader (${leaders.length})` },
    { id: "history", label: "Lịch sử nhiệm kỳ" },
  ];

  return (
    <section className="space-y-6">
      <Button
        variant="soft"
        size="sm"
        className="!h-10"
        onClick={() => navigate(ROUTES.admin.departments)}
        leftIcon={<Icon icon={ArrowLeft} size={15} />}
      >
        Danh sách Ban
      </Button>

      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Quản lý Ban › <span className="text-foreground/80">{dept.name}</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {dept.name}
        </h1>
        <p className="text-sm text-muted">
          {dept.field || dept.code}
          {dept.headUserName ? ` · Leader: ${dept.headUserName}` : " · Chưa có Leader"}
        </p>
      </header>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {toast}
        </p>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl bg-background p-1 shadow-inset-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-accent/15 text-accent shadow-extruded-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="neu-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/80 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Ngày vào Ban</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{m.fullName}</p>
                    <p className="text-xs text-muted">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {m.leadershipTitle === "head" ? "Leader" : "Member"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {m.departmentJoinedAt
                      ? formatDate(m.departmentJoinedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger-icon"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleRemove(m.id)}
                    >
                      Gỡ
                    </Button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    Ban chưa có thành viên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "unassigned" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={busy || selected.length === 0}
              onClick={() => void handleAssign()}
              leftIcon={<Icon icon={UserPlus} size={16} />}
            >
              Gán {selected.length || ""} vào Ban này
            </Button>
          </div>
          <ul className="neu-card space-y-1 !p-3">
            {unassigned.map((m) => (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/5">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={selected.includes(m.id)}
                    onChange={() => toggle(m.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{m.fullName}</span>
                    <span className="text-xs text-muted">{m.email}</span>
                  </span>
                  <span className="text-xs text-accent">Chính thức</span>
                </label>
              </li>
            ))}
            {unassigned.length === 0 && (
              <li className="px-3 py-10 text-center text-sm text-muted">
                Không còn Member chính thức nào chưa thuộc Ban.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "leaders" && (
        <div className="space-y-4">
          <div className="neu-card space-y-3 !p-5">
            <h2 className="font-display text-lg font-bold">Chỉ định Leader</h2>
            <div className="grid gap-3">
              <Select
                width="full"
                value={appointUserId}
                onChange={setAppointUserId}
                placeholder="Chọn thành viên thuộc Ban"
                options={members.map((m) => ({
                  value: m.id,
                  label: m.fullName,
                }))}
              />
              <input
                className="neu-input !h-11"
                placeholder="Thời hạn nhiệm kỳ (VD: HK1 2026)"
                value={termLabel}
                onChange={(e) => setTermLabel(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => void handleAppoint()}
            >
              Chỉ định
            </Button>
          </div>

          <ul className="neu-card space-y-2 !p-4">
            {leaders.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 shadow-extruded-sm"
              >
                <div>
                  <p className="font-semibold">{m.fullName}</p>
                  <p className="text-xs text-muted">
                    Leader Ban · {m.email}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleRevoke(m.id)}
                >
                  Thu hồi
                </Button>
              </li>
            ))}
            {leaders.length === 0 && (
              <li className="py-8 text-center text-sm text-muted">
                Chưa chỉ định Leader cho Ban này.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "history" && (
        <div className="neu-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/80 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Từ</th>
                <th className="px-4 py-3">Đến</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map((e) => (
                <tr key={e.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium">{e.userName ?? "—"}</td>
                  <td className="px-4 py-3">{e.titleLabel}</td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(e.startAt)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {e.endAt ? formatDate(e.endAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {e.isActive ? (
                      <span className="text-emerald-600">Đang giữ</span>
                    ) : (
                      <span className="text-muted">Đã kết thúc</span>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    Chưa có lịch sử nhiệm kỳ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
