import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../context/useAuth";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import { ROUTES } from "../../../../constants/routes";
import { getMyInterviewSlots } from "../../../../services/recruitmentService";
import type { InterviewSlot } from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";
import InterviewSlotCard from "../../../Admin/Recruitment/Interviews/components/InterviewSlotCard";

/**
 * Ca PV được BCN phân công — Leader hoặc Member đều chấm được nếu nằm trong panel.
 * Chỉ xem / chấm; không tạo ca hay phân công panel.
 */
export default function LeaderRecruitmentInterviewsPage() {
  const { user } = useAuth();
  const { navigate } = usePortalUi();
  const toast = useToast();
  const slotPath =
    user?.role === "member"
      ? ROUTES.member.recruitment.interviewSlot
      : ROUTES.leader.recruitment.interviewSlot;
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSlots(await getMyInterviewSlots());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tải được ca PV");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ca phỏng vấn của tôi
          </h1>
        </div>
        <p className="text-muted text-sm max-w-xl">
          Ca do BCN phân công — chỉ xem ứng viên và chấm điểm.
        </p>
      </header>

      {loading ? (
        <div className="ui-card h-48 animate-pulse" aria-busy="true" />
      ) : slots.length === 0 ? (
        <div className="ui-card !p-10 text-center text-sm text-muted">
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
                        navigate(slotPath(s.id))
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
