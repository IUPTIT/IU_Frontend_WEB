import { useCallback, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { useAuth } from "../../../../context/useAuth";
import { usePortalUi } from "../../../../context/usePortalUi";
import { ROUTES } from "../../../../constants/routes";
import {
  getApplicationAnswers,
  getApplicationById,
  getApplicationScore,
  getScreeningCriteria,
  saveApplicationScore,
  setScreeningDecision,
  getInterviewers,
  assignReviewers,
} from "../../../../services/recruitmentService";
import type {
  Application,
  ApplicationAnswer,
  ApplicationAttachment,
  InterviewerRef,
  ScreeningCriterion,
} from "../../../../types/recruitment";
import { applicationToEmailRecipient } from "../../../../utils/emailRecipients";
import AttachmentPreview from "./components/AttachmentPreview";

type Props = {
  applicationId: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function answerToText(value: string | string[] | number) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function AttachmentIcon({ kind }: { kind: ApplicationAttachment["kind"] }) {
  if (kind === "pdf") {
    return (
      <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M6 2.5h5l3.5 3.5V17.5H6V2.5Z" strokeLinejoin="round" />
        <path d="M11 2.5V6h3.5" strokeLinejoin="round" />
        <path d="M8 11h4M8 14h3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2.5 2 11.5 0 14M10 3c-2 2.5-2 11.5 0 14" strokeLinecap="round" />
    </svg>
  );
}

function ApplicationDetailPage({ applicationId }: Props) {
  const { navigate } = usePortalUi();
  const { user } = useAuth();

  const [app, setApp] = useState<Application | null>(null);
  const [answers, setAnswers] = useState<ApplicationAnswer[]>([]);
  const [criteria, setCriteria] = useState<ScreeningCriterion[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [reviewers, setReviewers] = useState<InterviewerRef[]>([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Hồ sơ chính trước — phụ (điểm/answers) fail không làm trắng cả trang
      const detail = await getApplicationById(applicationId);
      setApp(detail ?? null);
      setSelectedReviewerIds(detail?.reviewerIds ?? []);
      if (!detail) return;

      const [ans, crit, score, interviewerList] = await Promise.all([
        getApplicationAnswers(applicationId).catch(() => [] as ApplicationAnswer[]),
        getScreeningCriteria().catch(() => [] as ScreeningCriterion[]),
        getApplicationScore(applicationId).catch(() => undefined),
        getInterviewers().catch(() => [] as InterviewerRef[]),
      ]);
      setAnswers(ans);
      setCriteria(crit);
      setReviewers(interviewerList);
      if (score) {
        const map: Record<string, string> = {};
        for (const c of score.criteriaScores) map[c.criteriaId] = String(c.score);
        setScores(map);
        setComment(score.comment ?? "");
        setReviewerName(score.reviewerName ?? user?.name ?? "Admin");
      } else {
        setScores({});
        setComment("");
        setReviewerName(user?.name ?? "Admin");
      }
    } catch (err) {
      setApp(null);
      showToast(
        err instanceof Error
          ? `Không tải được hồ sơ: ${err.message}`
          : "Không tải được chi tiết hồ sơ.",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId, user?.name]);

  useEffect(() => {
    void load();
  }, [load]);

  const backToList = () => navigate(ROUTES.admin.recruitment.applications);

  const buildCriteriaPayload = () =>
    criteria.map((c) => ({
      criteriaId: c.id,
      criteriaName: c.name,
      maxScore: c.maxScore,
      score: Number.parseFloat(scores[c.id] || "0") || 0,
    }));

  const canScore = app?.status === "submitted";

  const handleSave = async () => {
    if (!app || !user || !canScore) return;
    setSaving(true);
    try {
      await saveApplicationScore({
        applicationId: app.id,
        reviewerId: user.id,
        reviewerName: user.name || reviewerName,
        criteriaScores: buildCriteriaPayload(),
        comment,
      });
      showToast("Đã lưu đánh giá.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lưu đánh giá thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (result: "pass" | "fail") => {
    if (!app || !user || !canScore) return;
    setSaving(true);
    try {
      await saveApplicationScore({
        applicationId: app.id,
        reviewerId: user.id,
        reviewerName: user.name || reviewerName,
        criteriaScores: buildCriteriaPayload(),
        comment,
      });
      await setScreeningDecision(app.id, result);
      showToast(result === "pass" ? "Đã Pass vòng đơn." : "Đã loại hồ sơ.");
      // Quyết định xong → quay về bảng danh sách hồ sơ (chờ 1 nhịp cho toast hiện)
      window.setTimeout(backToList, 900);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : result === "pass"
            ? "Pass vòng đơn thất bại."
            : "Loại hồ sơ thất bại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const avgPreview = useMemo(() => {
    if (criteria.length === 0) return null;
    const vals = criteria.map((c) => Number.parseFloat(scores[c.id] || ""));
    if (vals.some((v) => Number.isNaN(v))) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 10) / 10;
  }, [criteria, scores]);

  if (loading) {
    return <div className="neu-card h-96 animate-pulse" aria-busy="true" aria-label="Đang tải" />;
  }

  if (!app) {
    return (
      <section className="neu-card space-y-4">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy hồ sơ</h1>
        <Button variant="secondary" onClick={backToList}>
          Quay lại danh sách
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>Tuyển dụng</li>
          <li aria-hidden>›</li>
          <li>
            <button type="button" className="hover:text-accent transition-colors" onClick={backToList}>
              Vòng hồ sơ
            </button>
          </li>
          <li aria-hidden>›</li>
          <li className="text-foreground/80">Chi tiết ứng viên</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="icon"
            size="md"
            aria-label="Quay lại"
            onClick={backToList}
            className="shrink-0"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
            Hồ sơ: {app.fullName}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="soft"
            size="md"
            leftIcon={<Icon icon={Send} size={16} />}
            onClick={() => setEmailOpen(true)}
            title="Gửi email kết quả vòng đơn (Pass / Trượt) — không phải nhắc lịch PV"
          >
            Gửi email vòng đơn
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={saving || !canScore}
            title={canScore ? "Lưu đánh giá" : "Hồ sơ đã qua vòng đơn — không thể chấm lại"}
            onClick={() => void handleSave()}
          >
            Lưu đánh giá
          </Button>
        </div>
      </header>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left column */}
        <aside className="space-y-5">
          <section className="neu-card !p-6 flex flex-col items-center text-center gap-4">
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/15 text-2xl font-bold text-accent shadow-inset-sm"
              aria-hidden
            >
              {initials(app.fullName)}
            </span>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">{app.fullName}</h2>
              <span className="inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                {app.preferredDepartmentName}
              </span>
            </div>

            <ul className="w-full space-y-3 text-left text-sm text-muted pt-2">
              <li className="flex items-start gap-2.5">
                <span className="neu-well-sm h-8 w-8 shrink-0 text-accent" aria-hidden>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="5" width="14" height="10" rx="2" />
                    <path d="m3.5 6.5 6.5 5 6.5-5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="pt-1.5 break-all">{app.email}</span>
              </li>
              {app.phone && (
                <li className="flex items-start gap-2.5">
                  <span className="neu-well-sm h-8 w-8 shrink-0 text-accent" aria-hidden>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path
                        d="M6.5 3.5h2l1 3.5-1.5 1a9 9 0 0 0 4 4l1-1.5 3.5 1v2a2 2 0 0 1-2 2A11.5 11.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="pt-1.5">{app.phone}</span>
                </li>
              )}
              {app.education && (
                <li className="flex items-start gap-2.5">
                  <span className="neu-well-sm h-8 w-8 shrink-0 text-accent" aria-hidden>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="m2.5 8 7.5-4 7.5 4-7.5 4-7.5-4Z" strokeLinejoin="round" />
                      <path d="M5.5 10v3.5c0 1 2 2 4.5 2s4.5-1 4.5-2V10M17.5 8v5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="pt-1.5">{app.education}</span>
                </li>
              )}
            </ul>
          </section>

          <section className="neu-card !p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M8.5 11.5 5.5 8.5a3 3 0 0 1 4.2-4.2l1.3 1.3" strokeLinecap="round" />
                <path d="m11.5 8.5 3 3a3 3 0 0 1-4.2 4.2l-1.3-1.3" strokeLinecap="round" />
                <path d="m8 12 4-4" strokeLinecap="round" />
              </svg>
              Tài liệu đính kèm
            </div>

            {(app.attachments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted">Chưa có tài liệu.</p>
            ) : (
              <ul className="space-y-4">
                {app.attachments!.map((att) => (
                  <li key={att.id} className="space-y-2">
                    <p className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                      <AttachmentIcon kind={att.kind} />
                      {att.label}
                    </p>
                    <AttachmentPreview attachment={att} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        {/* Right column */}
        <div className="space-y-5 min-w-0">
          <section className="neu-card !p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Câu trả lời Form đăng ký</h3>

            {answers.length === 0 ? (
              <p className="text-sm text-muted">Chưa có câu trả lời.</p>
            ) : (
              <div className="space-y-3">
                {answers.map((ans) => (
                  <article
                    key={ans.id}
                    className="rounded-2xl bg-accent/8 px-4 py-4 shadow-inset-sm space-y-2"
                  >
                    <p className="text-sm font-semibold text-accent">
                      Câu {ans.questionOrder}: {ans.questionContent}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{answerToText(ans.value)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="neu-card !p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold">Phân công người chấm</h3>
              {app.status === "submitted" && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={assigning || selectedReviewerIds.length === 0}
                  onClick={async () => {
                    setAssigning(true);
                    try {
                      await assignReviewers(applicationId, selectedReviewerIds);
                      showToast("Đã phân công người chấm.");
                      await load();
                    } catch {
                      showToast("Phân công thất bại.");
                    } finally {
                      setAssigning(false);
                    }
                  }}
                >
                  {assigning ? "Đang lưu..." : "Lưu phân công"}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted">
              Mỗi hồ sơ có thể gán nhiều người chấm để tránh thiên vị. Chỉ người được gán (và BCN) mới
              chấm được.
            </p>
            {app.reviewerNames && app.reviewerNames.length > 0 && (
              <p className="text-sm text-foreground">
                Đã gán: <b>{app.reviewerNames.join(", ")}</b>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {reviewers.map((r) => {
                const checked = selectedReviewerIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm shadow-inset-sm ${
                      checked ? "bg-accent/15 text-accent" : "bg-background text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={checked}
                      disabled={app.status !== "submitted"}
                      onChange={() => {
                        setSelectedReviewerIds((prev) =>
                          checked ? prev.filter((id) => id !== r.id) : [...prev, r.id],
                        );
                      }}
                    />
                    {r.name}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="neu-card !p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold">Phần Đánh Giá (Vòng Đơn)</h3>
              <span className="inline-flex rounded-full bg-muted/15 px-3 py-1 text-xs font-medium text-muted">
                Người chấm: {reviewerName}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {criteria.map((c) => (
                <label key={c.id} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {c.name}{" "}
                    <span className="text-muted font-normal">({c.maxScore})</span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    step={0.5}
                    disabled={!canScore}
                    className="neu-input !h-11 max-w-[100px] text-center font-semibold disabled:opacity-60"
                    value={scores[c.id] ?? ""}
                    onChange={(e) => setScores((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    aria-label={c.name}
                  />
                </label>
              ))}
            </div>

            {avgPreview != null && (
              <p className="text-center text-sm text-muted">
                Điểm trung bình: <span className="font-bold text-foreground">{avgPreview}</span>/10
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="screening-comment" className="text-sm font-semibold text-foreground">
                Nhận xét chung
              </label>
              <textarea
                id="screening-comment"
                rows={5}
                disabled={!canScore}
                className="neu-input !h-auto min-h-[120px] py-3 resize-y text-sm leading-relaxed disabled:opacity-60"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập nhận xét về hồ sơ ứng viên..."
              />
            </div>

            {!canScore && (
              <p className="text-sm text-muted">
                Hồ sơ không còn ở trạng thái chờ xét duyệt — không thể lưu điểm hoặc quyết định lại.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={saving || !canScore}
                title={canScore ? "Loại hồ sơ" : "Hồ sơ đã qua vòng đơn"}
                onClick={() => void handleDecision("fail")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white
                  bg-rose-500 shadow-extruded-sm transition-all duration-300
                  hover:-translate-y-px hover:bg-rose-600
                  active:translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="10" cy="10" r="7" />
                  <path d="m7.5 7.5 5 5M12.5 7.5l-5 5" strokeLinecap="round" />
                </svg>
                Loại hồ sơ
              </button>
              <button
                type="button"
                disabled={saving || !canScore}
                title={canScore ? "Pass vòng đơn" : "Hồ sơ đã qua vòng đơn"}
                onClick={() => void handleDecision("pass")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white
                  bg-accent shadow-extruded-sm transition-all duration-300
                  hover:-translate-y-px hover:brightness-110
                  active:translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="10" cy="10" r="7" />
                  <path d="m6.5 10.5 2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Pass vòng đơn
              </button>
            </div>
          </section>
        </div>
      </div>

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={[applicationToEmailRecipient(app)]}
        module="recruitment-screening"
        category="recruitment"
        preferredTemplateId={
          app.status === "cv_failed" || app.screeningResult === "fail"
            ? "tpl-cv-fail"
            : app.status === "interview" ||
                app.status === "interview_passed" ||
                app.status === "interview_failed" ||
                app.status === "accepted" ||
                app.status === "rejected" ||
                app.screeningResult === "pass"
              ? "tpl-cv-pass"
              : "tpl-cv-pass"
        }
        title={
          app.status === "cv_failed" || app.screeningResult === "fail"
            ? `Gửi email Trượt vòng đơn — ${app.fullName}`
            : `Gửi email Pass vòng đơn — ${app.fullName}`
        }
        onSent={(sent) => showToast(`Đã gửi ${sent} email.`)}
      />
    </div>
  );
}

export default ApplicationDetailPage;
