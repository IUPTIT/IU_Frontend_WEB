import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, Handshake, Megaphone, Plus, ChevronRight, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import Select from "../../../../components/ui/Select";
import { usePortalUi } from "../../../../context/PortalUiContext";
import {
  createTrainingGroup,
  getMentors,
  getTrainees,
  getTrainingGroups,
  getTrainingPrograms,
  notifyTrainingGroups,
} from "../../../../services/trainingService";
import type { Trainee, TrainingGroup, TrainingMentor, TrainingProgram } from "../../../../types/training";

const DEPT_CARDS: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "dept-tech", name: "Tech", icon: Code2 },
  { id: "dept-media", name: "Media", icon: Megaphone },
  { id: "dept-hr", name: "HR", icon: Handshake },
];

function CreateGroupDrawer({
  open,
  onClose,
  programs,
  mentors,
  trainees,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  mentors: TrainingMentor[];
  trainees: Trainee[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("Team Alpha");
  const [deptId, setDeptId] = useState("dept-tech");
  const [mentorId, setMentorId] = useState("");
  const [programId, setProgramId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("Team Alpha");
    setDeptId("dept-tech");
    setMentorId(mentors[0]?.id ?? "");
    setProgramId(programs[0]?.id ?? "");
    setMemberIds([]);
    setQ("");
    setError(null);
  }, [open, mentors, programs]);

  const deptMentors = mentors.filter((m) => m.departmentId === deptId);
  const unassigned = trainees.filter(
    (t) => t.departmentId === deptId && (!t.groupId || memberIds.includes(t.id)),
  );
  const filteredMembers = unassigned.filter((t) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return t.fullName.toLowerCase().includes(s) || t.email.toLowerCase().includes(s);
  });

  const mentor = mentors.find((m) => m.id === mentorId);
  const dept = DEPT_CARDS.find((d) => d.id === deptId);

  if (!open) return null;

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên nhóm là bắt buộc.");
      return;
    }
    if (!mentorId) {
      setError("Chọn mentor phụ trách.");
      return;
    }
    setSaving(true);
    try {
      await createTrainingGroup({
        name: name.trim(),
        programId: programId || programs[0]?.id || "prog-1",
        departmentId: deptId,
        departmentName: dept?.name ? `Ban ${dept.name}` : deptId,
        specialtyLabel: `Chuyên môn: ${dept?.name ?? ""}`,
        mentorId,
        mentorName: mentor?.name,
        memberIds,
      });
      onSaved();
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
        aria-labelledby="create-group-title"
        className="relative z-10 flex max-h-[min(90vh,680px)] w-full max-w-xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
          <div>
            <h2 id="create-group-title" className="font-display text-xl font-extrabold">
              Chia Đội Mới
            </h2>
            <p className="mt-1 text-sm text-muted">Thiết lập nhóm training và chọn tân binh.</p>
          </div>
          <Button variant="icon" size="sm" aria-label="Đóng" onClick={onClose}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:px-6">
          <label className="block space-y-1.5">
            <span className="neu-field-label">Tên nhóm</span>
            <input className="neu-input !h-11" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="neu-field-label">Ban chuyên môn</span>
              <Select
                width="full"
                value={deptId}
                options={DEPT_CARDS.map((d) => ({ value: d.id, label: d.name }))}
                onChange={(id) => {
                  setDeptId(id);
                  setMemberIds([]);
                  const m = mentors.find((x) => x.departmentId === id);
                  setMentorId(m?.id ?? "");
                }}
              />
            </div>
            <div>
              <span className="neu-field-label">Mentor phụ trách</span>
              <Select
                width="full"
                value={mentorId}
                options={deptMentors.map((m) => ({ value: m.id, label: m.name }))}
                onChange={setMentorId}
                placeholder="Chọn mentor"
              />
            </div>
          </div>

          {programs.length > 1 && (
            <div>
              <span className="neu-field-label">Lộ trình</span>
              <Select
                width="full"
                value={programId}
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
                onChange={setProgramId}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="neu-field-label !mb-0">Chọn thành viên</span>
              <span className="text-xs text-muted">{memberIds.length} đã chọn</span>
            </div>
            <input
              className="neu-input !h-10 text-sm"
              placeholder="Tìm tân binh..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {filteredMembers.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/8">
                    <Avatar name={t.fullName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{t.fullName}</span>
                      <span className="text-xs text-muted">{t.cohortLabel ?? t.departmentName}</span>
                    </span>
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={memberIds.includes(t.id)}
                      onChange={() => toggleMember(t.id)}
                    />
                  </label>
                </li>
              ))}
              {filteredMembers.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">Không có tân binh phù hợp.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl bg-accent/8 p-4 space-y-2 shadow-inset-sm">
            <p className="font-bold text-accent">{name || "Nhóm mới"}</p>
            <p className="text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                {dept ? <Icon icon={dept.icon} size={14} /> : null} Ban {dept?.name} · Mentor: {mentor?.name ?? "—"}
              </span>            </p>
            <p className="text-xs text-muted">Thành viên: {memberIds.length}</p>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <footer className="flex gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" className="flex-1" disabled={saving} onClick={() => void handleSave()}>
            Lưu Nhóm
          </Button>
        </footer>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
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
            onClick={async () => {
              const res = await notifyTrainingGroups(groups.map((g) => g.id));
              showToast(`Đã gửi thông báo tới ${res.sent} đội (mock).`);
            }}
            leftIcon={<Icon icon={Volume2} size={16} />}
          >
            Gửi thông báo
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            onClick={() => setDrawerOpen(true)}
            leftIcon={<Icon icon={Plus} size={16} />}
          >
            Chia đội mới
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
                      {g.memberIds.slice(0, 4).map((id, i) => (
                        <Avatar
                          key={id}
                          name={String.fromCharCode(65 + i)}
                          size="sm"
                          className="ring-2 ring-background"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{g.memberIds.length}</span>
                  </div>
                </div>
                <Button variant="icon" size="sm" aria-label={`Chi tiết ${g.name}`}>
                  <Icon icon={ChevronRight} size={16} />
                </Button>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-accent/30 text-accent hover:bg-accent/5 transition-colors duration-200"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Icon icon={Plus} size={28} />
            </span>
            <span className="font-semibold">Tạo đội mới</span>
          </button>
        </div>
      )}

      <CreateGroupDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        programs={programs}
        mentors={mentors}
        trainees={trainees}
        onSaved={() => {
          showToast("Đã lưu nhóm training.");
          void load();
        }}
      />
    </>
  );
}

export default TrainingTeamsPage;
