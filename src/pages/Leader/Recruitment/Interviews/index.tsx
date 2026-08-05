import { useCallback, useEffect, useMemo, useState } from "react";
import { usePortalUi } from "../../../../context/usePortalUi";
import { ROUTES } from "../../../../constants/routes";
import { getMyInterviewSlots } from "../../../../services/recruitmentService";
import type { InterviewSlot } from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";
import InterviewSlotCard from "../../../Admin/Recruitment/Interviews/components/InterviewSlotCard";

/**
 * Leader — Ca phỏng vấn được BCN phân công (Ch.2.5 ◐ Tuyển dụng).
 * Chỉ xem / chấm; không tạo ca hay phân công panel.
 */
export default function LeaderRecruitmentInterviewsPage() {
  const { navigate } = usePortalUi();
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSlots(await getMyInterviewSlots());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được ca PV");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = new Map<string, InterviewSlot[]>();
    for (const s of slots) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <nav className="text-sm text-muted">
          Tuyển dụng › <span className="text-foreground/80">Ca của tôi</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ca phỏng vấn của tôi
        </h1>
        <p className="text-muted text-sm max-w-2xl">
          Các ca Ban Chủ nhiệm đã phân bạn phụ trách — xem ứng viên và chấm điểm.
          Bạn không tạo/sửa ca tại đây.
        </p>
      </header>

      {error && (
        <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="neu-card h-48 animate-pulse" aria-busy="true" />
      ) : slots.length === 0 ? (
        <div className="neu-card !p-10 text-center text-sm text-muted">
          Bạn chưa được phân công ca phỏng vấn nào. Khi BCN gắn bạn vào ca, thông
          báo sẽ hiện ở chuông và email.
        </div>
      ) : (
        <div className="space-y-8">
          {byDate.map(([date, daySlots]) => (
            <div key={date} className="space-y-3">
              <h2 className="font-display text-lg font-bold">
                {formatDate(date)}
                <span className="ml-2 text-sm font-medium text-muted">
                  {daySlots.length} ca
                </span>
              </h2>
              <div className="space-y-3">
                {daySlots
                  .slice()
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <InterviewSlotCard
                      key={slot.id}
                      slot={slot}
                      readOnly
                      onAssign={() => undefined}
                      onReschedule={() => undefined}
                      onDelete={() => undefined}
                      onOpenCandidates={(s) =>
                        navigate(ROUTES.leader.recruitment.interviewSlot(s.id))
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
