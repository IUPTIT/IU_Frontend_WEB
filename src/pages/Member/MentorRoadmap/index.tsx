import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import RoadmapBuilder from "../../../components/RoadmapBuilder";
import { useAuth } from "../../../context/useAuth";
import { useToast } from "../../../context/useToast";
import {
  deleteTrainingProgram,
  getTrainingPrograms,
} from "../../../services/trainingService";
import type { TrainingProgram } from "../../../types/training";
import { formatDate } from "../../../utils/formatDate";

/**
 * Portal mentor: tạo / sửa / xoá lộ trình training của mình.
 */
function MentorRoadmapPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isMentor = user?.isMentor === true;

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTrainingProgram(deleteTarget.id);
      toast.success(`Đã xóa lộ trình "${deleteTarget.name}".`);
      setDeleteTarget(null);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa lộ trình thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isMentor) return;
    void load();
  }, [isMentor, load]);

  if (!isMentor) {
    return (
      <section className="neu-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">
          Lộ trình mentor
        </h1>
        <p className="text-muted mx-auto max-w-md">
          Bạn chưa được Ban Chủ nhiệm đẩy quyền mentor. Khi trở thành mentor,
          bạn sẽ tạo lộ trình training riêng và dẫn dắt team tân binh tại đây.
        </p>
      </section>
    );
  }

  if (mode === "create" || mode === "edit") {
    return (
      <RoadmapBuilder
        breadcrumb="Mentor › Lộ trình của tôi"
        initialProgram={mode === "edit" ? editing ?? undefined : undefined}
        onCancel={() => {
          setMode("list");
          setEditing(null);
        }}
        onSaved={() => {
          toast.success(
            mode === "edit"
              ? "Đã cập nhật lộ trình."
              : "Đã lưu lộ trình training của bạn.",
          );
          setMode("list");
          setEditing(null);
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
            Lộ trình của tôi
          </h1>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Lộ trình mới nhất tự áp dụng cho team khi được chia đội.
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
          Tạo lộ trình mới
        </Button>
      </section>

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : programs.length === 0 ? (
        <section className="neu-card !p-10 text-center space-y-3">
          <p className="font-semibold text-foreground">
            Bạn chưa có lộ trình nào.
          </p>
          <p className="text-sm text-muted">
            Tạo lộ trình đầu tiên để sẵn sàng nhận team tân binh.
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
                {p.stages.length} giai đoạn · {p.lessons.length} bài học · Tạo
                ngày {formatDate(p.createdAt)}
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
            ? `Xóa lộ trình "${deleteTarget.name}"? Team đang dùng lộ trình này sẽ tạm thời không có lộ trình cho tới khi bạn tạo/gán cái mới.`
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

export default MentorRoadmapPage;
