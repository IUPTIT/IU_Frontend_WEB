import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import { ROUTES } from "../../../../constants/routes";
import { useAuth } from "../../../../context/useAuth";
import { usePortalUi } from "../../../../context/usePortalUi";
import {
  getSlotCandidates,
  type SlotCandidate,
  type SlotInfo,
} from "../../../../services/recruitmentService";
import { formatDate } from "../../../../utils/formatDate";

const BOOKING_STATUS_LABEL: Record<SlotCandidate["bookingStatus"], string> = {
  booked: "Đã đặt lịch",
  changed: "Đã đổi ca",
  completed: "Đã phỏng vấn",
  no_show: "Vắng mặt",
};

function statusBadgeClass(status: SlotCandidate["bookingStatus"]) {
  if (status === "completed") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (status === "no_show") return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  return "bg-accent/15 text-accent";
}

/** Bảng tất cả ứng viên đã đặt lịch trong 1 ca — bấm vào ứng viên để mở trang note PV */
function InterviewSlotDetailPage({ slotId }: { slotId: string }) {
  const { user } = useAuth();
  const routes =
    user?.role === "member"
      ? ROUTES.member.recruitment
      : user?.role === "leader"
        ? ROUTES.leader.recruitment
        : ROUTES.admin.recruitment;
  const { navigate } = usePortalUi();
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [candidates, setCandidates] = useState<SlotCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getSlotCandidates(slotId)
      .then((data) => {
        if (!alive) return;
        setSlot(data.slot);
        setCandidates(data.candidates);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được ca phỏng vấn");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slotId]);

  if (loading) {
    return <div className="ui-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />;
  }
  if (error || !slot) {
    return (
      <section className="ui-card !p-8 text-center">
        <p className="text-muted">{error ?? "Không tìm thấy ca phỏng vấn."}</p>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-3">
        <Button
          variant="soft"
          size="sm"
          className="!h-10"
          onClick={() => navigate(routes.interviews)}
          leftIcon={<Icon icon={ArrowLeft} size={15} />}
        >
          Về lịch phỏng vấn
        </Button>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Ca phỏng vấn {slot.startTime} - {slot.endTime}
        </h1>
        <p className="text-muted">
          {formatDate(slot.date)} · {slot.location} · Người phỏng vấn:{" "}
          {slot.interviewers.length
            ? slot.interviewers.map((i) => i.name).join(", ")
            : "chưa phân công"}
        </p>
      </section>

      <section className="ui-card !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Ứng viên trong ca</h2>
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{candidates.length}</span>/
            {slot.capacity} chỗ
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="bg-accent/15 text-xs uppercase tracking-wide text-accent">
                <th className="px-4 py-3.5 font-semibold">Mã hồ sơ</th>
                <th className="px-3 py-3.5 font-semibold">Ứng viên</th>
                <th className="px-3 py-3.5 font-semibold">Ban dự tuyển</th>
                <th className="px-3 py-3.5 font-semibold text-center">Trạng thái</th>
                <th className="px-3 py-3.5 font-semibold text-center">Điểm TB</th>
                <th className="px-3 py-3.5 font-semibold">Ai chấm / điểm</th>
                <th className="px-3 py-3.5" aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted">
                    Chưa có ứng viên nào đặt lịch vào ca này.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr
                    key={c.bookingId}
                    className="cursor-pointer transition-colors hover:bg-accent/[0.06]"
                    onClick={() => navigate(routes.interviewNote(c.bookingId))}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-accent">
                      {c.applicationCode}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-foreground">{c.fullName}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td className="px-3 py-4 text-sm text-foreground">{c.department}</td>
                    <td className="px-3 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(c.bookingStatus)}`}
                      >
                        {BOOKING_STATUS_LABEL[c.bookingStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-bold text-foreground">
                      {c.interviewScore != null ? c.interviewScore.toFixed(1) : "--"}
                    </td>
                    <td className="px-3 py-4 text-sm text-muted">
                      {c.scores.length === 0
                        ? "—"
                        : c.scores
                            .map((s) => `${s.name}: ${s.totalScore.toFixed(1)}`)
                            .join(" · ")}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span
                        title="Phỏng vấn & chấm điểm"
                        aria-label="Phỏng vấn & chấm điểm"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-accent shadow-soft-sm"
                      >
                        <Icon icon={ClipboardCheck} size={15} />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default InterviewSlotDetailPage;
