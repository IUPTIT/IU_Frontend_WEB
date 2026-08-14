import { useCallback, useEffect, useMemo, useState } from "react";
import InterviewCalendar from "../../../components/InterviewCalendar";
import { useToast } from "../../../context/useToast";
import {
  changeSlot,
  confirmBooking,
  getAvailableSlots,
  getMe,
  holdSlot,
  releaseHold,
  type CandidateApplication,
  type CandidateBooking,
  type CandidateSlot,
} from "../../../services/candidateService";
import { formatDate } from "../../../utils/formatDate";
import SlotList from "./components/SlotList";

const STATUS_NOTE: Record<string, string> = {
  pending_review:
    "Hồ sơ của bạn đang được xét duyệt vòng đơn — chưa cần đặt lịch phỏng vấn.",
  failed_cv: "Rất tiếc hồ sơ của bạn không vượt qua vòng đơn.",
  passed_interview: "Bạn đã hoàn thành phỏng vấn — chờ kết quả cuối cùng nhé!",
  failed_interview: "Rất tiếc bạn chưa vượt qua vòng phỏng vấn.",
  admitted: "Chúc mừng! Bạn đã trúng tuyển chính thức.",
  rejected: "Rất tiếc hồ sơ của bạn chưa phù hợp đợt này.",
};

const MS_12H = 12 * 60 * 60 * 1000;

function slotStartMs(slot: CandidateSlot): number {
  const d = new Date(slot.date);
  const [h, m] = slot.startTime.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

const card =
  "rounded-2xl border border-[#E8EAF2] bg-white p-6 shadow-[0_8px_28px_rgba(26,26,80,0.06)]";
const infoTile =
  "rounded-xl border border-[#E8EAF2] bg-[#F7F8FC] px-4 py-3";
const btnPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 disabled:pointer-events-none disabled:opacity-55";
const btnSecondary =
  "inline-flex h-12 items-center justify-center rounded-xl border border-[#E4E8F0] bg-white px-5 text-sm font-semibold text-[#3D4458] transition-colors hover:border-[#7C3AED]/40 hover:text-[#7C3AED] disabled:pointer-events-none disabled:opacity-55";
const btnSoft =
  "inline-flex h-12 items-center justify-center rounded-xl bg-[#F1E9FE] px-5 text-sm font-semibold text-[#7C3AED] transition-colors hover:bg-[#E9DDFC] disabled:pointer-events-none disabled:opacity-55";

function CandidateInterviewPage() {
  const [application, setApplication] = useState<CandidateApplication | null>(
    null,
  );
  const [booking, setBooking] = useState<CandidateBooking | null>(null);
  const [slots, setSlots] = useState<CandidateSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Giữ chỗ lần đầu (API hold 150s)
  const [heldSlot, setHeldSlot] = useState<CandidateSlot | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  // Đổi ca: chọn ca mới → chờ xác nhận (chưa gọi API)
  const [changing, setChanging] = useState(false);
  const [pendingChangeSlot, setPendingChangeSlot] =
    useState<CandidateSlot | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

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
        if (alive)
          setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

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

    // Đổi ca: chỉ chọn tạm — chưa gọi API
    if (changing) {
      setPendingChangeSlot(slot);
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

  const handleCancelHold = async () => {
    if (!heldSlot || busy) return;
    const slotId = heldSlot._id;
    setBusy(true);
    try {
      await releaseHold(slotId);
      setHeldSlot(null);
      setHoldExpiresAt(null);
      setRemaining(0);
      toast.info("Đã huỷ giữ chỗ — chọn ca khác nhé.");
    } catch (err) {
      setHeldSlot(null);
      setHoldExpiresAt(null);
      setRemaining(0);
      toast.error(err instanceof Error ? err.message : "Huỷ giữ chỗ thất bại");
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

  const handleConfirmChange = async () => {
    if (!pendingChangeSlot || busy) return;
    setBusy(true);
    try {
      await changeSlot(pendingChangeSlot._id);
      setPendingChangeSlot(null);
      setChanging(false);
      toast.success("Đã đổi ca phỏng vấn thành công — kiểm tra email xác nhận.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đổi ca thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelChangePick = () => {
    setPendingChangeSlot(null);
  };

  const exitChanging = () => {
    setChanging(false);
    setPendingChangeSlot(null);
  };

  const bookedSlot =
    booking && typeof booking.slotId === "object" ? booking.slotId : null;

  const bookableSlots = useMemo(
    () => slots.filter((s) => !bookedSlot || s._id !== bookedSlot._id),
    [slots, bookedSlot],
  );

  const markedDates = useMemo(
    () => new Set(bookableSlots.map((s) => s.date.slice(0, 10))),
    [bookableSlots],
  );

  const daySlots = useMemo(
    () => bookableSlots.filter((s) => s.date.slice(0, 10) === selectedDate),
    [bookableSlots, selectedDate],
  );

  const canChangeCurrent =
    !!bookedSlot && slotStartMs(bookedSlot) - Date.now() >= MS_12H;

  if (loading) {
    return (
      <div
        className="h-64 animate-pulse rounded-2xl border border-[#E8EAF2] bg-white"
        aria-busy="true"
        aria-label="Đang tải"
      />
    );
  }

  if (error || !application) {
    return (
      <section className={`${card} text-center`}>
        <p className="text-[#6B7086]">
          {error ?? "Không tìm thấy hồ sơ ứng tuyển."}
        </p>
      </section>
    );
  }

  const selectingUi =
    application.status === "passed_cv" && (!bookedSlot || changing);
  const showSlotPicker =
    selectingUi && !heldSlot && !pendingChangeSlot;

  return (
    <>
      <div>
        <h1 className="font-grotesk text-3xl font-extrabold tracking-tight text-[#191A2C] sm:text-4xl">
          Lịch phỏng vấn
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#6B7086]">
          Hồ sơ{" "}
          <span className="font-semibold text-[#191A2C]">
            {application.applicationCode}
          </span>
          {" · "}
          {typeof application.campaignId === "object"
            ? application.campaignId.name
            : ""}
        </p>
      </div>

      {bookedSlot && !changing && (
        <section className={`${card} space-y-4`}>
          <h2 className="font-grotesk text-lg font-bold text-[#191A2C]">
            Lịch phỏng vấn của bạn
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={infoTile}>
              <p className="text-xs font-medium text-[#9AA0B4]">Ngày</p>
              <p className="mt-1 font-bold text-[#191A2C]">
                {formatDate(bookedSlot.date)}
              </p>
            </div>
            <div className={infoTile}>
              <p className="text-xs font-medium text-[#9AA0B4]">Giờ</p>
              <p className="mt-1 font-bold text-[#191A2C]">
                {bookedSlot.startTime} - {bookedSlot.endTime}
              </p>
            </div>
            <div className={infoTile}>
              <p className="text-xs font-medium text-[#9AA0B4]">Địa điểm</p>
              <p className="mt-1 font-bold text-[#191A2C]">
                {bookedSlot.location}
              </p>
            </div>
          </div>
          {canChangeCurrent ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={btnSoft}
                onClick={() => {
                  setPendingChangeSlot(null);
                  setChanging(true);
                }}
              >
                Đổi ca phỏng vấn
              </button>
              <p className="text-xs text-[#6B7086]">
                Đổi khi ca khác còn chỗ · trước giờ PV hiện tại ít nhất 12 giờ ·
                không giới hạn số lần.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#6B7086]">
              Còn dưới 12 giờ trước giờ phỏng vấn — không thể đổi ca.
            </p>
          )}
        </section>
      )}

      {selectingUi && (
        <section className={`${card} space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-grotesk text-lg font-bold text-[#191A2C]">
              {changing ? "Chọn ca mới" : "Chọn ca phỏng vấn"}
            </h2>
            {changing && (
              <button
                type="button"
                className={`${btnSecondary} !h-10 !px-4 text-xs`}
                onClick={exitChanging}
              >
                Huỷ đổi ca
              </button>
            )}
          </div>

          {changing && !pendingChangeSlot && (
            <p className="rounded-xl border border-[#EDE4FF] bg-[#F8F4FF] px-4 py-3 text-sm text-[#5B4B8A]">
              Chọn ca còn chỗ, rồi bấm <strong>Xác nhận đổi ca</strong>. Chưa
              xác nhận thì lịch cũ vẫn giữ nguyên.
            </p>
          )}

          {showSlotPicker && (
            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <InterviewCalendar
                flat
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
                <p className="mb-3 text-sm font-semibold text-[#191A2C]">
                  Ca phỏng vấn ngày {formatDate(selectedDate)}
                </p>
                {bookableSlots.length === 0 ? (
                  <p className="rounded-xl border border-[#E8EAF2] bg-[#F7F8FC] px-4 py-6 text-center text-sm text-[#6B7086]">
                    Chưa có ca còn chỗ (hoặc ca chưa được phân công người phỏng
                    vấn). Vui lòng quay lại sau khi Ban chủ nhiệm mở lịch.
                  </p>
                ) : (
                  <SlotList
                    flat
                    slots={daySlots}
                    selectedId={null}
                    onSelect={(s) => void handlePick(s)}
                    disabled={busy}
                  />
                )}
              </div>
            </div>
          )}

          {/* Lần đầu: đang hold — chờ xác nhận */}
          {heldSlot && (
            <div className="space-y-4 rounded-xl border border-[#EDE4FF] bg-[#F8F4FF] p-5">
              <p className="text-sm text-[#3D4458]">
                Đang giữ chỗ ca{" "}
                <span className="font-bold text-[#191A2C]">
                  {formatDate(heldSlot.date)} · {heldSlot.startTime} -{" "}
                  {heldSlot.endTime}
                </span>{" "}
                tại{" "}
                <span className="font-bold text-[#191A2C]">
                  {heldSlot.location}
                </span>
              </p>
              <p
                className="font-grotesk text-2xl font-extrabold text-[#7C3AED]"
                aria-live="polite"
              >
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </p>
              <p className="text-xs text-[#6B7086]">
                Chưa bấm xác nhận thì lịch chưa được đặt — có thể chọn ca khác.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={btnPrimary}
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, #6E2CE6 0%, #A855F7 45%, #E0348C 100%)",
                  }}
                  disabled={busy}
                  onClick={() => void handleConfirm()}
                >
                  Xác nhận đặt lịch
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={busy}
                  onClick={() => void handleCancelHold()}
                >
                  Chọn ca khác
                </button>
              </div>
            </div>
          )}

          {/* Đổi ca: đã chọn tạm — chờ xác nhận */}
          {pendingChangeSlot && (
            <div className="space-y-4 rounded-xl border border-[#EDE4FF] bg-[#F8F4FF] p-5">
              <p className="text-sm text-[#3D4458]">
                Ca mới dự kiến{" "}
                <span className="font-bold text-[#191A2C]">
                  {formatDate(pendingChangeSlot.date)} ·{" "}
                  {pendingChangeSlot.startTime} - {pendingChangeSlot.endTime}
                </span>{" "}
                tại{" "}
                <span className="font-bold text-[#191A2C]">
                  {pendingChangeSlot.location}
                </span>
              </p>
              <p className="text-xs text-[#6B7086]">
                Lịch cũ vẫn còn hiệu lực. Chỉ khi bấm xác nhận mới đổi sang ca
                mới (ca đó phải còn chỗ).
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={btnPrimary}
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, #6E2CE6 0%, #A855F7 45%, #E0348C 100%)",
                  }}
                  disabled={busy}
                  onClick={() => void handleConfirmChange()}
                >
                  Xác nhận đổi ca
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={busy}
                  onClick={handleCancelChangePick}
                >
                  Chọn ca khác
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {application.status !== "passed_cv" && (
        <section className={`${card} text-center`}>
          <p className="text-[#3D4458]">
            {STATUS_NOTE[application.status] ??
              "Trạng thái hồ sơ không xác định."}
          </p>
        </section>
      )}
    </>
  );
}

export default CandidateInterviewPage;
