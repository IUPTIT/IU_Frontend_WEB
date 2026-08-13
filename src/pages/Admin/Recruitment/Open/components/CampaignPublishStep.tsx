import Toggle from "../../../../../components/ui/Toggle";
import type { CampaignDraft } from "../wizard/types";

type Props = {
  draft: CampaignDraft;
  onChange: (patch: Partial<CampaignDraft>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  /** Lỗi trùng tên — chặn nút xuất bản */
  nameConflict?: string | null;
  /** Lỗi trùng thời gian/ban với đợt đang mở */
  overlapConflict?: string | null;
};

const typeLabel: Record<CampaignDraft["questions"][number]["type"], string> = {
  short_text: "Trả lời ngắn",
  long_text: "Đoạn văn",
  single_choice: "Trắc nghiệm",
  file_upload: "Tải tệp",
};

function CampaignPublishStep({
  draft,
  onChange,
  onBack,
  onSaveDraft,
  onPublish,
  nameConflict = null,
  overlapConflict = null,
}: Props) {
  const totalQuota = draft.quotas.reduce((s, q) => s + q.quota, 0);
  const requiredCount = draft.questions.filter((q) => q.required).length;
  const hasConflicts = Boolean(nameConflict || overlapConflict);
  const canSave =
    draft.name.trim().length > 0 &&
    Boolean(draft.openAt && draft.closeAt) &&
    totalQuota > 0 &&
    !hasConflicts;

  const checks = [
    { ok: Boolean(draft.name.trim()), label: "Đã đặt tên đợt tuyển" },
    { ok: !nameConflict, label: nameConflict ?? "Tên đợt không trùng với đợt khác" },
    { ok: Boolean(draft.openAt && draft.closeAt), label: "Đã chọn thời gian mở / đóng đơn" },
    {
      ok: !overlapConflict,
      label: overlapConflict ?? "Không trùng thời gian/ban với đợt đang mở",
    },
    { ok: draft.questions.length > 0, label: `Form có ${draft.questions.length} câu hỏi` },
    {
      ok: totalQuota > 0,
      label: totalQuota > 0
        ? `Chỉ tiêu tổng ${totalQuota} suất`
        : "Cần ít nhất 1 ban có chỉ tiêu ≥ 1",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="text-center space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Xuất bản đợt tuyển</h1>
        <p className="text-muted max-w-xl mx-auto">
          Kiểm tra lại thông tin trước khi mở form công khai cho ứng viên.
        </p>
      </header>

      {hasConflicts && (
        <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 space-y-1" role="alert">
          <p className="font-semibold">Không thể lưu / xuất bản — cần sửa trước:</p>
          {nameConflict && <p>• {nameConflict}</p>}
          {overlapConflict && <p>• {overlapConflict}</p>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Tóm tắt trái */}
        <div className="space-y-6">
          <section className="ui-card space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Thông tin đợt tuyển</h2>
              <button type="button" className="text-sm text-accent font-medium" onClick={onBack}>
                Chỉnh sửa
              </button>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-background p-4 shadow-hairline space-y-1">
                <dt className="text-xs text-muted">Tên đợt</dt>
                <dd className="font-medium">{draft.name.trim() || "— Chưa đặt tên —"}</dd>
              </div>
              <div className="rounded-2xl bg-background p-4 shadow-hairline space-y-1">
                <dt className="text-xs text-muted">Thời gian nhận hồ sơ</dt>
                <dd className="font-medium">
                  {draft.openAt && draft.closeAt
                    ? `${draft.openAt} → ${draft.closeAt}`
                    : "— Chưa chọn —"}
                </dd>
              </div>
              <div className="sm:col-span-2 rounded-2xl bg-background p-4 shadow-hairline space-y-1">
                <dt className="text-xs text-muted">Mô tả</dt>
                <dd className="text-sm text-foreground/90 leading-relaxed">
                  {draft.description.trim() || "Không có mô tả."}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-sm font-semibold mb-3">Chỉ tiêu theo ban</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {draft.quotas.map((q) => (
                  <div
                    key={q.departmentId}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft-sm"
                  >
                    <span className="text-sm">{q.departmentName}</span>
                    <span className="font-display font-bold text-accent">{q.quota}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ui-card space-y-4">
            <h2 className="text-lg font-semibold">Form đăng ký ({draft.questions.length})</h2>
            <ul className="space-y-2">
              {draft.questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-background px-4 py-3 shadow-hairline"
                >
                  <span className="text-sm">
                    <span className="text-muted mr-2">{i + 1}.</span>
                    {q.content}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                    {typeLabel[q.type]}
                  </span>
                </li>
              ))}
              {draft.questions.length === 0 && (
                <li className="text-sm text-muted py-4 text-center">Chưa có câu hỏi — quay lại Form Builder.</li>
              )}
            </ul>
            <p className="text-xs text-muted">{requiredCount} câu bắt buộc</p>
          </section>
        </div>

        {/* Panel phải — checklist + tuỳ chọn publish */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          <section className="ui-card space-y-5">
            <h2 className="text-lg font-semibold">Sẵn sàng xuất bản?</h2>
            <ul className="space-y-3">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      c.ok
                        ? "bg-accent-secondary/20 text-accent-secondary"
                        : "bg-red-500/15 text-red-600"
                    }`}
                    aria-hidden
                  >
                    {c.ok ? "✓" : "!"}
                  </span>
                  <span className={c.ok ? "text-foreground" : "text-red-600"}>{c.label}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-4 pt-2 border-t border-accent/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Kích hoạt ngay</p>
                  <p className="text-xs text-muted">Đợt tuyển chuyển sang Đang mở</p>
                </div>
                <Toggle
                  checked={draft.activateOnPublish}
                  onChange={(v) => onChange({ activateOnPublish: v })}
                  aria-label="Kích hoạt ngay khi xuất bản"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Gửi thông báo</p>
                  <p className="text-xs text-muted">
                    In-app cho BCN / Leader khi đợt được mở
                  </p>
                </div>
                <Toggle
                  checked={draft.notifyOnPublish}
                  onChange={(v) => onChange({ notifyOnPublish: v })}
                  aria-label="Gửi thông báo khi xuất bản"
                />
              </div>
            </div>
          </section>

          <div className="rounded-card bg-gradient-to-br from-[#F5B4C8]/35 to-[#8BB7F0]/35 p-6 space-y-3 shadow-soft-sm">
            <p className="font-display font-bold text-lg">Sẵn sàng mở cổng đăng ký</p>
            <p className="text-sm text-muted leading-relaxed">
              Sau khi xuất bản, ứng viên có thể nộp hồ sơ trong khoảng thời gian đã cấu hình. Bạn vẫn có thể chỉnh
              chỉ tiêu / thời gian đóng sau.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" className="ui-btn" onClick={onBack}>
          ← Quay lại Form Builder
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="ui-btn text-accent disabled:opacity-50 disabled:pointer-events-none"
            disabled={!canSave}
            title={
              canSave
                ? "Lưu nháp"
                : hasConflicts
                  ? "Cần sửa xung đột tên/thời gian trước khi lưu"
                  : "Cần tên, thời gian mở/đóng và ít nhất 1 chỉ tiêu ≥ 1"
            }
            onClick={onSaveDraft}
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="inline-flex h-12 items-center gap-2 rounded-2xl px-8 font-semibold text-white
              bg-accent shadow-soft-sm
              transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-light
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Xuất bản đợt tuyển
            <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignPublishStep;
