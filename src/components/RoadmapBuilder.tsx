import { useEffect, useState } from "react";
import { Code2, FileText, GripVertical, Play, Plus, Timer, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Select from "./ui/Select";
import { createTrainingProgram, getTrainees } from "../services/trainingService";
import type { LessonKind, TrainingLesson, TrainingStage } from "../types/training";

// Danh sách ban dùng TÊN BAN làm id (đồng bộ module tuyển) — ưu tiên suy từ
// trainee thực tế, chưa có thì dùng mặc định
const DEFAULT_DEPTS = [
  { id: "Ban Chuyên môn", name: "Ban Chuyên môn" },
  { id: "Ban Truyền thông", name: "Ban Truyền thông" },
  { id: "Ban Nhân sự", name: "Ban Nhân sự" },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function lessonMeta(kind?: LessonKind): { icon: LucideIcon; label: string } {
  if (kind === "video") return { icon: Play, label: "Video" };
  if (kind === "practice") return { icon: Code2, label: "Thực hành" };
  return { icon: FileText, label: "Tài liệu đọc" };
}

type StageDraft = TrainingStage & { lessons: TrainingLesson[] };

type Props = {
  /** Breadcrumb hiển thị phía trên (tuỳ ngữ cảnh admin / mentor) */
  breadcrumb?: string;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Trình dựng lộ trình training — mentor tự tạo cách train của riêng mình
 * (được dùng trong portal mentor; admin chỉ xem lộ trình).
 */
function RoadmapBuilder({ breadcrumb = "Vòng training › Tạo lộ trình", onCancel, onSaved }: Props) {
  const [name, setName] = useState("Lộ trình training của tôi");
  const [depts, setDepts] = useState(DEFAULT_DEPTS);
  const [deptId, setDeptId] = useState(DEFAULT_DEPTS[0].id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getTrainees().then((list) => {
      if (!alive || list.length === 0) return;
      const unique = [...new Set(list.map((t) => t.departmentName))];
      setDepts(unique.map((n) => ({ id: n, name: n })));
      setDeptId((prev) => (unique.includes(prev) ? prev : unique[0]));
    });
    return () => {
      alive = false;
    };
  }, []);

  const [stages, setStages] = useState<StageDraft[]>([
    {
      id: uid("st"),
      name: "Giai đoạn 1: Hội nhập",
      order: 1,
      durationWeeks: 2,
      weekLabel: "2 Tuần",
      lessons: [
        { id: uid("les"), stageId: "", title: "Văn hóa câu lạc bộ", kind: "doc", durationLabel: "30 phút" },
        { id: uid("les"), stageId: "", title: "Quy trình làm việc cơ bản", kind: "video", durationLabel: "45 phút" },
      ],
    },
    {
      id: uid("st"),
      name: "Giai đoạn 2: Kỹ năng chuyên môn",
      order: 2,
      durationWeeks: 3,
      weekLabel: "3 Tuần",
      lessons: [
        { id: uid("les"), stageId: "", title: "Git & Github Flow", kind: "practice", durationLabel: "2 giờ" },
      ],
    },
  ]);

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
                { id: uid("les"), stageId, title: "Bài học mới", kind: "doc", durationLabel: "30 phút" },
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
      const dept = depts.find((d) => d.id === deptId)!;
      const flatStages: TrainingStage[] = stages.map((stage, i) => {
        const { lessons, ...st } = stage;
        void lessons;
        return { ...st, order: i + 1 };
      });
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu lộ trình thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">{breadcrumb}</nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Tạo Lộ Trình Training</h1>
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
            options={depts.map((d) => ({ value: d.id, label: d.name }))}
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

export default RoadmapBuilder;
