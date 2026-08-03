import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Code2,
  FileText,
  Flag,
  GripVertical,
  Pencil,
  Play,
  Plus,
  Rocket,
  Search,
  Timer,
  Trash2,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import Select from "../../../../components/ui/Select";
import {
  createTrainingProgram,
  getTrainingGroups,
  getTrainingPrograms,
} from "../../../../services/trainingService";
import type { LessonKind, TrainingGroup, TrainingLesson, TrainingProgram, TrainingStage } from "../../../../types/training";
import type { LucideIcon } from "lucide-react";

type Mode = "overview" | "create";

const DEPTS = [
  { id: "dept-tech", name: "Ban Kỹ Thuật (Tech)" },
  { id: "dept-media", name: "Ban Truyền thông" },
  { id: "dept-hr", name: "Ban Nhân sự" },
];

const STAGE_ICONS: LucideIcon[] = [Flag, Code2, Rocket];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function lessonMeta(kind?: LessonKind): { icon: LucideIcon; label: string } {
  if (kind === "video") return { icon: Play, label: "Video" };
  if (kind === "practice") return { icon: Code2, label: "Thực hành" };
  return { icon: FileText, label: "Tài liệu đọc" };
}

function RoadmapTimeline({ program }: { program: TrainingProgram }) {
  const stages = [...program.stages].sort((a, b) => a.order - b.order);

  return (
    <section className="neu-card !p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{program.name}</h2>
        <span className="text-muted" aria-hidden>
          <Icon icon={Pencil} size={16} />
        </span>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-accent/30 sm:block" aria-hidden />
        <ul className="space-y-8">
          {stages.map((st, i) => {
            const left = i % 2 === 0;
            const StageIcon = STAGE_ICONS[i % STAGE_ICONS.length];
            const card = (
              <article className="neu-card !p-4 space-y-1 w-full max-w-[240px]">
                <p className="text-xs font-semibold text-accent">{st.weekLabel ?? `Giai đoạn ${st.order}`}</p>
                <p className="font-semibold text-foreground">{st.name}</p>
                {i === 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Đang diễn ra
                  </span>
                )}
              </article>
            );
            return (
              <li
                key={st.id}
                className="relative grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_48px_1fr]"
              >
                <div className={`hidden sm:block ${left ? "justify-self-end" : ""}`}>
                  {left ? card : null}
                </div>
                <div className="relative z-[1] flex justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent shadow-extruded-sm">
                    <Icon icon={StageIcon} size={18} />
                  </span>
                </div>
                <div className={`flex justify-center sm:block ${!left ? "sm:justify-self-start" : ""}`}>
                  <div className="sm:hidden">{card}</div>
                  {!left ? <div className="hidden sm:block">{card}</div> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function GroupSideList({ groups, query }: { groups: TrainingGroup[]; query: string }) {
  const filtered = groups.filter((g) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      (g.mentorName ?? "").toLowerCase().includes(q) ||
      (g.specialtyLabel ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <aside className="neu-card !p-5 space-y-4 h-fit lg:sticky lg:top-24">
      <h3 className="font-display text-base font-bold">Danh sách Nhóm ({filtered.length})</h3>
      <ul className="space-y-3">
        {filtered.map((g) => (
          <li key={g.id} className="rounded-2xl bg-background p-4 shadow-extruded-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{g.name}</p>
                <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                  {g.specialtyLabel ?? g.departmentName ?? "—"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted">
              Mentor:{" "}
              <span className="font-medium text-foreground">
                {g.mentorName ?? "—"}
                {g.mentorAccepted === false ? " (Chưa nhận)" : ""}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {g.memberIds.slice(0, 4).map((id, i) => (
                  <span
                    key={id}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent ring-2 ring-background"
                    style={{ zIndex: 4 - i }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted">{g.memberIds.length} members</span>
            </div>
            {g.memberIds.length === 0 && (
              <button
                type="button"
                className="w-full rounded-xl border border-dashed border-accent/40 py-2 text-xs font-medium text-accent"
              >
                + Thêm thành viên
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

type StageDraft = TrainingStage & { lessons: TrainingLesson[] };

function CreateRoadmapView({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("Onboarding Thành Viên Mới 2024");
  const [deptId, setDeptId] = useState("dept-tech");
  const [stages, setStages] = useState<StageDraft[]>([
    {
      id: uid("st"),
      name: "Giai đoạn 1: Hội nhập",
      order: 1,
      durationWeeks: 2,
      weekLabel: "2 Tuần",
      lessons: [
        {
          id: uid("les"),
          stageId: "",
          title: "Văn hóa câu lạc bộ",
          kind: "doc",
          durationLabel: "30 phút",
        },
        {
          id: uid("les"),
          stageId: "",
          title: "Quy trình làm việc cơ bản",
          kind: "video",
          durationLabel: "45 phút",
        },
      ],
    },
    {
      id: uid("st"),
      name: "Giai đoạn 2: Kỹ năng chuyên môn",
      order: 2,
      durationWeeks: 3,
      weekLabel: "3 Tuần",
      lessons: [
        {
          id: uid("les"),
          stageId: "",
          title: "Git & Github Flow",
          kind: "practice",
          durationLabel: "2 giờ",
        },
      ],
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        id: uid("st"),
        name: `Giai đoạn ${prev.length + 1}`,
        order: prev.length + 1,
        durationWeeks: 2,
        weekLabel: "2 Tuần",
        lessons: [],
      },
    ]);
  };

  const addLesson = (stageId: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id !== stageId
          ? s
          : {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: uid("les"),
                  stageId,
                  title: "Bài học mới",
                  kind: "doc",
                  durationLabel: "30 phút",
                },
              ],
            },
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên lộ trình là bắt buộc.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dept = DEPTS.find((d) => d.id === deptId)!;
      const flatStages: TrainingStage[] = stages.map(({ lessons: _l, ...st }, i) => ({
        ...st,
        order: i + 1,
      }));
      const lessons: TrainingLesson[] = stages.flatMap((s) =>
        s.lessons.map((l) => ({ ...l, stageId: s.id })),
      );
      await createTrainingProgram({
        name: name.trim(),
        departmentId: dept.id,
        departmentName: dept.name,
        stages: flatStages,
        lessons,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">
        Đào tạo › Thiết lập › <span className="text-foreground/80">Tạo lộ trình</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Tạo Lộ Trình Đào Tạo</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            Lưu Lộ Trình
          </Button>
        </div>
      </header>

      <section className="neu-card !p-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 block">
          <span className="neu-field-label">Tên lộ trình</span>
          <input className="neu-input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div>
          <span className="neu-field-label">Ban áp dụng</span>
          <Select
            width="full"
            value={deptId}
            options={DEPTS.map((d) => ({ value: d.id, label: d.name }))}
            onChange={setDeptId}
          />
        </div>
      </section>

      <div className="relative space-y-5 pl-2">
        <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-accent/25" aria-hidden />
        {stages.map((st, idx) => (
          <article key={st.id} className="relative neu-card !p-5 space-y-4 ml-10">
            <span className="absolute -left-[42px] top-5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent shadow-extruded-sm">
              {idx + 1}
            </span>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                className="neu-input !h-11 font-semibold max-w-md"
                value={st.name}
                onChange={(e) =>
                  setStages((prev) =>
                    prev.map((s) => (s.id === st.id ? { ...s, name: e.target.value } : s)),
                  )
                }
              />
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="rounded-full bg-background px-3 py-1.5 shadow-inset-sm inline-flex items-center gap-1.5">
                  <Icon icon={Timer} size={14} /> {st.durationWeeks ?? 2} Tuần
                </span>
                <Button
                  variant="danger-icon"
                  size="sm"
                  aria-label="Xóa giai đoạn"
                  onClick={() => setStages((prev) => prev.filter((s) => s.id !== st.id))}
                >
                  <Icon icon={Trash2} size={16} />
                </Button>
              </div>
            </div>

            <ul className="space-y-2">
              {st.lessons.map((les) => {
                const meta = lessonMeta(les.kind);
                return (
                  <li
                    key={les.id}
                    className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 shadow-inset-sm"
                  >
                    <span className="text-muted" aria-hidden>
                      <Icon icon={GripVertical} size={16} />
                    </span>
                    <span className="text-accent" aria-hidden>
                      <Icon icon={meta.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        className="w-full bg-transparent font-medium outline-none"
                        value={les.title}
                        onChange={(e) =>
                          setStages((prev) =>
                            prev.map((s) =>
                              s.id !== st.id
                                ? s
                                : {
                                    ...s,
                                    lessons: s.lessons.map((l) =>
                                      l.id === les.id ? { ...l, title: e.target.value } : l,
                                    ),
                                  },
                            ),
                          )
                        }
                      />
                      <p className="text-xs text-muted">
                        {meta.label} • {les.durationLabel}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => addLesson(st.id)}
              className="w-full rounded-2xl border border-dashed border-accent/40 py-3 text-sm font-medium text-accent hover:bg-accent/5 inline-flex items-center justify-center gap-2"
            >
              <Icon icon={Plus} size={16} /> Thêm bài học / tài liệu
            </button>
          </article>
        ))}

        <button
          type="button"
          onClick={addStage}
          className="ml-10 flex w-[calc(100%-2.5rem)] items-center justify-center gap-3 rounded-card bg-background py-6 shadow-extruded-sm text-accent font-semibold hover:-translate-y-px transition-all"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
            <Icon icon={Plus} size={20} />
          </span>
          Thêm Giai Đoạn Mới
        </button>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}

function TrainingRoadmapPage() {
  const [mode, setMode] = useState<Mode>("overview");
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [programId, setProgramId] = useState("");
  const [groupQuery, setGroupQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [progs, grps] = await Promise.all([getTrainingPrograms(), getTrainingGroups()]);
      setPrograms(progs);
      setGroups(grps);
      setProgramId((prev) => (prev && progs.some((p) => p.id === prev) ? prev : progs[0]?.id ?? ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const program = useMemo(
    () => programs.find((p) => p.id === programId) ?? programs[0],
    [programs, programId],
  );

  const relatedGroups = useMemo(() => {
    if (!program) return groups;
    return groups.filter((g) => g.programId === program.id || g.departmentId === program.departmentId);
  }, [groups, program]);

  if (mode === "create") {
    return (
      <CreateRoadmapView
        onCancel={() => setMode("overview")}
        onSaved={() => {
          setToast("Đã lưu lộ trình đào tạo.");
          window.setTimeout(() => setToast(null), 2500);
          setMode("overview");
          void load();
        }}
      />
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Thiết lập chương trình
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Xây dựng lộ trình training và theo dõi nhóm tân binh theo từng ban.
          </p>
        </div>
        <Button variant="primary" onClick={() => setMode("create")} leftIcon={<Icon icon={Plus} size={18} />}>
          Tạo lộ trình mới
        </Button>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={programId}
          options={programs.map((p) => ({ value: p.id, label: p.name }))}
          onChange={setProgramId}
          className="min-w-[260px]"
          triggerClassName="!h-11"
        />
        <label className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" aria-hidden>
            <Icon icon={Search} size={16} />
          </span>
          <input
            className="neu-input !h-11 pl-11 text-sm"
            placeholder="Tìm kiếm nhóm, mentor..."
            value={groupQuery}
            onChange={(e) => setGroupQuery(e.target.value)}
          />
        </label>
      </div>

      {loading || !program ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <RoadmapTimeline program={program} />
          <GroupSideList groups={relatedGroups} query={groupQuery} />
        </div>
      )}
    </>
  );
}

export default TrainingRoadmapPage;
