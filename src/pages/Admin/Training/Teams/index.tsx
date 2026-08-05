import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Shuffle, Volume2 } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { usePortalUi } from "../../../../context/usePortalUi";
import MentorManageModal from "./components/MentorManageModal";
import {
  autoAssignTeams,
  getMentors,
  getTrainees,
  getTrainingGroups,
  getTrainingPrograms,
  notifyTrainingGroups,
} from "../../../../services/trainingService";
import type { Trainee, TrainingGroup, TrainingMentor, TrainingProgram } from "../../../../types/training";

// Chia đội NGẪU NHIÊN: hiển thị mentor & tân binh chưa có đội 2 bên, 1 nút random —
// backend trộn Fisher–Yates rồi chia round-robin, không chọn tay để đảm bảo khách quan
function RandomAssignModal({
  open,
  onClose,
  programs,
  mentors,
  trainees,
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  mentors: TrainingMentor[];
  trainees: Trainee[];
  onAssigned: (msg: string) => void;
}) {
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unassigned = trainees.filter((t) => !t.groupId && t.status !== "removed");

  if (!open) return null;

  const handleAssign = async () => {
    setError(null);
    setAssigning(true);
    try {
      const res = await autoAssignTeams(programs[0]?.id);
      onAssigned(`Đã random chia ${res.assigned} tân binh cho ${res.mentors} mentor.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chia đội thất bại — thử lại.");
    } finally {
      setAssigning(false);
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
        aria-labelledby="random-assign-title"
        className="relative z-10 flex max-h-[min(90vh,680px)] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 id="random-assign-title" className="font-display text-xl font-extrabold">
              Chia Đội Ngẫu Nhiên
            </h2>
            <p className="mt-1 text-sm text-muted">
              Tân binh được trộn random và chia đều cho các mentor — không chọn tay.
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2 sm:px-6">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="neu-field-label !mb-0">Mentor</span>
              <span className="text-xs text-muted">{mentors.length}</span>
            </div>
            <ul className="max-h-72 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {mentors.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <Avatar name={m.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="text-xs text-muted">{m.roleLabel}</span>
                  </span>
                </li>
              ))}
              {mentors.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  Chưa có mentor — đẩy quyền mentor cho member trước.
                </li>
              )}
            </ul>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="neu-field-label !mb-0">Tân binh chưa có đội</span>
              <span className="text-xs text-muted">{unassigned.length}</span>
            </div>
            <ul className="max-h-72 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {unassigned.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <Avatar name={t.fullName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.fullName}</span>
                    <span className="text-xs text-muted">{t.cohortLabel ?? t.departmentName}</span>
                  </span>
                </li>
              ))}
              {unassigned.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  Tất cả tân binh đã có đội.
                </li>
              )}
            </ul>
          </section>

          {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}
        </div>

        <footer className="flex gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={assigning || mentors.length === 0 || unassigned.length === 0}
            onClick={() => void handleAssign()}
            leftIcon={<Icon icon={Shuffle} size={16} />}
          >
            {assigning ? "Đang chia..." : "Chia đội random"}
          </Button>
        </footer>
      </div>
    </div>
  );
}

// Chi tiết đội: mentor + danh sách thành viên thật (match trainee theo groupId)
function GroupDetailModal({
  group,
  trainees,
  onClose,
}: {
  group: TrainingGroup | null;
  trainees: Trainee[];
  onClose: () => void;
}) {
  if (!group) return null;
  const members = trainees.filter((t) => t.groupId === group.id);

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
        aria-labelledby="group-detail-title"
        className="relative z-10 flex max-h-[min(90vh,600px)] w-full max-w-md flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 id="group-detail-title" className="font-display text-xl font-extrabold">
              {group.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {group.specialtyLabel ?? group.departmentName} · Mentor: {group.mentorName ?? "—"}
            </p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="neu-field-label !mb-0">Thành viên</span>
            <span className="text-xs text-muted">{members.length}</span>
          </div>
          <ul className="space-y-1 rounded-2xl bg-background p-2 shadow-inset-sm">
            {members.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <Avatar name={t.fullName} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.fullName}</span>
                  <span className="block truncate text-xs text-muted">{t.email}</span>
                </span>
                <span className="text-xs text-muted">{t.departmentName}</span>
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted">Đội chưa có thành viên.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TrainingTeamsPage() {
  const { search } = usePortalUi();
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [mentors, setMentors] = useState<TrainingMentor[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<TrainingGroup | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  // loading khởi tạo true — refresh sau thao tác giữ nguyên dữ liệu cũ
  const load = useCallback(async () => {
    try {
      const [g, p, m, t] = await Promise.all([
        getTrainingGroups(),
        getTrainingPrograms(),
        getMentors(),
        getTrainees(),
      ]);
      setGroups(g);
      setPrograms(p);
      setMentors(m);
      setTrainees(t);
    } finally {
      setLoading(false);
    }
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
        Đào tạo › Thiết lập chương trình › <span className="text-foreground/80">Chia đội</span>
      </nav>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Danh sách Đội Training
          </h1>
          <p className="mt-2 text-muted">Quản lý nhóm tân binh và mentor phụ trách.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            onClick={() => setMentorModalOpen(true)}
          >
            Quản lý mentor
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            onClick={async () => {
              const res = await notifyTrainingGroups(groups.map((g) => g.id));
              showToast(`Đã gửi thông báo tới ${res.sent} đội.`);
            }}
            leftIcon={<Icon icon={Volume2} size={16} />}
          >
            Gửi thông báo
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            onClick={() => setAssignModalOpen(true)}
            leftIcon={<Icon icon={Shuffle} size={16} />}
          >
            Chia đội random
          </Button>
        </div>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <article key={g.id} className="neu-card !p-5 space-y-4">
              <Badge tone="violet">{g.specialtyLabel ?? g.departmentName}</Badge>
              <h3 className="font-display text-xl font-bold">{g.name}</h3>
              <div className="rounded-2xl bg-background px-3 py-3 shadow-inset-sm flex items-center gap-3">
                <Avatar name={g.mentorName ?? "?"} size="md" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Mentor phụ trách</p>
                  <p className="text-sm font-semibold">
                    {g.mentorName ?? "—"}
                    {g.mentorAccepted === false ? (
                      <span className="ml-1 font-normal text-rose-500">(Chưa nhận)</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Thành viên</p>
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
                    <span className="text-sm font-medium">{g.memberIds.length}</span>
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
            onClick={() => setAssignModalOpen(true)}
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-accent/30 text-accent hover:bg-accent/5 transition-colors duration-200"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Icon icon={Shuffle} size={28} />
            </span>
            <span className="font-semibold">Chia đội random</span>
          </button>
        </div>
      )}

      <MentorManageModal
        open={mentorModalOpen}
        onClose={() => setMentorModalOpen(false)}
        onChanged={() => void load()}
      />

      <GroupDetailModal
        group={detailGroup}
        trainees={trainees}
        onClose={() => setDetailGroup(null)}
      />

      <RandomAssignModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        programs={programs}
        mentors={mentors}
        trainees={trainees}
        onAssigned={(msg) => {
          showToast(msg);
          void load();
        }}
      />
    </>
  );
}

export default TrainingTeamsPage;
