import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Icon from "../ui/Icon";
import Select from "../ui/Select";
import TrainingChatPanel from "./TrainingChatPanel";

export type ChatWidgetGroup = {
  id: string;
  name: string;
  subtitle?: string;
};

type Props = {
  groups: ChatWidgetGroup[];
};

/**
 * Linh vật chat nổi (FAB) — click mở popup reuse TrainingChatPanel.
 * Backdrop portal ra body để không chặn click trang khi đóng / stacking sai.
 */
export default function TrainingChatWidget({ groups }: Props) {
  const [open, setOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? "");

  useEffect(() => {
    if (!groups.length) {
      setActiveGroupId("");
      return;
    }
    if (!groups.some((g) => g.id === activeGroupId)) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups, activeGroupId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? groups[0],
    [groups, activeGroupId],
  );

  if (!groups.length || !active) return null;

  const popup = open
    ? createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-[2px]"
            aria-label="Đóng chat"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Trao đổi nhóm"
            className="pointer-events-auto relative z-10 mb-16 flex h-[min(70vh,30rem)] w-[min(100vw-2rem,22.5rem)] flex-col overflow-hidden rounded-card bg-background shadow-soft animate-in fade-in slide-in-from-bottom-3 duration-300"
          >
            <header className="flex items-start gap-2 border-b border-black/5 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-1">
                {groups.length > 1 ? (
                  <Select
                    width="full"
                    value={active.id}
                    options={groups.map((g) => ({
                      value: g.id,
                      label: g.name,
                    }))}
                    onChange={setActiveGroupId}
                  />
                ) : (
                  <h2 className="truncate font-display text-base font-bold">
                    {active.name}
                  </h2>
                )}
                {active.subtitle && (
                  <p className="truncate text-xs text-muted">{active.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted shadow-soft-sm transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              >
                <Icon icon={X} size={16} />
              </button>
            </header>
            <TrainingChatPanel
              key={active.id}
              groupId={active.id}
              embedded
              pollMs={8000}
            />
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {popup}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50">
        <button
          type="button"
          title="Trao đổi nhóm"
          aria-label="Trao đổi nhóm"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-soft transition duration-300 hover:scale-105 hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            open ? "scale-95" : ""
          }`}
        >
          <svg
            viewBox="0 0 48 48"
            className="h-9 w-9"
            aria-hidden
            fill="none"
          >
            <circle cx="24" cy="24" r="18" fill="white" fillOpacity="0.2" />
            <circle cx="17.5" cy="21" r="2.2" fill="white" />
            <circle cx="30.5" cy="21" r="2.2" fill="white" />
            <path
              d="M17 28c2.2 3.2 5 4.8 7 4.8S28.8 31.2 31 28"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
