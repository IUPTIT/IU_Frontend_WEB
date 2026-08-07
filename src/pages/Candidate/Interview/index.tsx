import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import InterviewCalendar from "../../../components/InterviewCalendar";
import { useToast } from "../../../context/useToast";
import {
  changeSlot,
  confirmBooking,
  getAvailableSlots,
  getMe,
  holdSlot,
  type CandidateApplication,
  type CandidateBooking,
  type CandidateSlot,
} from "../../../services/candidateService";
import { formatDate } from "../../../utils/formatDate";
import SlotList from "./components/SlotList";

const STATUS_NOTE: Record<string, string> = {
  pending_review: "Hồ sơ của bạn đang được xét duyệt vòng đơn — chưa cần đặt lịch phỏng vấn.",
  failed_cv: "Rất tiếc hồ sơ của bạn không vượt qua vòng đơn.",
  passed_interview: "Bạn đã hoàn thành phỏng vấn — chờ kết quả cuối cùng nhé!",
  failed_interview: "Rất tiếc bạn chưa vượt qua vòng phỏng vấn.",
  admitted: "Chúc mừng! Bạn đã trúng tuyển chính thức.",
  rejected: "Rất tiếc hồ sơ của bạn chưa phù hợp đợt này.",
};

function CandidateInterviewPage() {
  const [application, setApplication] = useState<CandidateApplication | null>(null);
  const [booking, setBooking] = useState<CandidateBooking | null>(null);
  const [slots, setSlots] = useState<CandidateSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Giữ chỗ: slot đang chọn + hạn xác nhận (countdown 150s)
  const [heldSlot, setHeldSlot] = useState<CandidateSlot | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  // Chế độ đổi ca (đã có booking, chọn ca mới)
  const [changing, setChanging] = useState(false);

  // Lịch tháng: ngày đang xem + tháng hiển thị (mặc định hôm nay)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // reload gọi từ event handler (sau đặt/đổi lịch); mount dùng .then bên dưới
  const reload = useCallback(async () => {
    try {
      const me = await getMe();
      const availableSlots =
        me.application.status === "passed_cv" ? await getAvailableSlots() : [];
      setApplication(me.application);
      setBooking(me.booking);
      setSlots(availableSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void getMe()
      .then(async (me) => {
        const availableSlots =
          me.application.status === "passed_cv" ? await getAvailableSlots() : [];
        if (!alive) return;
        setApplication(me.application);
        setBooking(me.booking);
        setSlots(availableSlots);
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
  }, []);

  // Đồng hồ đếm ngược thời gian giữ chỗ — remaining khởi tạo lúc hold (event handler),
  // effect chỉ chạy interval để không setState đồng bộ trong effect
  useEffect(() => {
    if (holdExpiresAt == null) return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round((holdExpiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setHeldSlot(null);
        setHoldExpiresAt(null);
        toast.info("Hết thời gian giữ chỗ — chọn lại ca nhé.");
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [holdExpiresAt, toast]);

  const handlePick = async (slot: CandidateSlot) => {
    if (busy) return;
    // Đổi ca: không cần hold — xác nhận trực tiếp qua change-slot
    if (changing) {
      setBusy(true);
      try {
        await changeSlot(slot._id);
        setChanging(false);
        toast.success("Đã đổi ca phỏng vấn thành công — kiểm tra email xác nhận.");
        await reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Đổi ca thất bại");
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      const hold = await holdSlot(slot._id);
      const expires = new Date(hold.expiresAt).getTime();
      setHeldSlot(slot);
      setHoldExpiresAt(expires);
      setRemaining(Math.max(0, Math.round((expires - Date.now()) / 1000)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Giữ chỗ thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!heldSlot || busy) return;
    setBusy(true);
    try {
      await confirmBooking(heldSlot._id);
      setHeldSlot(null);
      setHoldExpiresAt(null);
      toast.success("Đặt lịch thành công — kiểm tra email xác nhận nhé!");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xác nhận thất bại");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="neu-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />;
  }

  if (error || !application) {
    return (
      <section className="neu-card !p-8 text-center">
        <p className="text-muted">{error ?? "Không tìm thấy hồ sơ ứng tuyển."}</p>
      </section>
    );
  }

  const bookedSlot =
    booking && typeof booking.slotId === "object" ? booking.slotId : null;

  // Ngày nào có ca còn chỗ → chấm đánh dấu trên lịch; ca trong ngày đang chọn
  const bookableSlots = slots.filter((s) => !bookedSlot || s._id !== bookedSlot._id);
  const markedDates = new Set(bookableSlots.map((s) => s.date.slice(0, 10)));
  const daySlots = bookableSlots.filter((s) => s.date.slice(0, 10) === selectedDate);

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Lịch phỏng vấn
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Hồ sơ <span className="font-semibold text-foreground">{application.applicationCode}</span>
          {" · "}
          {typeof application.campaignId === "object" ? application.campaignId.name : ""}
        </p>
      </div>

      {/* Đã có lịch */}
      {bookedSlot && !changing && (
        <section className="neu-card space-y-4 !p-6">
          <h2 className="font-display text-lg font-bold">Lịch phỏng vấn của bạn</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="neu-well-sm !p-4">
              <p className="text-xs text-muted">Ngày</p>
              <p className="font-bold text-foreground">{formatDate(bookedSlot.date)}</p>
            </div>
            <div className="neu-well-sm !p-4">
              <p className="text-xs text-muted">Giờ</p>
              <p className="font-bold text-foreground">
                {bookedSlot.startTime} - {bookedSlot.endTime}
              </p>
            </div>
            <div className="neu-well-sm !p-4">
              <p className="text-xs text-muted">Địa điểm</p>
              <p className="font-bold text-foreground">{bookedSlot.location}</p>
            </div>
          </div>
          {booking!.changeCount < 1 ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="soft" className="!h-12" onClick={() => setChanging(true)}>
                Đổi ca phỏng vấn
              </Button>
              <p className="text-xs text-muted">
                Chỉ được đổi 1 lần, ca mới phải cách hiện tại ít nhất 24 giờ.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted">Bạn đã dùng lượt đổi ca — lịch trên là cố định.</p>
          )}
        </section>
      )}

      {/* Chưa có lịch (hoặc đang đổi ca) và đủ điều kiện đặt */}
      {application.status === "passed_cv" && (!bookedSlot || changing) && (
        <section className="neu-card space-y-5 !p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">
              {changing ? "Chọn ca mới" : "Chọn ca phỏng vấn"}
            </h2>
            {changing && (
              <Button variant="secondary" size="sm" className="!h-11" onClick={() => setChanging(false)}>
                Huỷ đổi ca
              </Button>
            )}
          </div>

          {!heldSlot && (
            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <InterviewCalendar
                year={calYear}
                month={calMonth}
                selectedDate={selectedDate}
                markedDates={markedDates}
                onSelectDate={setSelectedDate}
                onMonthChange={(y, m) => {
                  setCalYear(y);
                  setCalMonth(m);
                }}
              />
              <div className="min-w-0">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Ca phỏng vấn ngày {formatDate(selectedDate)}
                </p>
                <SlotList
                  slots={daySlots}
                  selectedId={null}
                  onSelect={(s) => void handlePick(s)}
                  disabled={busy}
                />
              </div>
            </div>
          )}

          {heldSlot && (
            <div className="space-y-4 rounded-2xl bg-accent/5 p-5">
              <p className="text-sm text-foreground">
                Đang giữ chỗ ca{" "}
                <span className="font-bold">
                  {formatDate(heldSlot.date)} · {heldSlot.startTime} - {heldSlot.endTime}
                </span>{" "}
                tại <span className="font-bold">{heldSlot.location}</span>
              </p>
              <p className="text-2xl font-extrabold text-accent" aria-live="polite">
                {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="!h-12" disabled={busy} onClick={() => void handleConfirm()}>
                  Xác nhận đặt lịch
                </Button>
                <Button
                  variant="secondary"
                  className="!h-12"
                  disabled={busy}
                  onClick={() => {
                    setHeldSlot(null);
                    setHoldExpiresAt(null);
                  }}
                >
                  Chọn ca khác
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Trạng thái khác — hiện thông báo tương ứng */}
      {application.status !== "passed_cv" && (
        <section className="neu-card !p-8 text-center">
          <p className="text-foreground">
            {STATUS_NOTE[application.status] ?? "Trạng thái hồ sơ không xác định."}
          </p>
        </section>
      )}
    </>
  );
}

export default CandidateInterviewPage;
