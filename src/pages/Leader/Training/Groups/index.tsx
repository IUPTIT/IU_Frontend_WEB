import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import TrainingChatPanel from "../../../../components/training/TrainingChatPanel";
import { ChevronRight } from "lucide-react";
import {
  getTrainingGroups,
  getTrainees,
} from "../../../../services/trainingService";
import type { Trainee, TrainingGroup } from "../../../../types/training";

/**
 * Leader quản lý nhóm — card grid kế thừa Admin/Training/Teams
 * + chat nhanh với nhóm (UC Member #7 phía mentor).
 */
export default function LeaderTrainingGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<TrainingGroup | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [g, t] = await Promise.all([getTrainingGroups(), getTrainees()]);
    setGroups(g.filter((x) => x.mentorId === user?.id));
    setTrainees(t);
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    void load()
      .catch(() => {
        if (alive) setToast("Không tải được nhóm.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Quản lý nhóm</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Nhóm của tôi
        </h1>
        <p className="text-muted text-sm">
          Các nhóm training bạn đang phụ trách — xem thành viên và trao đổi.
        </p>
      </header>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          {toast}
        </p>
      )}

      {loading ? (
        <div className="neu-card h-64 animate-pulse" />
      ) : groups.length === 0 ? (
        <div className="neu-card !p-10 text-center text-muted text-sm">
          Bạn chưa được phân công nhóm training nào.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const members = trainees.filter((t) => t.groupId === g.id);
            return (
              <article key={g.id} className="neu-card !p-5 space-y-4">
                <Badge tone="violet">
                  {g.specialtyLabel ?? g.departmentName}
                </Badge>
                <h3 className="font-display text-xl font-bold">{g.name}</h3>
                <div className="rounded-2xl bg-background px-3 py-3 shadow-inset-sm flex items-center gap-3">
                  <Avatar name={user?.name ?? "Mentor"} size="md" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">
                      Bạn là mentor
                    </p>
                    <p className="text-sm font-semibold">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">
                      Thành viên
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {members.slice(0, 4).map((t) => (
                          <Avatar
                            key={t.id}
                            name={t.fullName}
                            size="sm"
                            className="ring-2 ring-background"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {members.length}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="icon"
                    size="sm"
                    aria-label={`Chi tiết ${g.name}`}
                    onClick={() => setDetail(g)}
                  >
                    <Icon icon={ChevronRight} size={16} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={() => setDetail(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-extruded"
          >
            <header className="border-b border-black/5 px-5 py-4">
              <h2 className="font-display text-xl font-extrabold">
                {detail.name}
              </h2>
              <p className="text-sm text-muted">
                Thành viên & kênh trao đổi nhóm
              </p>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <ul className="space-y-1 rounded-2xl bg-background p-2 shadow-inset-sm">
                {trainees
                  .filter((t) => t.groupId === detail.id)
                  .map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    >
                      <Avatar name={t.fullName} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {t.fullName}
                        </span>
                        <span className="text-xs text-muted">{t.email}</span>
                      </span>
                    </li>
                  ))}
              </ul>

              <TrainingChatPanel
                groupId={detail.id}
                title="Tin nhắn nhóm"
                subtitle="Trao đổi với tân binh trong nhóm"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
