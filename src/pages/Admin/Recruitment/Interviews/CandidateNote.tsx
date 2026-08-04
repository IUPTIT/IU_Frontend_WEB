import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { ROUTES } from "../../../../constants/routes";
import { usePortalUi } from "../../../../context/usePortalUi";
import {
  getBookingDetail,
  getInterviewCriteria,
  saveBookingScore,
  type BookingDetail,
} from "../../../../services/recruitmentService";
import type { InterviewCriterion } from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";

/**
 * Trang note phỏng vấn 1 ứng viên: ghi chú quá trình + chấm điểm theo tiêu chí.
 * Mỗi người chấm 1 bản ghi độc lập (chấm lại thì ghi đè của chính mình).
 * Quyết định pass/fail cuối làm ở trang Kết quả sau khi thảo luận.
 */
function InterviewCandidateNotePage({ bookingId }: { bookingId: string }) {
  const { navigate } = usePortalUi();
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [criteria, setCriteria] = useState<InterviewCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [attendance, setAttendance] = useState<"present" | "absent">("present");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    const [data, crit] = await Promise.all([getBookingDetail(bookingId), getInterviewCriteria()]);
    setDetail(data);
    setCriteria(crit);
  }, [bookingId]);

  useEffect(() => {
    let alive = true;
    void Promise.all([getBookingDetail(bookingId), getInterviewCriteria()])
      .then(([data, crit]) => {
        if (!alive) return;
        setDetail(data);
        setCriteria(crit);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bookingId]);

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />;
  }
  if (error || !detail) {
    return (
      <section className="neu-card !p-8 text-center">
        <p className="text-muted">{error ?? "Không tìm thấy lịch phỏng vấn."}</p>
      </section>
    );
  }

  const handleSave = async () => {
    if (attendance === "present") {
      for (const c of criteria) {
        const v = Number.parseFloat(scores[c.id] ?? "");
        if (Number.isNaN(v) || v < 0 || v > c.maxScore) {
          showToast(`Điểm "${c.name}" bắt buộc (0–${c.maxScore}).`);
          return;
        }
      }
      if (!note.trim()) {
        showToast("Ghi chú quá trình phỏng vấn là bắt buộc.");
        return;
      }
    }
    setSaving(true);
    try {
      await saveBookingScore({
        bookingId,
        applicationId: detail.applicationId,
        criteriaScores: criteria.map((c) => ({
          criteriaName: c.name,
          score: attendance === "absent" ? 0 : Number.parseFloat(scores[c.id] || "0") || 0,
          maxScore: c.maxScore,
        })),
        comment: note.trim(),
        attendance,
      });
      showToast("Đã lưu điểm & ghi chú.");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lưu thất bại — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const avgPreview = (() => {
    const vals = criteria.map((c) => Number.parseFloat(scores[c.id] || ""));
    if (!criteria.length || vals.some((v) => Number.isNaN(v))) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  })();

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3 min-w-0">
          <Button
            variant="soft"
            size="sm"
            className="!h-10"
            onClick={() => navigate(ROUTES.admin.recruitment.interviews)}
            leftIcon={<Icon icon={ArrowLeft} size={15} />}
          >
            Quay lại
          </Button>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{detail.fullName}</h1>
          <p className="text-muted">
            {detail.applicationCode} · {detail.department} · Ca {detail.slot.startTime}-
            {detail.slot.endTime} ngày {formatDate(detail.slot.date)} tại {detail.slot.location}
          </p>
        </div>
        {detail.averageScore != null && (
          <div className="neu-well-sm !px-5 !py-3 text-center">
            <p className="text-xs text-muted">Điểm TB hiện tại</p>
            <p className="text-2xl font-extrabold text-accent">{detail.averageScore.toFixed(1)}</p>
          </div>
        )}
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Cột trái: note + chấm điểm của TÔI */}
        <section className="neu-card space-y-5 !p-6">
          <h2 className="font-display text-lg font-bold">Phỏng vấn & chấm điểm</h2>

          <div className="flex flex-wrap items-center gap-3">
            <span className="neu-field-label !mb-0">Điểm danh:</span>
            {(["present", "absent"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAttendance(v)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  attendance === v
                    ? v === "absent"
                      ? "bg-rose-500/15 text-rose-600 shadow-inset-sm"
                      : "bg-accent/20 text-accent shadow-inset-sm"
                    : "shadow-extruded-sm text-muted"
                }`}
              >
                {v === "present" ? "Có mặt" : "Vắng mặt"}
              </button>
            ))}
          </div>

          {attendance === "present" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {criteria.map((c) => (
                <label key={c.id} className="block space-y-1.5">
                  <span className="neu-field-label">
                    {c.name} (0–{c.maxScore})
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    step={0.5}
                    className="neu-input !h-11"
                    value={scores[c.id] ?? ""}
                    onChange={(e) => setScores((s) => ({ ...s, [c.id]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="neu-field-label">
              Ghi chú quá trình phỏng vấn {attendance === "present" && "*"}
            </span>
            <textarea
              className="neu-input !h-auto min-h-[160px] resize-y py-3 text-sm"
              placeholder="Câu hỏi đã hỏi, câu trả lời nổi bật, thái độ, điểm mạnh/yếu, nhận định..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {avgPreview != null && attendance === "present" && (
                <>
                  Điểm trung bình của bạn:{" "}
                  <span className="font-bold text-accent">{avgPreview}</span>
                </>
              )}
            </p>
            <Button
              variant="primary"
              className="!h-12"
              disabled={saving}
              onClick={() => void handleSave()}
              leftIcon={<Icon icon={Save} size={16} />}
            >
              {saving ? "Đang lưu..." : "Lưu điểm & ghi chú"}
            </Button>
          </div>
        </section>

        {/* Cột phải: điểm & note của các reviewer (thảo luận) */}
        <aside className="neu-card space-y-4 !p-6">
          <h2 className="font-display text-lg font-bold">
            Đánh giá đã lưu ({detail.reviewerScores.length})
          </h2>
          {detail.reviewerScores.length === 0 ? (
            <p className="text-sm text-muted">Chưa có ai chấm ứng viên này.</p>
          ) : (
            <ul className="space-y-3">
              {detail.reviewerScores.map((s, i) => (
                <li key={i} className="rounded-2xl bg-accent/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{s.reviewerName || "Reviewer"}</p>
                    <span className="font-bold text-accent">
                      {s.attendance === "absent" ? "Vắng" : s.totalScore.toFixed(1)}
                    </span>
                  </div>
                  {s.comment && <p className="mt-2 text-sm text-muted">{s.comment}</p>}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">
            Kết luận cuối (trúng tuyển / loại) thực hiện ở trang <b>Kết quả</b> sau khi thảo luận.
          </p>
        </aside>
      </div>
    </>
  );
}

export default InterviewCandidateNotePage;
