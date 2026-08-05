import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import RoadmapBuilder from "../../../components/RoadmapBuilder";
import { useAuth } from "../../../context/useAuth";
import { getTrainingPrograms } from "../../../services/trainingService";
import type { TrainingProgram } from "../../../types/training";
import { formatDate } from "../../../utils/formatDate";

/**
 * Portal mentor: member được đẩy quyền mentor tự tạo và quản lý LỘ TRÌNH TRAINING
 * của riêng mình — admin chỉ xem đội và đánh giá, không tạo lộ trình.
 */
function MentorRoadmapPage() {
  const { user } = useAuth();
  const isMentor = user?.isMentor === true;

  const [mode, setMode] = useState<"list" | "create">("list");
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  // Không phải mentor thì không cần loading (chỉ hiện thông báo)
  const [loading, setLoading] = useState(isMentor);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await getTrainingPrograms();
      setPrograms(all.filter((p) => p.createdById === user?.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isMentor) return;
    void load();
  }, [isMentor, load]);

  if (!isMentor) {
    return (
      <section className="neu-card !p-10 text-center space-y-3">
        <h1 className="font-display text-2xl font-extrabold">Lộ trình mentor</h1>
        <p className="text-muted mx-auto max-w-md">
          Bạn chưa được Ban Chủ nhiệm đẩy quyền mentor. Khi trở thành mentor, bạn sẽ tạo
          lộ trình training riêng và dẫn dắt team tân binh tại đây.
        </p>
      </section>
    );
  }

  if (mode === "create") {
    return (
      <RoadmapBuilder
        breadcrumb="Mentor › Lộ trình của tôi › Tạo lộ trình"
        onCancel={() => setMode("list")}
        onSaved={() => {
          setToast("Đã lưu lộ trình training của bạn.");
          window.setTimeout(() => setToast(null), 2500);
          setMode("list");
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
          <p className="mt-2 text-muted max-w-xl">
            Mỗi mentor có cách training riêng — lộ trình mới nhất của bạn sẽ tự áp dụng
            cho team khi Ban Chủ nhiệm chia đội.
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

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" />
      ) : programs.length === 0 ? (
        <section className="neu-card !p-10 text-center space-y-3">
          <p className="font-semibold text-foreground">Bạn chưa có lộ trình nào.</p>
          <p className="text-sm text-muted">
            Tạo lộ trình đầu tiên để sẵn sàng nhận team tân binh.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <article key={p.id} className="neu-card !p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {p.departmentName}
                </span>
              </div>
              <p className="text-sm text-muted">
                {p.stages.length} giai đoạn · {p.lessons.length} bài học · Tạo ngày{" "}
                {formatDate(p.createdAt)}
              </p>
              <ul className="space-y-1.5">
                {[...p.stages]
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <li key={s.id} className="rounded-xl bg-background px-3 py-2 text-sm shadow-inset-sm">
                      <span className="font-semibold text-accent">{s.order}.</span>{" "}
                      {s.name}
                      {s.weekLabel && <span className="text-xs text-muted"> · {s.weekLabel}</span>}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default MentorRoadmapPage;
