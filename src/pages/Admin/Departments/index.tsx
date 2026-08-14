import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Plus, Search, Trash2, TriangleAlert, UserRoundCheck } from "lucide-react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import MetricCard from "../../../components/ui/MetricCard";
import Select from "../../../components/ui/Select";
import { ROUTES } from "../../../constants/routes";
import { usePortalUi } from "../../../context/usePortalUi";
import { useToast } from "../../../context/useToast";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentMembers,
  getDepartments,
  getLeaderVacancies,
  getUnassignedOfficialMembers,
  updateDepartment,
} from "../../../services/departmentsService";
import type {
  ClubDepartment,
  DepartmentMember,
  DepartmentStatus,
} from "../../../types/departments";

const STATUS_LABEL: Record<DepartmentStatus, string> = {
  active: "Đang hoạt động",
  paused: "Tạm ngưng",
};

export default function AdminDepartmentsPage() {
  const { navigate, search } = usePortalUi();
  const toastApi = useToast();
  const [departments, setDepartments] = useState<ClubDepartment[]>([]);
  const [vacancies, setVacancies] = useState<
    (ClubDepartment & { vacantDays: number; overdue: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClubDepartment | null>(null);
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  const [description, setDescription] = useState("");
  const [headcountTarget, setHeadcountTarget] = useState("");
  const [availableMembers, setAvailableMembers] = useState<DepartmentMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [headUserId, setHeadUserId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    toastApi.info(msg);
  };

  const handleDelete = async (d: ClubDepartment) => {
    if (!window.confirm(`Xóa Ban "${d.name}"?`)) return;
    try {
      await deleteDepartment(d.id);
      toastApi.deleted(`Ban ${d.name}`);
      await load();
    } catch (err) {
      toastApi.error(err instanceof Error ? err.message : "Xóa Ban thất bại");
    }
  };

  const load = useCallback(async () => {
    try {
      const [d, v, members] = await Promise.all([
        getDepartments(),
        getLeaderVacancies().catch(() => []),
        getUnassignedOfficialMembers().catch(() => []),
      ]);
      setDepartments(d);
      setVacancies(v);
      setAvailableMembers(members);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.field ?? "").toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
  }, [departments, search]);

  const metrics = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((d) => d.status === "active").length,
      withHead: departments.filter((d) => d.headUserId).length,
      overdue: vacancies.filter((v) => v.overdue).length,
    }),
    [departments, vacancies],
  );

  const filteredAvailableMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return availableMembers;
    return availableMembers.filter(
      (member) =>
        member.fullName.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q),
    );
  }, [availableMembers, memberSearch]);

  const openCreateForm = async () => {
    setEditing(null);
    setName("");
    setField("");
    setDescription("");
    setHeadcountTarget("");
    setSelectedMemberIds([]);
    setHeadUserId("");
    setMemberSearch("");
    setError(null);
    setCreating(true);
    try {
      setAvailableMembers(await getUnassignedOfficialMembers());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách thành viên",
      );
    }
  };

  const openEditForm = async (department: ClubDepartment) => {
    setEditing(department);
    setName(department.name);
    setField(department.field ?? "");
    setDescription(department.description ?? "");
    setHeadcountTarget(
      department.headcountTarget == null ? "" : String(department.headcountTarget),
    );
    setMemberSearch("");
    setSelectedMemberIds([]);
    setHeadUserId(department.headUserId ?? "");
    setError(null);
    setCreating(true);
    try {
      const [currentMembers, unassignedMembers] = await Promise.all([
        getDepartmentMembers(department.id),
        getUnassignedOfficialMembers(),
      ]);
      const memberMap = new Map(
        [...currentMembers, ...unassignedMembers].map((member) => [
          member.id,
          member,
        ]),
      );
      setAvailableMembers([...memberMap.values()]);
      setSelectedMemberIds(currentMembers.map((member) => member.id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được thành viên để cập nhật Ban",
      );
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Tên Ban bắt buộc");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input = {
        name: name.trim(),
        field: field.trim() || undefined,
        description: description.trim() || undefined,
        headcountTarget: headcountTarget ? Number(headcountTarget) : null,
        memberIds: selectedMemberIds,
        headUserId: headUserId || null,
      };
      if (editing) await updateDepartment(editing.id, input);
      else await createDepartment(input);
      setCreating(false);
      setEditing(null);
      setName("");
      setField("");
      setDescription("");
      setHeadcountTarget("");
      setSelectedMemberIds([]);
      setHeadUserId("");
      setMemberSearch("");
      if (editing) toastApi.updated(`Ban ${name.trim() || editing.name}`);
      else toastApi.created(`Ban ${name.trim()}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo Ban thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (d: ClubDepartment) => {
    try {
      await updateDepartment(d.id, {
        status: d.status === "active" ? "paused" : "active",
      });
      showToast(
        d.status === "active"
          ? `Đã tạm ngưng ${d.name}.`
          : `Đã kích hoạt lại ${d.name}.`,
      );
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Tổ chức CLB
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Quản lý Ban
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Tạo Ban, chọn thành viên và chỉ định Leader trong cùng biểu mẫu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => void openCreateForm()}
            leftIcon={<Icon icon={Plus} size={18} />}
          >
            Tạo Ban mới
          </Button>
        </div>
      </header>

      {metrics.overdue > 0 && (
        <p className="flex items-start gap-2 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <Icon icon={TriangleAlert} size={18} className="mt-0.5 shrink-0" />
          Có {metrics.overdue} Ban thiếu Trưởng ban quá 7 ngày — cần chỉ định
          ngay.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tổng Ban" value={String(metrics.total)} icon={Building2} />
        <MetricCard label="Đang hoạt động" value={String(metrics.active)} />
        <MetricCard label="Đã có Trưởng ban" value={String(metrics.withHead)} />
        <MetricCard label="Thiếu head &gt;7 ngày" value={String(metrics.overdue)} />
      </div>

      {loading ? (
        <div className="ui-card h-48 animate-pulse" aria-busy="true" />
      ) : filtered.length === 0 ? (
        <div className="ui-card !p-10 text-center text-sm text-muted">
          Chưa có Ban nào — bấm &quot;Tạo Ban mới&quot; để tạo Ban, chọn Leader và
          thành viên.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => {
            const vacant = vacancies.find((v) => v.id === d.id);
            return (
              <article key={d.id} className="ui-card !p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold">{d.name}</h3>
                    <p className="text-xs text-muted">{d.field || d.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      d.status === "active"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-rose-500/15 text-rose-600"
                    }`}
                  >
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2">
                  {d.description || "Chưa có mô tả."}
                </p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-background px-3 py-2 shadow-hairline">
                    <dt className="text-[10px] uppercase text-muted">Thành viên</dt>
                    <dd className="font-semibold">{d.memberCount ?? 0}</dd>
                  </div>
                  <div className="rounded-xl bg-background px-3 py-2 shadow-hairline">
                    <dt className="text-[10px] uppercase text-muted">Leader</dt>
                    <dd className="truncate font-semibold">
                      {d.headUserName ?? "—"}
                    </dd>
                  </div>
                </dl>
                {vacant?.overdue && (
                  <p className="text-xs text-amber-600">
                    Thiếu Trưởng ban {vacant.vacantDays} ngày
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      navigate(ROUTES.admin.departmentDetail(d.id))
                    }
                  >
                    Chi tiết
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void toggleStatus(d)}
                  >
                    {d.status === "active" ? "Tạm ngưng" : "Kích hoạt"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void openEditForm(d)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger-icon"
                    size="sm"
                    disabled={(d.memberCount ?? 0) > 0}
                    onClick={() => void handleDelete(d)}
                    aria-label={`Xóa ${d.name}`}
                    title={
                      (d.memberCount ?? 0) > 0
                        ? "Chỉ xóa được Ban không còn thành viên"
                        : "Xóa Ban"
                    }
                  >
                    <Icon icon={Trash2} size={15} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={() => setCreating(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-card bg-background p-5 shadow-soft">
            <h2 className="font-display text-xl font-extrabold">
              {editing ? "Sửa Ban" : "Tạo Ban mới"}
            </h2>
            <label className="block space-y-1.5">
              <span className="ui-field-label">Tên Ban *</span>
              <input
                className="ui-input !h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ban Kỹ thuật"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="ui-field-label">Lĩnh vực phụ trách</span>
              <input
                className="ui-input !h-11"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="ui-field-label">Mô tả</span>
              <textarea
                className="ui-input min-h-[80px] !h-auto py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="ui-field-label">Chỉ tiêu nhân sự</span>
              <input
                className="ui-input !h-11"
                type="number"
                min={0}
                value={headcountTarget}
                onChange={(e) => setHeadcountTarget(e.target.value)}
              />
            </label>
            <div className="grid gap-4 border-t border-black/5 pt-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <p className="font-display text-base font-bold">Thành viên Ban</p>
                    <p className="text-xs text-muted">
                      Chọn thành viên chính thức cho Ban. Bỏ chọn để gỡ thành viên
                      hiện có khỏi Ban.
                    </p>
                  </div>
                  <div className="relative">
                    <Icon
                      icon={Search}
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      className="ui-input !h-10 !pl-9"
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                      placeholder="Tìm theo tên hoặc email..."
                    />
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {filteredAvailableMembers.map((member) => {
                      const checked = selectedMemberIds.includes(member.id);
                      return (
                        <label
                          key={member.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${
                            checked
                              ? "bg-accent/10 ring-1 ring-accent/25"
                              : "bg-background shadow-hairline"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setSelectedMemberIds((ids) =>
                                  ids.filter((id) => id !== member.id),
                                );
                                if (headUserId === member.id) setHeadUserId("");
                              } else {
                                setSelectedMemberIds((ids) => [...ids, member.id]);
                              }
                            }}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {member.fullName}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {member.email}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                    {filteredAvailableMembers.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted">
                        Không có thành viên phù hợp.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-display text-base font-bold">Leader của Ban</p>
                    <p className="text-xs text-muted">
                      Leader được tính là một thành viên của Ban.
                    </p>
                  </div>
                  <Select
                    width="full"
                    value={headUserId}
                    onChange={(id) => {
                      setHeadUserId(id);
                      if (id && !selectedMemberIds.includes(id)) {
                        setSelectedMemberIds((ids) => [...ids, id]);
                      }
                    }}
                    options={[
                      { value: "", label: "Chưa chọn Leader" },
                      ...availableMembers.map((member) => ({
                        value: member.id,
                        label: member.fullName,
                      })),
                    ]}
                  />
                  <div className="rounded-2xl bg-background p-4 shadow-hairline">
                    <div className="flex items-center gap-2">
                      <Icon icon={UserRoundCheck} size={18} className="text-accent" />
                      <span className="text-sm font-semibold">
                        {selectedMemberIds.length} thành viên đã chọn
                      </span>
                    </div>
                    {headUserId && (
                      <p className="mt-2 text-xs text-muted">
                        Leader:{" "}
                        <b className="text-foreground">
                          {availableMembers.find((member) => member.id === headUserId)
                            ?.fullName ?? "—"}
                        </b>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                disabled={saving}
                onClick={() => void handleCreate()}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
