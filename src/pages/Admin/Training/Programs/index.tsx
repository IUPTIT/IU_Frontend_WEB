import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import RoadmapBuilder from "../../../../components/RoadmapBuilder";
import {
  deleteTrainingProgram,
  getTrainingPrograms,
} from "../../../../services/trainingService";
import type { TrainingProgram } from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

/**
 * BCN UC 33–35: tạo / xem / xoá lộ trình training theo ban
 * (mentor vẫn tạo lộ trình riêng ở portal mentor)
 */
export default function AdminTrainingProgramsPage() {
  const [mode, setMode] = useState<"list" | "create">("list");
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingProgram | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setPrograms(await getTrainingPrograms());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTrainingProgram(deleteTarget.id);
      setToast(`Đã xóa lộ trình "${deleteTarget.name}".`);
      window.setTimeout(() => setToast(null), 2500);
      setDeleteTarget(null);
      void load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Xóa thất bại.");
      window.setTimeout(() => setToast(null), 2500);
    } finally {
      setDeleting(false);
    }
  };

  if (mode === "create") {
    return (
      <RoadmapBuilder
        breadcrumb="Đào tạo thành viên mới › Lộ trình training › Tạo"
        onCancel={() => setMode("list")}
        onSaved={() => {
          setToast("Đã tạo lộ trình training.");
          window.setTimeout(() => setToast(null), 2500);
          setMode("list");
          setLoading(true);
          void load();
        }}
      />
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Đào tạo thành viên mới
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Lộ trình training
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Thiết lập chương trình/lộ trình theo ban với các giai đoạn và bài
            học. Mentor cũng có thể tạo lộ trình riêng cho team mình.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setMode("create")}
          leftIcon={<Icon icon={Plus} size={18} />}
        >
          Tạo lộ trình
        </Button>
      </section>

      {toast && (
        <p
          className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent"
          role="status"
        >
          {toast}
        </p>
      )}

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : programs.length === 0 ? (
        <section className="neu-card !p-10 text-center space-y-3">
          <p className="font-semibold">Chưa có lộ trình nào.</p>
          <p className="text-sm text-muted">
            Tạo lộ trình theo ban trước khi chia đội, hoặc để mentor tự tạo.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <article key={p.id} className="neu-card !p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {p.departmentName}
                  </span>
                  <Button
                    variant="icon"
                    size="sm"
                    aria-label={`Xóa lộ trình ${p.name}`}
                    className="!text-rose-500"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Icon icon={Trash2} size={15} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted">
                {p.stages.length} giai đoạn · {p.lessons.length} bài học ·{" "}
                {formatDate(p.createdAt)}
              </p>
              <ul className="space-y-1.5">
                {[...p.stages]
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl bg-background px-3 py-2 text-sm shadow-inset-sm"
                    >
                      <span className="font-semibold text-accent">
                        {s.order}.
                      </span>{" "}
                      {s.name}
                      {s.weekLabel && (
                        <span className="text-xs text-muted">
                          {" "}
                          · {s.weekLabel}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa lộ trình"
        message={
          deleteTarget
            ? `Xóa lộ trình "${deleteTarget.name}"? Các nhóm đang dùng sẽ tạm không có lộ trình.`
            : ""
        }
        confirmLabel="Xóa"
        tone="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
