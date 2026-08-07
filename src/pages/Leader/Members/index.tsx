import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { useToast } from "../../../context/useToast";
import {
  assignMyDepartmentMember,
  getMyLedDepartment,
  removeMyDepartmentMember,
  updateMyDepartmentMember,
} from "../../../services/departmentsService";
import type { ClubDepartment, DepartmentMember } from "../../../types/departments";

export default function LeaderMembersPage() {
  const toast = useToast();
  const [department, setDepartment] = useState<ClubDepartment | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [unassigned, setUnassigned] = useState<DepartmentMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyLedDepartment();
      setDepartment(data.department);
      setMembers(data.members);
      setUnassigned(data.unassigned);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được Ban.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <section className="neu-card !p-8 text-center text-muted">{error}</section>;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ban đang phụ trách</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{department?.name ?? "Đang tải..."}</h1>
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Thêm Member chưa phân Ban và gỡ thành viên khỏi Ban.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAdd((v) => !v)}
          leftIcon={<Icon icon={Plus} size={16} />}
        >
          Thêm thành viên
        </Button>
      </header>

      {showAdd && (
        <div className="neu-card space-y-3 !p-4">
          <h2 className="font-display text-lg font-bold">Member chưa phân Ban</h2>
          {unassigned.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 shadow-extruded-sm">
              <div>
                <p className="font-semibold">{m.fullName}</p>
                <p className="text-xs text-muted">{m.email}</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  try {
                    await assignMyDepartmentMember(m.id);
                    toast.success(`Đã thêm ${m.fullName} vào Ban.`);
                    await load();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Thêm thành viên thất bại.");
                  }
                }}
              >
                Thêm
              </Button>
            </div>
          ))}
          {unassigned.length === 0 && <p className="py-5 text-center text-sm text-muted">Không có Member chưa phân Ban.</p>}
        </div>
      )}

      <div className="neu-card !p-0 overflow-x-auto">
        <table className="data-table w-full min-w-[620px] text-sm">
          <thead className="text-left text-xs uppercase">
            <tr>
              <th className="data-table-th px-4 py-3">Thành viên</th>
              <th className="data-table-th px-4 py-3">Email</th>
              <th className="data-table-th px-4 py-3">SĐT</th>
              <th className="data-table-th px-4 py-3">Vai trò</th>
              <th className="data-table-th px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="data-table-td px-4 py-3 font-semibold">{m.fullName}</td>
                <td className="data-table-td px-4 py-3 text-muted">{m.email}</td>
                <td className="data-table-td px-4 py-3 text-muted">{m.phone || "—"}</td>
                <td className="data-table-td px-4 py-3">
                  {m.leadershipTitle ? (
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
                      Leader
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                      Member
                    </span>
                  )}
                </td>
                <td className="data-table-td px-4 py-3 text-right">
                  {!m.leadershipTitle && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="icon"
                        size="sm"
                        aria-label={`Sửa ${m.fullName}`}
                        onClick={async () => {
                          const name = window.prompt("Họ tên", m.fullName);
                          if (!name) return;
                          const phone = window.prompt("Số điện thoại", m.phone || "");
                          if (phone === null) return;
                          try {
                            await updateMyDepartmentMember(m.id, { name, phone });
                            toast.success("Đã cập nhật thành viên.");
                            await load();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Cập nhật thất bại.");
                          }
                        }}
                      >
                        <Icon icon={Pencil} size={15} />
                      </Button>
                      <Button
                        variant="danger-icon"
                        size="sm"
                        aria-label={`Gỡ ${m.fullName}`}
                        onClick={async () => {
                          if (!window.confirm(`Gỡ ${m.fullName} khỏi Ban?`)) return;
                          try {
                            await removeMyDepartmentMember(m.id);
                            toast.success("Đã gỡ thành viên khỏi Ban.");
                            await load();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Gỡ thành viên thất bại.");
                          }
                        }}
                      >
                        <Icon icon={Trash2} size={15} />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  <Icon icon={Users} size={20} className="mx-auto mb-2" />
                  Ban chưa có thành viên chính thức.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
