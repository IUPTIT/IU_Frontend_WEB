import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { useAuth } from "../../context/useAuth";
import {
  getGroupMessages,
  sendGroupMessage,
} from "../../services/trainingService";
import type { TrainingChatMessage } from "../../types/training";
import { formatDate } from "../../utils/formatDate";

type Props = {
  groupId: string;
  title?: string;
  subtitle?: string;
  /** Poll tin mới (ms). 0 = tắt */
  pollMs?: number;
  /** Ẩn header ngoài — dùng trong popup widget */
  embedded?: boolean;
};

/**
 * Khung chat nhóm training (mentor ↔ tân binh) — soft-UI, tin của mình bên phải.
 */
export default function TrainingChatPanel({
  groupId,
  title = "Trao đổi nhóm",
  subtitle,
  pollMs = 8000,
  embedded = false,
}: Props) {
  const { user } = useAuth();
  const myId = user?.id ? String(user.id) : "";
  const [messages, setMessages] = useState<TrainingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const list = await getGroupMessages(groupId);
        setMessages(list);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Không tải được tin nhắn",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [groupId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollMs) return;
    const t = window.setInterval(() => void load(true), pollMs);
    return () => window.clearInterval(t);
  }, [load, pollMs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendGroupMessage(groupId, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi tin thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "flex min-h-0 flex-1 flex-col overflow-hidden"
          : "neu-card flex flex-col !p-0 overflow-hidden"
      }
    >
      {!embedded && (
        <div className="border-b border-foreground/5 px-5 py-3">
          <h2 className="font-display font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      )}

      {error && (
        <p className="mx-4 mt-3 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div
        className={
          embedded
            ? "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4"
            : "flex h-[min(52vh,360px)] min-h-[200px] flex-col gap-2.5 overflow-y-auto px-4 py-4"
        }
      >
        {loading ? (
          <div className="m-auto h-16 w-full max-w-xs animate-pulse rounded-2xl bg-background shadow-inset-sm" />
        ) : messages.length === 0 ? (
          <p className="m-auto py-10 text-center text-sm text-muted">
            Chưa có tin nhắn. Hãy gửi lời chào đầu tiên.
          </p>
        ) : (
          messages.map((m) => {
            const mine = myId !== "" && String(m.senderId) === myId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-extruded-sm ${
                    mine
                      ? "rounded-br-md bg-accent/20 text-foreground"
                      : "rounded-bl-md bg-background shadow-inset-sm"
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[11px] font-semibold text-accent">
                      {m.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] text-muted ${mine ? "text-right" : ""}`}
                  >
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
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
          disabled={sending}
        />
        <Button
          variant="primary"
          size="sm"
          className="!h-11 !w-11 !px-0 shrink-0 rounded-full"
          disabled={sending || !draft.trim()}
          onClick={() => void handleSend()}
          aria-label="Gửi tin nhắn"
        >
          <Icon icon={Send} size={16} />
        </Button>
      </div>
    </div>
  );
}
