import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { useAuth } from "../../../../context/useAuth";
import {
  getGroupMessages,
  getMyTraining,
  getMyTrainingProgress,
  sendGroupMessage,
  type MyTraining,
} from "../../../../services/trainingService";
import type {
  TrainingChatMessage,
  TrainingProgress,
} from "../../../../types/training";
import { formatDate } from "../../../../utils/formatDate";

/** UC Member #6–7: tiến độ % + trao đổi mentor */
export default function MemberTrainingProgressPage() {
  const { user } = useAuth();
  const [me, setMe] = useState<MyTraining | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [messages, setMessages] = useState<TrainingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const training = await getMyTraining();
      setMe(training);
      if (!training) {
        setProgress(null);
        setMessages([]);
        return;
      }
      const [p, msgs] = await Promise.all([
        getMyTrainingProgress(training.trainee.id),
        training.group
          ? getGroupMessages(training.group.id)
          : Promise.resolve([]),
      ]);
      setProgress(p);
      setMessages(msgs);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Tải tiến độ thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!me?.group || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendGroupMessage(me.group.id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gửi tin thất bại");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="neu-card h-32 animate-pulse" />
        <div className="neu-card h-64 animate-pulse" />
      </section>
    );
  }

  if (!me) {
    return (
      <section className="neu-card !p-10 text-center text-muted">
        Bạn chưa ở vòng đào tạo thành viên mới.
      </section>
    );
  }

  const pct = progress?.percentComplete ?? 0;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Đào tạo thành viên mới ›{" "}
          <span className="text-foreground/80">Tiến độ & trao đổi</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Tiến độ & trao đổi
        </h1>
      </header>

      {toast && (
        <div className="rounded-2xl bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          {toast}
        </div>
      )}

      <div className="neu-card space-y-3 !p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Hoàn thành task (đã duyệt)</p>
            <p className="font-display text-3xl font-extrabold text-accent">
              {pct}%
            </p>
          </div>
          <p className="text-sm text-muted">
            {progress?.completedTasks ?? 0}/{progress?.totalTasks ?? 0} task
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-background shadow-inset-sm">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {me.trainee.mentorNote && (
          <p className="text-sm">
            <span className="text-muted">Note mentor: </span>
            {me.trainee.mentorNote}
          </p>
        )}
      </div>

      <div className="neu-card flex flex-col !p-0 overflow-hidden" style={{ minHeight: 360 }}>
        <div className="border-b border-foreground/5 px-5 py-3">
          <h2 className="font-display font-bold">
            Trao đổi với mentor
            {me.group ? ` — ${me.group.name}` : ""}
          </h2>
          <p className="text-xs text-muted">
            {me.group?.mentorName
              ? `Mentor: ${me.group.mentorName}`
              : "Chưa có nhóm — không thể chat"}
          </p>
        </div>

        {!me.group ? (
          <p className="p-6 text-sm text-muted">
            Bạn cần được chia nhóm trước khi trao đổi với mentor.
          </p>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: 320 }}>
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted py-8">
                  Chưa có tin nhắn. Hãy gửi câu hỏi đầu tiên cho mentor.
                </p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-extruded-sm ${
                        mine
                          ? "bg-accent/20 text-foreground"
                          : "bg-background"
                      }`}
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[11px] font-semibold text-muted">
                          {m.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className="mt-1 text-[10px] text-muted">
                        {formatDate(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-foreground/5 p-3">
              <input
                className="neu-input flex-1 text-sm"
                placeholder="Nhập tin nhắn…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
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
                <Icon icon={Send} size={14} />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
