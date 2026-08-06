import { useEffect, useState } from "react";
import {
  Code2,
  FileText,
  Play,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Select from "./ui/Select";
import {
  createTrainingProgram,
  getTrainees,
  updateTrainingProgram,
} from "../services/trainingService";
import { getDepartments } from "../services/departmentsService";
import type {
  LessonKind,
  TrainingLesson,
  TrainingProgram,
  TrainingStage,
} from "../types/training";

const DEFAULT_DEPTS = [
  { id: "Ban Chuyên môn", name: "Ban Chuyên môn" },
  { id: "Ban Truyền thông", name: "Ban Truyền thông" },
  { id: "Ban Nhân sự", name: "Ban Nhân sự" },
];

const KIND_OPTIONS: { value: LessonKind; label: string }[] = [
  { value: "doc", label: "Tài liệu đọc" },
  { value: "video", label: "Video" },
  { value: "practice", label: "Thực hành" },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function lessonMeta(kind?: LessonKind): { icon: LucideIcon; label: string } {
  if (kind === "video") return { icon: Play, label: "Video" };
  if (kind === "practice") return { icon: Code2, label: "Thực hành" };
  return { icon: FileText, label: "Tài liệu đọc" };
}

function emptyStage(order: number): StageDraft {
  const id = uid("st");
  return {
    id,
    name: `Giai đoạn ${order}`,
    order,
    durationWeeks: 2,
    weekLabel: "2 Tuần",
    lessons: [
      {
        id: uid("les"),
        stageId: id,
        title: "Bài học mới",
        kind: "doc",
        durationLabel: "30 phút",
      },
    ],
  };
}

function programToStages(program: TrainingProgram): StageDraft[] {
  const sorted = [...program.stages].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return [emptyStage(1)];
  return sorted.map((st) => ({
    ...st,
    lessons: program.lessons.filter((l) => l.stageId === st.id),
  }));
}

type StageDraft = TrainingStage & { lessons: TrainingLesson[] };

type Props = {
  breadcrumb?: string;
  /** Có → chế độ sửa; không → tạo mới */
  initialProgram?: TrainingProgram;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Trình dựng lộ trình training — create/edit đầy đủ field BE (stage, lesson, duration, kind).
 */
function RoadmapBuilder({
  breadcrumb = "Vòng training › Tạo lộ trình",
  initialProgram,
  onCancel,
  onSaved,
}: Props) {
  const isEdit = Boolean(initialProgram);
  const [name, setName] = useState(
    initialProgram?.name ?? "Lộ trình training của tôi",
  );
  const [passThresholdPercent, setPassThresholdPercent] = useState(
    initialProgram?.passThresholdPercent ?? 80,
  );
  const [depts, setDepts] = useState(DEFAULT_DEPTS);
  const [deptId, setDeptId] = useState(
    initialProgram?.departmentName ?? DEFAULT_DEPTS[0].id,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<StageDraft[]>(() =>
    initialProgram ? programToStages(initialProgram) : [emptyStage(1)],
  );

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await getDepartments("active");
        if (!alive || list.length === 0) throw new Error("empty");
        const mapped = list.map((d) => ({ id: d.name, name: d.name }));
        setDepts(mapped);
        setDeptId((prev) =>
          mapped.some((d) => d.id === prev) ? prev : mapped[0].id,
        );
        return;
      } catch {
        /* fallback */
      }
      const trainees = await getTrainees().catch(() => []);
      if (!alive || trainees.length === 0) return;
      const unique = [
        ...new Set(trainees.map((t) => t.departmentName).filter(Boolean)),
      ];
      if (!unique.length) return;
      setDepts(unique.map((n) => ({ id: n, name: n })));
      setDeptId((prev) => (unique.includes(prev) ? prev : unique[0]));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setStageDuration = (stageId: string, weeks: number) => {
    const n = Math.max(1, Math.min(52, weeks || 1));
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, durationWeeks: n, weekLabel: `${n} Tuần` }
          : s,
      ),
    );
  };

  const addStage = () => {
    setStages((prev) => [...prev, emptyStage(prev.length + 1)]);
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
                  kind: "doc" as LessonKind,
                  durationLabel: "30 phút",
                },
              ],
            },
      ),
    );
  };

  const removeLesson = (stageId: string, lessonId: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id !== stageId
          ? s
          : { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) },
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên lộ trình là bắt buộc.");
      return;
    }
    if (stages.length === 0) {
      setError("Cần ít nhất một giai đoạn.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dept = depts.find((d) => d.id === deptId) ?? {
        id: deptId,
        name: deptId,
      };
      const flatStages: TrainingStage[] = stages.map((stage, i) => {
        const { lessons: _lessons, ...st } = stage;
        void _lessons;
        return {
          ...st,
          order: i + 1,
          weekLabel: st.weekLabel || `${st.durationWeeks ?? 2} Tuần`,
        };
      });
      const lessons: TrainingLesson[] = stages.flatMap((s) =>
        s.lessons.map((l) => ({
          ...l,
          stageId: s.id,
          kind: l.kind ?? "doc",
          durationLabel: l.durationLabel?.trim() || "30 phút",
        })),
      );
      const payload = {
        name: name.trim(),
        departmentId: dept.id,
        departmentName: dept.name,
        passThresholdPercent,
        stages: flatStages,
        lessons,
      };
      if (initialProgram) {
        await updateTrainingProgram(initialProgram.id, payload);
      } else {
        await createTrainingProgram(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Lưu lộ trình thất bại — thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">{breadcrumb}</nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {isEdit ? "Sửa Lộ Trình Training" : "Tạo Lộ Trình Training"}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving
              ? "Đang lưu..."
              : isEdit
                ? "Cập nhật lộ trình"
                : "Lưu Lộ Trình"}
          </Button>
        </div>
      </header>

      <section className="neu-card !p-6 grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5 block">
          <span className="neu-field-label">Tên lộ trình</span>
          <input
            className="neu-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div>
          <span className="neu-field-label">Ban áp dụng</span>
          <Select
            width="full"
            value={deptId}
            options={depts.map((d) => ({ value: d.id, label: d.name }))}
            onChange={setDeptId}
          />
        </div>
        <label className="space-y-1.5 block">
          <span className="neu-field-label">Ngưỡng Pass (% task đạt)</span>
          <input
            type="number"
            min={0}
            max={100}
            className="neu-input"
            value={passThresholdPercent}
            onChange={(e) =>
              setPassThresholdPercent(
                Math.min(100, Math.max(0, Number(e.target.value) || 0)),
              )
            }
          />
        </label>
      </section>

      <div className="relative space-y-5 pl-2">
        <div
          className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-accent/25"
          aria-hidden
        />
        {stages.map((st, idx) => (
          <article key={st.id} className="relative neu-card !p-5 space-y-4 ml-10">
            <span className="absolute -left-[42px] top-5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent shadow-extruded-sm">
              {idx + 1}
            </span>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                className="neu-input !h-11 font-semibold max-w-md flex-1"
                value={st.name}
                onChange={(e) =>
                  setStages((prev) =>
                    prev.map((s) =>
                      s.id === st.id ? { ...s, name: e.target.value } : s,
                    ),
                  )
                }
              />
              <div className="flex items-center gap-2 text-sm">
                <label className="rounded-full bg-background px-3 py-1.5 shadow-inset-sm inline-flex items-center gap-1.5">
                  <Icon icon={Timer} size={14} className="text-muted" />
                  <input
                    type="number"
                    min={1}
                    max={52}
                    className="w-12 bg-transparent text-center outline-none font-medium"
                    value={st.durationWeeks ?? 2}
                    onChange={(e) =>
                      setStageDuration(st.id, Number(e.target.value))
                    }
                    aria-label="Số tuần"
                  />
                  <span className="text-muted">Tuần</span>
                </label>
                <Button
                  variant="danger-icon"
                  size="sm"
                  aria-label="Xóa giai đoạn"
                  disabled={stages.length <= 1}
                  onClick={() =>
                    setStages((prev) => prev.filter((s) => s.id !== st.id))
                  }
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
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-background px-4 py-3 shadow-inset-sm"
                  >
                    <span className="text-accent shrink-0" aria-hidden>
                      <Icon icon={meta.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
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
                                      l.id === les.id
                                        ? { ...l, title: e.target.value }
                                        : l,
                                    ),
                                  },
                            ),
                          )
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Select
                          value={les.kind ?? "doc"}
                          options={KIND_OPTIONS}
                          onChange={(v) =>
                            setStages((prev) =>
                              prev.map((s) =>
                                s.id !== st.id
                                  ? s
                                  : {
                                      ...s,
                                      lessons: s.lessons.map((l) =>
                                        l.id === les.id
                                          ? { ...l, kind: v as LessonKind }
                                          : l,
                                      ),
                                    },
                              ),
                            )
                          }
                        />
                        <input
                          className="neu-input !h-9 !w-28 text-xs"
                          placeholder="Thời lượng"
                          value={les.durationLabel ?? ""}
                          onChange={(e) =>
                            setStages((prev) =>
                              prev.map((s) =>
                                s.id !== st.id
                                  ? s
                                  : {
                                      ...s,
                                      lessons: s.lessons.map((l) =>
                                        l.id === les.id
                                          ? {
                                              ...l,
                                              durationLabel: e.target.value,
                                            }
                                          : l,
                                      ),
                                    },
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <Button
                      variant="danger-icon"
                      size="sm"
                      aria-label="Xóa bài học"
                      onClick={() => removeLesson(st.id, les.id)}
                    >
                      <Icon icon={Trash2} size={14} />
                    </Button>
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

export default RoadmapBuilder;
