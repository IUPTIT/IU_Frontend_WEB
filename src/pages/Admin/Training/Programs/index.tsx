import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import RoadmapBuilder from "../../../../components/RoadmapBuilder";
import { useAuth } from "../../../../context/useAuth";
import { useToast } from "../../../../context/useToast";
import {
  deleteTrainingProgram,
  getTrainingPrograms,
} from "../../../../services/trainingService";
import type { TrainingProgram } from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

/** Mentor training tạo / sửa / xoá lộ trình của mình. */
export default function AdminTrainingProgramsPage() {
  const { user } = useAuth();
  const isMentor = user?.isMentor === true;
  const toast = useToast();

  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<TrainingProgram | null>(null);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(isMentor);
  const [deleteTarget, setDeleteTarget] = useState<TrainingProgram | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await getTrainingPrograms();
      const uid = user?.id ? String(user.id) : "";
      setPrograms(all.filter((p) => String(p.createdById ?? "") === uid));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Không tải được lộ trình: ${err.message}`
          : "Không tải được danh sách lộ trình.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (!isMentor) return;
    void load();
  }, [isMentor, load]);

  if (!isMentor) {
    return (
      <section className="neu-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">
          Lộ trình training
        </h1>
        <p className="text-muted mx-auto max-w-md">
          Chỉ Mentor training được tạo và quản lý lộ trình. Khi được Ban Chủ
          nhiệm chỉ định làm Mentor, bạn sẽ thiết kế lộ trình tại đây.
        </p>
      </section>
    );
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTrainingProgram(deleteTarget.id);
      toast.success(`Đã xóa lộ trình "${deleteTarget.name}".`);
      setDeleteTarget(null);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  if (mode === "create" || mode === "edit") {
    return (
      <RoadmapBuilder
        breadcrumb="Tuyển dụng › Training tân binh › Lộ trình"
        initialProgram={mode === "edit" ? editing ?? undefined : undefined}
        onCancel={() => {
          setMode("list");
          setEditing(null);
        }}
        onSaved={() => {
          toast.success(
            mode === "edit"
              ? "Đã cập nhật lộ trình."
              : "Đã tạo lộ trình training.",
          );
          setMode("list");
          setEditing(null);
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
            Tuyển dụng › Training tân binh
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Lộ trình training
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Thiết lập lộ trình theo ban cho các team bạn phụ trách.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setMode("create");
          }}
          leftIcon={<Icon icon={Plus} size={18} />}
        >
          Tạo lộ trình
        </Button>
      </section>

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : programs.length === 0 ? (
        <section className="neu-card !p-10 text-center space-y-3">
          <p className="font-semibold">Chưa có lộ trình nào.</p>
          <p className="text-sm text-muted">
            Bạn chưa tạo lộ trình nào. Hãy tạo lộ trình cho team mình phụ trách.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <article key={p.id} className="neu-card !p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="text-left font-display text-lg font-bold hover:text-accent"
                  onClick={() => {
                    setEditing(p);
                    setMode("edit");
                  }}
                >
                  {p.name}
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {p.departmentName}
                  </span>
                  <Button
                    variant="icon"
                    size="sm"
                    aria-label={`Sửa lộ trình ${p.name}`}
                    onClick={() => {
                      setEditing(p);
                      setMode("edit");
                    }}
                  >
                    <Icon icon={Pencil} size={15} />
                  </Button>
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
                {p.stages.length} giai đoạn · {p.lessons.length} bài học · Pass ≥
                {p.passThresholdPercent ?? 80}% · {formatDate(p.createdAt)}
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
