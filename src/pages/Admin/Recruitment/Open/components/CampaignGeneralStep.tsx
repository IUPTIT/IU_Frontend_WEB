import type { CampaignDraft, QuotaDraft } from "../wizard/types";

type Props = {
  draft: CampaignDraft;
  onChange: (patch: Partial<CampaignDraft>) => void;
  onCancel: () => void;
  onNext: () => void;
};

const toneIconBg: Record<QuotaDraft["tone"], string> = {
  blue: "bg-[#4A90E2]/15 text-[#4A90E2]",
  purple: "bg-accent/15 text-accent",
  green: "bg-accent-secondary/15 text-accent-secondary",
  red: "bg-red-500/15 text-red-500",
};

function QuotaIcon({ icon }: { icon: QuotaDraft["icon"] }) {
  if (icon === "code") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m7 5-4 5 4 5M13 5l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "event") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 3v4M7 7h6l1 9H6l1-9Z" strokeLinejoin="round" />
        <path d="M8 7c0-2 4-2 4 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "media") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 8v4l7 2.5V5.5L3 8Zm7-2.5 5-1.5v12l-5-1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm6 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 16a3.5 3.5 0 0 1 7 0M9.5 16a3.5 3.5 0 0 1 7 0" strokeLinecap="round" />
    </svg>
  );
}

function CampaignGeneralStep({ draft, onChange, onCancel, onNext }: Props) {
  const setQuota = (departmentId: string, quota: number) => {
    onChange({
      quotas: draft.quotas.map((q) => (q.departmentId === departmentId ? { ...q, quota } : q)),
    });
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="text-center space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Tạo Đợt Tuyển Mới</h1>
        <p className="text-muted">Thiết lập thông tin cơ bản cho chiến dịch tuyển dụng sắp tới.</p>
      </header>

      <div className="neu-card space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">
              Tên đợt tuyển <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent" aria-hidden>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8v4l7 2.5V5.5L3 8Zm7-2.5 5-1.5v12l-5-1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                className="neu-input pl-11"
                placeholder="VD: Tuyển Gen 4 - Fall 2024"
                value={draft.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">
              Thời gian mở đơn <span className="text-red-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="neu-input"
                value={draft.openAt}
                onChange={(e) => onChange({ openAt: e.target.value })}
                aria-label="Ngày bắt đầu"
              />
              <input
                type="date"
                className="neu-input"
                value={draft.closeAt}
                onChange={(e) => onChange({ closeAt: e.target.value })}
                aria-label="Ngày kết thúc"
              />
            </div>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Mô tả ngắn gọn</span>
          <textarea
            className="neu-input !h-auto min-h-[120px] py-3 resize-y"
            placeholder="Mô tả mục tiêu, yêu cầu và thông tin nổi bật của đợt tuyển này..."
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </label>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Chỉ tiêu dự kiến</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {draft.quotas.map((q) => (
              <article key={q.departmentId} className="neu-card !p-5 flex flex-col items-center gap-3 text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${toneIconBg[q.tone]}`}>
                  <QuotaIcon icon={q.icon} />
                </div>
                <p className="text-sm font-medium">{q.departmentName}</p>
                <input
                  type="number"
                  min={0}
                  className="neu-input text-center !h-10"
                  value={q.quota}
                  onChange={(e) => setQuota(q.departmentId, Number(e.target.value) || 0)}
                  aria-label={`Chỉ tiêu ${q.departmentName}`}
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" className="neu-btn" onClick={onCancel}>
          Hủy
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-12 items-center gap-2 rounded-2xl px-8 font-semibold text-foreground
            bg-gradient-to-r from-[#F5B4C8] to-[#8BB7F0] shadow-extruded-sm
            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-extruded
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Tiếp tục (Form Builder)
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

export default CampaignGeneralStep;
