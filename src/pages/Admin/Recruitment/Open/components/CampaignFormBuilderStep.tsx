import Toggle from "../../../../../components/ui/Toggle";
import type { CampaignDraft, QuestionDraft } from "../wizard/types";
import { uid } from "../wizard/types";

type Props = {
  draft: CampaignDraft;
  onChange: (patch: Partial<CampaignDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
};

const ADD_TYPES: { type: QuestionDraft["type"]; label: string; icon: "short" | "long" | "choice" | "file" }[] = [
  { type: "short_text", label: "Câu trả lời ngắn", icon: "short" },
  { type: "long_text", label: "Đoạn văn", icon: "long" },
  { type: "single_choice", label: "Trắc nghiệm", icon: "choice" },
  { type: "file_upload", label: "Tải tệp lên", icon: "file" },
];

function TypeIcon({ icon }: { icon: (typeof ADD_TYPES)[number]["icon"] }) {
  if (icon === "short") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 9h14M5 15h10" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "long") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h14M5 11h14M5 15h14M5 19h8" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "choice") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4h6l4 4v12H8V4Z" strokeLinejoin="round" />
      <path d="M14 4v4h4M12 11v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CampaignFormBuilderStep({ draft, onChange, onBack, onNext, onSaveDraft }: Props) {
  const updateQuestion = (id: string, patch: Partial<QuestionDraft>) => {
    onChange({
      questions: draft.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    });
  };

  const addQuestion = (type: QuestionDraft["type"]) => {
    const base: QuestionDraft = {
      id: uid("q"),
      content: type === "single_choice" ? "Câu hỏi trắc nghiệm mới" : "Câu hỏi mới",
      type,
      required: false,
      options:
        type === "single_choice"
          ? [
              { id: uid("opt"), label: "Lựa chọn 1" },
              { id: uid("opt"), label: "Lựa chọn 2" },
            ]
          : [],
    };
    onChange({ questions: [...draft.questions, base] });
  };

  const removeQuestion = (id: string) => {
    onChange({ questions: draft.questions.filter((q) => q.id !== id) });
  };

  const duplicateQuestion = (id: string) => {
    const src = draft.questions.find((q) => q.id === id);
    if (!src) return;
    onChange({
      questions: [
        ...draft.questions,
        {
          ...src,
          id: uid("q"),
          options: src.options.map((o) => ({ ...o, id: uid("opt") })),
        },
      ],
    });
  };

  const addOption = (qid: string) => {
    updateQuestion(qid, {
      options: [
        ...(draft.questions.find((q) => q.id === qid)?.options ?? []),
        { id: uid("opt"), label: "Tùy chọn mới" },
      ],
    });
  };

  const updateOption = (qid: string, oid: string, label: string) => {
    const q = draft.questions.find((x) => x.id === qid);
    if (!q) return;
    updateQuestion(qid, {
      options: q.options.map((o) => (o.id === oid ? { ...o, label } : o)),
    });
  };

  const removeOption = (qid: string, oid: string) => {
    const q = draft.questions.find((x) => x.id === qid);
    if (!q) return;
    updateQuestion(qid, { options: q.options.filter((o) => o.id !== oid) });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Thiết lập Form Đăng ký</h1>
          <p className="mt-1 text-muted">
            {draft.name.trim() || "Đợt tuyển mới"} — kéo thả / thêm câu hỏi cho ứng viên
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="neu-btn text-accent" onClick={onSaveDraft}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4h10l2 2v10H4V4Zm3 0v4h6V4M6 14h8" strokeLinejoin="round" />
            </svg>
            Lưu nháp
          </button>
          <button type="button" className="neu-btn-primary" onClick={onNext}>
            Xuất bản
            <span aria-hidden>↑</span>
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <section className="neu-card !p-5 space-y-4">
            <h2 className="text-sm font-semibold">Thêm thành phần</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ADD_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => addQuestion(t.type)}
                  className="neu-card neu-card-hover !p-4 flex flex-col items-center gap-2 text-center text-sm text-muted hover:text-accent"
                >
                  <span className="text-accent">
                    <TypeIcon icon={t.icon} />
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {draft.questions.map((q) => (
            <article key={q.id} className="neu-card !p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <input
                  className="neu-input font-semibold"
                  value={q.content}
                  onChange={(e) => updateQuestion(q.id, { content: e.target.value })}
                  aria-label="Nội dung câu hỏi"
                />
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="neu-btn h-10 w-10 !px-0 rounded-full"
                    aria-label="Nhân đôi câu hỏi"
                    onClick={() => duplicateQuestion(q.id)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="6" y="6" width="10" height="10" rx="2" />
                      <path d="M4 14V4h10" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="neu-btn h-10 w-10 !px-0 rounded-full text-red-500"
                    aria-label="Xóa câu hỏi"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 6h12M8 6V4.5h4V6m-5.5 0v10h7V6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {q.type === "short_text" && (
                <div className="neu-input text-muted pointer-events-none">Văn bản trả lời ngắn</div>
              )}
              {q.type === "long_text" && (
                <div className="neu-input !h-24 text-muted pointer-events-none flex items-start pt-3">
                  Đoạn văn trả lời dài...
                </div>
              )}
              {q.type === "file_upload" && (
                <div className="neu-input !h-20 text-muted pointer-events-none flex items-center justify-center">
                  Kéo thả hoặc chọn tệp để tải lên
                </div>
              )}
              {q.type === "single_choice" && (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <div key={o.id} className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full border-2 border-muted shrink-0" aria-hidden />
                      <input
                        className="neu-input !h-10"
                        value={o.label}
                        onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className="text-muted hover:text-red-500"
                        aria-label="Xóa tùy chọn"
                        onClick={() => removeOption(q.id, o.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="text-sm text-accent font-medium" onClick={() => addOption(q.id)}>
                    + Thêm tùy chọn
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <span className="text-sm text-muted">Bắt buộc</span>
                <Toggle
                  checked={q.required}
                  onChange={(checked) => updateQuestion(q.id, { required: checked })}
                  aria-label="Bắt buộc"
                />
              </div>
            </article>
          ))}
        </div>

        {/* Preview */}
        <aside className="neu-card !p-5 h-fit sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Preview Giao diện</h2>
            <span className="text-xs text-muted">Mobile</span>
          </div>
          <div className="mx-auto w-full max-w-[260px] rounded-[2rem] border-[6px] border-foreground/80 bg-white p-4 shadow-extruded">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-muted/40" />
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-light text-white text-xs font-bold">
                S&T
              </div>
              <p className="font-display font-bold text-accent text-sm">Form Ứng Tuyển</p>
            </div>
            <div className="space-y-3 text-xs">
              {draft.questions.slice(0, 3).map((q) => (
                <div key={q.id} className="space-y-1">
                  <p className="font-medium text-foreground">
                    {q.content}
                    {q.required ? " *" : ""}
                  </p>
                  {q.type === "single_choice" ? (
                    <div className="space-y-1 text-muted">
                      {q.options.slice(0, 2).map((o) => (
                        <p key={o.id}>○ {o.label}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="h-8 rounded-lg bg-background shadow-inset-sm" />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-[#3D4F8F] py-2.5 text-white font-medium"
                tabIndex={-1}
              >
                Gửi Đăng Ký
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" className="neu-btn" onClick={onBack}>
          ← Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-12 items-center gap-2 rounded-2xl px-8 font-semibold text-foreground
            bg-gradient-to-r from-[#F5B4C8] to-[#8BB7F0] shadow-extruded-sm
            transition-all duration-300 hover:-translate-y-0.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Tiếp tục (Xuất bản) →
        </button>
      </div>
    </div>
  );
}

export default CampaignFormBuilderStep;
