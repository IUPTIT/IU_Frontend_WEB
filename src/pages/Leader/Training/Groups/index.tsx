import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { ChevronRight } from "lucide-react";
import {
  getGroupMessages,
  getTrainingGroups,
  getTrainees,
  sendGroupMessage,
} from "../../../../services/trainingService";
import type {
  Trainee,
  TrainingChatMessage,
  TrainingGroup,
} from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

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
  const [messages, setMessages] = useState<TrainingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
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

  useEffect(() => {
    if (!detail) {
      setMessages([]);
      return;
    }
    void getGroupMessages(detail.id)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [detail]);

  const handleSend = async () => {
    if (!detail || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendGroupMessage(detail.id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Gửi tin thất bại");
      window.setTimeout(() => setToast(null), 2500);
    } finally {
      setSending(false);
    }
  };

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
            className="relative z-10 flex max-h-[min(90vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background shadow-extruded"
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

              <div className="space-y-2">
                <p className="neu-field-label !mb-0">Tin nhắn nhóm</p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl bg-background p-3 shadow-inset-sm">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-muted py-4">
                      Chưa có tin nhắn
                    </p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className="text-sm">
                      <span className="font-semibold">{m.senderName}: </span>
                      {m.content}
                      <span className="ml-2 text-[10px] text-muted">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="neu-input flex-1 text-sm"
                    placeholder="Nhắn tới nhóm…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={sending || !draft.trim()}
                    onClick={() => void handleSend()}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
