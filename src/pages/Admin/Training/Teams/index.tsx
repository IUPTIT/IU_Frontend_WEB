import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2, UserCog, Volume2 } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import Select from "../../../../components/ui/Select";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import EditGroupModal from "./components/EditGroupModal";
import CreateGroupModal from "./components/CreateGroupModal";
import MentorManageModal from "./components/MentorManageModal";
import {
  deleteTrainingGroup,
  getMentors,
  getTrainees,
  getTrainingGroups,
  getTrainingPrograms,
  notifyTrainingGroups,
} from "../../../../services/trainingService";
import { getDepartments } from "../../../../services/departmentsService";
import { getCampaigns } from "../../../../services/recruitmentService";
import type { RecruitmentCampaign } from "../../../../types/recruitment";
import type { ClubDepartment } from "../../../../types/departments";
import type {
  Trainee,
  TrainingGroup,
  TrainingMentor,
  TrainingProgram,
} from "../../../../types/training";

// Chi tiết đội: Mentor + danh sách thành viên thật (match trainee theo groupId)
function GroupDetailModal({
  group,
  trainees,
  onClose,
  onEdit,
  onDelete,
}: {
  group: TrainingGroup | null;
  trainees: Trainee[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!group) return null;
  const members = trainees.filter((t) => t.groupId === group.id);

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
        aria-labelledby="group-detail-title"
        className="relative z-10 flex max-h-[min(90vh,600px)] w-full max-w-md flex-col overflow-hidden rounded-card bg-background shadow-soft"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="group-detail-title"
              className="font-display text-xl font-extrabold"
            >
              {group.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {group.specialtyLabel ?? group.departmentName} · Mentor:{" "}
              {group.mentorName ?? "—"}
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="ui-field-label !mb-0">Thành viên</span>
            <span className="text-xs text-muted">{members.length}</span>
          </div>
          <ul className="space-y-1 rounded-2xl bg-background p-2 shadow-hairline">
            {members.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              >
                <Avatar name={t.fullName} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {t.fullName}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {t.email}
                  </span>
                </span>
                <span className="text-xs text-muted">{t.departmentName}</span>
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted">
                Đội chưa có thành viên.
              </li>
            )}
          </ul>
        </div>
        <footer className="space-y-2 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button
            variant="primary"
            className="w-full"
            leftIcon={<Icon icon={Pencil} size={16} />}
            onClick={onEdit}
          >
            Chỉnh sửa nhóm / Mentor
          </Button>
          <Button
            variant="secondary"
            className="w-full !text-rose-600"
            leftIcon={<Icon icon={Trash2} size={16} />}
            onClick={onDelete}
          >
            Xóa đội
          </Button>
        </footer>
      </div>
    </div>
  );
}

function TrainingTeamsPage() {
  const { search } = usePortalUi();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  // Đợt tuyển: user chọn thì ưu tiên, không thì lấy đợt đang mở / mới nhất
  const [campaignIdOverride, setCampaignIdOverride] = useState("");
  const campaignId = useMemo(() => {
    if (
      campaignIdOverride &&
      campaigns.some((c) => c.id === campaignIdOverride)
    ) {
      return campaignIdOverride;
    }
    return campaigns.find((c) => c.isActive)?.id ?? campaigns[0]?.id ?? "";
  }, [campaignIdOverride, campaigns]);
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [mentors, setMentors] = useState<TrainingMentor[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [departments, setDepartments] = useState<ClubDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [mentorManageOpen, setMentorManageOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<TrainingGroup | null>(null);
  const [editGroup, setEditGroup] = useState<TrainingGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<TrainingGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  // loading khởi tạo true — refresh sau thao tác giữ nguyên dữ liệu cũ
  const load = useCallback(async () => {
    try {
      const [g, p, m, t, d] = await Promise.all([
        getTrainingGroups(campaignId || undefined),
        getTrainingPrograms(),
        getMentors(),
        getTrainees(undefined, campaignId || undefined),
        getDepartments("active").catch(() => []),
      ]);
      setGroups(g);
      setPrograms(p);
      setMentors(m);
      setTrainees(t);
      setDepartments(d);
    } catch (err) {
      // Không báo lỗi thì state rỗng và form tạo đội trông như bị hỏng
      toast.error(
        err instanceof Error
          ? `Không tải được dữ liệu: ${err.message}`
          : "Không tải được dữ liệu đào tạo.",
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast]);

  useEffect(() => {
    let alive = true;
    void getCampaigns().then((data) => {
      // Chỉ đợt đã publish/closed mới có tân binh thực tế
      if (alive) setCampaigns(data.filter((c) => c.status !== "draft"));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.mentorName ?? "").toLowerCase().includes(q) ||
        (g.specialtyLabel ?? "").toLowerCase().includes(q),
    );
  }, [groups, search]);

  return (
    <>
      <nav className="text-sm text-muted">
        Tuyển dụng › Training tân binh ›{" "}
        <span className="text-foreground/80">Chia đội & phân Mentor</span>
      </nav>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Danh sách Đội Training
            </h1>
            <Select
              value={campaignId}
              options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
              onChange={setCampaignIdOverride}
              placeholder="Chọn đợt tuyển"
              ariaLabel="Bộ lọc theo đợt tuyển"
              className="min-w-[220px]"
              triggerClassName="!shadow-soft-sm !h-10 text-accent !font-semibold"
            />
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Tạo đội, thêm tân binh và chỉ định Mentor cho từng đội.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            disabled={groups.length === 0}
            title={
              groups.length === 0
                ? "Chưa có đội nào để gửi thông báo"
                : "Gửi thông báo tới các đội"
            }
            onClick={async () => {
              if (groups.length === 0) return;
              try {
                const res = await notifyTrainingGroups(groups.map((g) => g.id));
                toast.success(`Đã gửi thông báo tới ${res.sent} đội.`);
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Gửi thông báo thất bại — thử lại.",
                );
              }
            }}
            leftIcon={<Icon icon={Volume2} size={16} />}
          >
            Gửi thông báo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            onClick={() => setMentorManageOpen(true)}
            leftIcon={<Icon icon={UserCog} size={16} />}
          >
            Quản lý Mentor
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            onClick={() => setCreateOpen(true)}
            leftIcon={<Icon icon={Plus} size={16} />}
          >
            Tạo đội
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="ui-card h-64 animate-pulse" aria-busy="true" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <article key={g.id} className="ui-card !p-5 space-y-4">
              <Badge tone="violet">
                {g.specialtyLabel ?? g.departmentName}
              </Badge>
              <h3 className="font-display text-xl font-bold">{g.name}</h3>
              <div className="rounded-2xl bg-background px-3 py-3 shadow-hairline flex items-center gap-3">
                <Avatar name={g.mentorName ?? "?"} size="md" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    Mentor phụ trách
                  </p>
                  <p className="text-sm font-semibold">
                    {g.mentorName ?? "—"}
                    {g.mentorAccepted === false ? (
                      <span className="ml-1 font-normal text-rose-500">
                        (Chưa nhận)
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    Thành viên
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {trainees
                        .filter((t) => t.groupId === g.id)
                        .slice(0, 4)
                        .map((t) => (
                          <Avatar
                            key={t.id}
                            name={t.fullName}
                            size="sm"
                            className="ring-2 ring-background"
                          />
                        ))}
                    </div>
                    <span className="text-sm font-medium">
                      {g.memberIds.length}
                    </span>
                  </div>
                </div>
                <Button
                  variant="icon"
                  size="sm"
                  aria-label={`Chi tiết ${g.name}`}
                  onClick={() => setDetailGroup(g)}
                >
                  <Icon icon={ChevronRight} size={16} />
                </Button>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-accent/30 px-4 text-center text-accent hover:bg-accent/5 transition-colors duration-200"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Icon icon={Plus} size={28} />
            </span>
            <span className="font-semibold">Tạo đội mới</span>
            <span className="text-xs font-normal text-muted">
              Chọn tân binh và chỉ định Mentor training
            </span>
          </button>
        </div>
      )}

      <GroupDetailModal
        group={detailGroup}
        trainees={trainees}
        onClose={() => setDetailGroup(null)}
        onEdit={() => {
          setEditGroup(detailGroup);
          setDetailGroup(null);
        }}
        onDelete={() => {
          setDeleteGroup(detailGroup);
          setDetailGroup(null);
        }}
      />

      <ConfirmDialog
        open={deleteGroup !== null}
        title="Xóa đội training"
        message={
          deleteGroup
            ? `Xóa đội "${deleteGroup.name}"? Tân binh sẽ về trạng thái chưa chia đội; Mentor có thể bị gỡ quyền nếu không còn đội nào.`
            : ""
        }
        confirmLabel="Xóa đội"
        tone="danger"
        loading={deleting}
        onConfirm={() => {
          void (async () => {
            if (!deleteGroup) return;
            setDeleting(true);
            try {
              await deleteTrainingGroup(deleteGroup.id);
              toast.success(`Đã xóa đội "${deleteGroup.name}".`);
              setDeleteGroup(null);
              void load();
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Xóa đội thất bại.",
              );
            } finally {
              setDeleting(false);
            }
          })();
        }}
        onClose={() => setDeleteGroup(null)}
      />

      <EditGroupModal
        open={editGroup !== null}
        group={editGroup}
        trainees={trainees}
        mentors={mentors}
        programs={programs}
        onClose={() => setEditGroup(null)}
        onSaved={(msg) => {
          toast.success(msg);
          void load();
        }}
      />

      <CreateGroupModal
        open={createOpen}
        trainees={trainees}
        mentors={mentors}
        departments={departments}
        campaignId={campaignId || undefined}
        onClose={() => setCreateOpen(false)}
        onSaved={(msg) => {
          toast.success(msg);
          void load();
        }}
      />

      <MentorManageModal
        open={mentorManageOpen}
        onClose={() => setMentorManageOpen(false)}
        onChanged={() => void load()}
      />
    </>
  );
}

export default TrainingTeamsPage;
