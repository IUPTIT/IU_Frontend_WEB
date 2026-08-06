import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Plus, Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import FilterMenu from "../../../../components/ui/FilterMenu";
import Icon from "../../../../components/ui/Icon";
import Select from "../../../../components/ui/Select";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import { ROUTES } from "../../../../constants/routes";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import {
  assignInterviewersToSlot,
  createBatchInterviewSlots,
  getCampaigns,
  getInterviewDatesWithSlots,
  getInterviewSlots,
  getInterviewers,
  deleteInterviewSlot,
  getInterviewResults,
  getPassedScreeningApplications,
  notifyInterviewResults,
  rescheduleInterviewSlot,
  listUnbookedApplications,
  assignInterviewSlot,
  markUnbookedNoShow,
  type UnbookedApplication,
} from "../../../../services/recruitmentService";
import type {
  Application,
  InterviewSlot,
  InterviewerRef,
  RecruitmentCampaign,
} from "../../../../types/recruitment";
import type { EmailRecipient } from "../../../../types/email";
import { applicationToEmailRecipient } from "../../../../utils/emailRecipients";
import { formatDate } from "../../../../utils/formatDate";
import AssignInterviewersModal from "./components/AssignInterviewersModal";
import BatchScheduleModal from "./components/BatchScheduleModal";
import DaySummaryCard from "./components/DaySummaryCard";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import InterviewCalendar from "../../../../components/InterviewCalendar";
import InterviewSlotCard from "./components/InterviewSlotCard";
import RescheduleModal from "./components/RescheduleModal";

type TabId = "schedule" | "results";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type InterviewResultRowUi = import("../../../../services/recruitmentService").InterviewResultRow;

const BOOKING_STATUS_LABEL: Record<string, string> = {
  booked: "Đã đặt lịch",
  changed: "Đã đổi ca",
  completed: "Đã phỏng vấn",
  no_show: "Vắng mặt",
};

// Cột xuất file kết quả phỏng vấn toàn đợt (CSV mở được bằng Excel)
const EXPORT_COLUMNS: ExportColumnDef<InterviewResultRowUi>[] = [
  { id: "code", label: "Mã hồ sơ", getValue: (r) => r.applicationCode, defaultSelected: true },
  { id: "fullName", label: "Họ và tên", getValue: (r) => r.fullName, defaultSelected: true },
  { id: "email", label: "Email", getValue: (r) => r.email, defaultSelected: true },
  { id: "phone", label: "Số điện thoại", getValue: (r) => r.phone, defaultSelected: false },
  { id: "department", label: "Ban dự tuyển", getValue: (r) => r.department, defaultSelected: true },
  { id: "slotDate", label: "Ngày PV", getValue: (r) => r.slotDate, defaultSelected: true },
  { id: "slotTime", label: "Giờ PV", getValue: (r) => r.slotTime, defaultSelected: true },
  { id: "location", label: "Địa điểm", getValue: (r) => r.location, defaultSelected: true },
  {
    id: "bookingStatus",
    label: "Trạng thái ca",
    getValue: (r) => BOOKING_STATUS_LABEL[r.bookingStatus] ?? r.bookingStatus,
    defaultSelected: true,
  },
  {
    id: "averageScore",
    label: "Điểm PV trung bình",
    getValue: (r) => (r.averageScore != null ? String(r.averageScore) : ""),
    defaultSelected: true,
  },
  {
    id: "reviewerCount",
    label: "Số người chấm",
    getValue: (r) => String(r.reviewerCount),
    defaultSelected: true,
  },
  {
    id: "reviewerNotes",
    label: "Nhận xét từng người chấm",
    getValue: (r) => r.reviewerNotes,
    defaultSelected: true,
  },
];

function RecruitmentInterviewsPage() {
  const { navigate } = usePortalUi();
  const toastApi = useToast();
  const [tab, setTab] = useState<TabId>("schedule");
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  // Mặc định theo ngày hiện tại (chốt 1 lần lúc mount)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerRef[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "scheduled" | "missing_interviewers" | "done">("");
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [emailTpl, setEmailTpl] = useState("tpl-interview");

  const [batchOpen, setBatchOpen] = useState(false);
  const [assignSlot, setAssignSlot] = useState<InterviewSlot | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<InterviewSlot | null>(null);
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<InterviewSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRows, setExportRows] = useState<InterviewResultRowUi[]>([]);
  const [resultRows, setResultRows] = useState<InterviewResultRowUi[]>([]);
  const [unbooked, setUnbooked] = useState<UnbookedApplication[]>([]);
  const [assignAppId, setAssignAppId] = useState("");
  const [assignSlotId, setAssignSlotId] = useState("");
  const [unbookedBusy, setUnbookedBusy] = useState(false);

  const showToast = (msg: string) => {
    toastApi.info(msg);
  };

  useEffect(() => {
    let alive = true;
    void getCampaigns().then((data) => {
      if (!alive) return;
      const usable = data.filter((c) => c.status !== "draft");
      setCampaigns(usable);
      setCampaignId((prev) => {
        if (prev && usable.some((c) => c.id === prev)) return prev;
        return usable.find((c) => c.isActive)?.id ?? usable[0]?.id ?? "";
      });
    });
    void getInterviewers().then((list) => alive && setInterviewers(list));
    return () => {
      alive = false;
    };
  }, []);

  // Đổi đợt tuyển → bật lại skeleton loading (adjust state during render)
  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  if (campaignId !== prevCampaignId) {
    setPrevCampaignId(campaignId);
    setLoading(true);
  }

  const reloadSlots = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      const [all, dates, apps, waiting, results] = await Promise.all([
        getInterviewSlots(cid),
        getInterviewDatesWithSlots(cid),
        getPassedScreeningApplications(cid),
        listUnbookedApplications(cid),
        getInterviewResults(cid).catch(() => [] as InterviewResultRowUi[]),
      ]);
      setSlots(all);
      setMarkedDates(new Set(dates));
      setCandidates(apps);
      setUnbooked(waiting);
      setResultRows(results);
    } catch (err) {
      showToast(
        err instanceof Error
          ? `Không tải được lịch PV: ${err.message}`
          : "Không tải được lịch phỏng vấn.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadSlots(campaignId);
  }, [campaignId, reloadSlots]);

  const daySlots = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate],
  );

  const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? "—";

  const filteredDaySlots = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return daySlots
      .filter((s) => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (!q) return true;
        return (
          s.locationOrLink.toLowerCase().includes(q) ||
          s.interviewers.some((i) => i.name.toLowerCase().includes(q)) ||
          s.startTime.includes(q)
        );
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [daySlots, localSearch, statusFilter]);

  const dayStats = useMemo(() => {
    const total = daySlots.length;
    const missing = daySlots.filter((s) => s.status === "missing_interviewers").length;
    const scheduled = daySlots.filter((s) => s.status === "scheduled" || s.status === "done").length;
    return { total, missing, scheduled };
  }, [daySlots]);

  const decidedResults = useMemo(
    () =>
      resultRows.filter(
        (r) =>
          r.applicationStatus === "passed_interview" ||
          r.applicationStatus === "failed_interview" ||
          r.applicationStatus === "admitted" ||
          r.applicationStatus === "rejected",
      ),
    [resultRows],
  );

  const dateLabel = (() => {
    const parts = selectedDate.split("-").map(Number);
    const m = parts[1];
    const d = parts[2];
    return `${pad(d)}/${pad(m)}`;
  })();

  return (
    <>
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>Tuyển dụng</li>
          <li aria-hidden>›</li>
          <li className="text-foreground/80">Vòng phỏng vấn</li>
        </ol>
      </nav>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            {tab === "schedule" ? "Lịch phỏng vấn" : "Kết quả phỏng vấn"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted text-sm sm:text-base">
            <span>Đợt tuyển</span>
            <Select
              value={campaignId}
              options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
              onChange={setCampaignId}
              className="min-w-[200px]"
              triggerClassName="!h-10 !shadow-extruded-sm text-accent !font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl bg-background p-1 shadow-inset-sm">
            {(
              [
                { id: "schedule" as const, label: "Lịch PV" },
                { id: "results" as const, label: "Kết quả PV" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-accent/20 text-accent shadow-extruded-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "schedule" && (
            <>
              <FilterMenu
                activeCount={statusFilter ? 1 : 0}
                onApply={() => setStatusFilter(draftStatus)}
                onReset={() => {
                  setDraftStatus("");
                  setStatusFilter("");
                }}
              >
                <div>
                  <span className="neu-field-label">Trạng thái slot</span>
                  <Select
                    width="full"
                    value={draftStatus}
                    options={[
                      { value: "", label: "Tất cả" },
                      { value: "scheduled", label: "Đã xếp" },
                      { value: "missing_interviewers", label: "Thiếu người" },
                      { value: "done", label: "Đã xong" },
                    ]}
                    onChange={(v) =>
                      setDraftStatus(v as "" | "scheduled" | "missing_interviewers" | "done")
                    }
                  />
                </div>
              </FilterMenu>
              <Button
                variant="primary"
                size="sm"
                className="!h-11"
                onClick={() => setBatchOpen(true)}
                leftIcon={<Icon icon={Plus} size={16} />}
              >
                Xếp lịch hàng loạt
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="!h-11"
                leftIcon={<Icon icon={Send} size={16} />}
                onClick={() => {
                  const dayBookings = resultRows.filter((r) => r.slotDate === selectedDate);
                  const rows = dayBookings
                    .map((r) => {
                      const app = candidates.find((c) => c.id === r.applicationId);
                      return app ? { row: r, app } : null;
                    })
                    .filter((x): x is { row: InterviewResultRowUi; app: Application } => !!x);
                  if (rows.length === 0) {
                    showToast("Chưa có ứng viên đặt lịch ngày này để gửi thư mời.");
                    return;
                  }
                  setEmailRecipients(
                    rows.map(({ row, app }) =>
                      applicationToEmailRecipient(app, {
                        interview_date: formatDate(row.slotDate),
                        interview_time: row.slotTime,
                        location: row.location,
                        meeting_link: row.location.startsWith("http")
                          ? row.location
                          : row.location,
                      }),
                    ),
                  );
                  setEmailTpl("tpl-interview");
                  setEmailOpen(true);
                }}
              >
                Gửi thư mời PV
              </Button>
            </>
          )}

          <Button
            variant="soft"
            size="sm"
            className="!h-11"
            onClick={async () => {
              try {
                const rows = await getInterviewResults(campaignId);
                if (rows.length === 0) {
                  showToast("Chưa có ứng viên nào đặt lịch phỏng vấn.");
                  return;
                }
                setExportRows(rows);
                setExportOpen(true);
              } catch (err) {
                showToast(err instanceof Error ? err.message : "Không tải được kết quả PV.");
              }
            }}
            leftIcon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            Xuất kết quả PV
          </Button>
          {tab === "results" && (
            <Button
              variant="soft"
              size="sm"
              className="!h-11"
              leftIcon={<Icon icon={Send} size={16} />}
              onClick={() => {
                const rows = decidedResults
                  .map((r) => {
                    const app = candidates.find((c) => c.id === r.applicationId);
                    return app ? { row: r, app } : null;
                  })
                  .filter((x): x is { row: InterviewResultRowUi; app: Application } => !!x);
                if (rows.length === 0) {
                  showToast("Chưa có ứng viên đã duyệt kết quả PV để gửi email.");
                  return;
                }
                const passRows = rows.filter(
                  (x) =>
                    x.row.applicationStatus === "passed_interview" ||
                    x.row.applicationStatus === "admitted",
                );
                const failRows = rows.filter(
                  (x) =>
                    x.row.applicationStatus === "failed_interview" ||
                    x.row.applicationStatus === "rejected",
                );
                if (passRows.length > 0 && failRows.length > 0) {
                  showToast(
                    "Danh sách vừa Pass vừa Fail — gửi riêng từng nhóm (lọc theo kết quả).",
                  );
                  return;
                }
                const target = passRows.length > 0 ? passRows : failRows;
                setEmailRecipients(
                  target.map(({ row, app }) =>
                    applicationToEmailRecipient(app, {
                      interview_date: formatDate(row.slotDate),
                      interview_time: row.slotTime,
                      location: row.location,
                      meeting_link: row.location.startsWith("http")
                        ? row.location
                        : row.location,
                    }),
                  ),
                );
                setEmailTpl(passRows.length > 0 ? "tpl-passed" : "tpl-rejected");
                setEmailOpen(true);
              }}
            >
              Gửi email kết quả
            </Button>
          )}
        </div>
      </section>

      {tab === "schedule" && unbooked.length > 0 && (
        <section className="neu-card !p-5 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Chưa đặt lịch phỏng vấn</h2>
              <p className="text-sm text-muted">
                {unbooked.length} ứng viên đã Pass vòng đơn — BCN có thể gán ca hoặc đánh dấu vắng
                không đặt lịch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={assignAppId}
                options={[
                  { value: "", label: "Chọn ứng viên" },
                  ...unbooked.map((a) => ({
                    value: a._id,
                    label: `${a.fullName} (${a.applicationCode ?? a.email})`,
                  })),
                ]}
                onChange={setAssignAppId}
                className="min-w-[200px]"
                placeholder="Ứng viên"
              />
              <Select
                value={assignSlotId}
                options={[
                  { value: "", label: "Chọn ca còn chỗ" },
                  ...slots
                    .filter((s) => (s.bookedCount ?? 0) < (s.capacity ?? 1))
                    .map((s) => ({
                      value: s.id,
                      label: `${s.date} ${s.startTime} · ${s.bookedCount ?? 0}/${s.capacity ?? 1} · ${s.locationOrLink}`,
                    })),
                ]}
                onChange={setAssignSlotId}
                className="min-w-[220px]"
                placeholder="Ca"
              />
              <Button
                variant="primary"
                size="sm"
                disabled={!assignAppId || !assignSlotId || unbookedBusy}
                onClick={async () => {
                  setUnbookedBusy(true);
                  try {
                    await assignInterviewSlot(assignAppId, assignSlotId);
                    showToast("Đã gán ca phỏng vấn.");
                    setAssignAppId("");
                    setAssignSlotId("");
                    await reloadSlots(campaignId);
                  } catch {
                    showToast("Gán ca thất bại — ca có thể đã hết chỗ.");
                  } finally {
                    setUnbookedBusy(false);
                  }
                }}
              >
                Gán ca
              </Button>
            </div>
          </div>
          <ul className="divide-y divide-black/5">
            {unbooked.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-foreground">{a.fullName}</p>
                  <p className="text-xs text-muted">
                    {a.email}
                    {a.bookingReminderSentAt ? " · đã nhắc email" : ""}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={unbookedBusy}
                  onClick={async () => {
                    if (!window.confirm(`Đánh dấu ${a.fullName} vắng không đặt lịch (Fail PV)?`)) return;
                    setUnbookedBusy(true);
                    try {
                      await markUnbookedNoShow(a._id);
                      showToast(`Đã Fail PV: ${a.fullName}`);
                      await reloadSlots(campaignId);
                    } catch {
                      showToast("Thao tác thất bại.");
                    } finally {
                      setUnbookedBusy(false);
                    }
                  }}
                >
                  Vắng không đặt lịch
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "schedule" && (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5">
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
            <DaySummaryCard
              dateLabel={dateLabel}
              total={dayStats.total}
              scheduled={dayStats.scheduled}
              missing={dayStats.missing}
            />
          </aside>

          <div className="space-y-4 min-w-0">
            <label className="relative block">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-placeholder" aria-hidden>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6" />
                  <path d="m14 14 4 4" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="neu-input pl-12"
                placeholder="Tìm kiếm ứng viên, người phỏng vấn..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </label>

            {loading ? (
              <div className="neu-card h-48 animate-pulse" aria-busy="true" />
            ) : filteredDaySlots.length === 0 ? (
              <div className="neu-card py-16 text-center text-muted">
                Không có ca phỏng vấn ngày {formatDate(selectedDate)}.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDaySlots.map((slot) => (
                  <InterviewSlotCard
                    key={slot.id}
                    slot={slot}
                    onAssign={setAssignSlot}
                    onReschedule={setRescheduleSlot}
                    onDelete={setDeleteSlotTarget}
                    onOpenCandidates={(s) =>
                      navigate(ROUTES.admin.recruitment.interviewSlot(s.id))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "results" && (
        <div className="neu-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-accent/15 text-sm text-accent">
                  <th className="px-4 py-3.5 font-semibold">Ứng viên</th>
                  <th className="px-3 py-3.5 font-semibold">Ngày / Giờ</th>
                  <th className="px-3 py-3.5 font-semibold">Ai chấm / điểm</th>
                  <th className="px-3 py-3.5 font-semibold text-center">TB</th>
                  <th className="px-3 py-3.5 font-semibold text-center">Kết quả PV</th>
                  <th className="px-3 py-3.5 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted">
                      Chưa có lịch phỏng vấn cho đợt {campaignName}.
                    </td>
                  </tr>
                ) : (
                  resultRows.map((row) => {
                    const decided =
                      row.applicationStatus === "passed_interview" ||
                      row.applicationStatus === "admitted"
                        ? "Đạt"
                        : row.applicationStatus === "failed_interview" ||
                            row.applicationStatus === "rejected"
                          ? "Không đạt"
                          : "Chờ duyệt";
                    return (
                      <tr key={`${row.applicationId}-${row.slotDate}-${row.slotTime}`} className="hover:bg-accent/[0.04]">
                        <td className="px-4 py-4">
                          <p className="font-semibold">{row.fullName}</p>
                          <p className="text-xs text-muted">
                            {row.applicationCode} · {row.department}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-sm text-muted">
                          {formatDate(row.slotDate)} · {row.slotTime}
                        </td>
                        <td className="px-3 py-4 text-sm text-muted max-w-xs">
                          {row.reviewerNotes || "—"}
                        </td>
                        <td className="px-3 py-4 text-center text-sm font-bold">
                          {row.averageScore != null ? row.averageScore.toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-4 text-center text-sm">{decided}</td>
                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            title="Sửa / duyệt kết quả"
                            aria-label="Sửa / duyệt kết quả"
                            disabled={!row.bookingId}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted shadow-extruded-sm transition-all duration-300 ease-out hover:text-accent active:shadow-inset-sm disabled:opacity-40 focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background"
                            onClick={() =>
                              row.bookingId &&
                              navigate(ROUTES.admin.recruitment.interviewNote(row.bookingId))
                            }
                          >
                            <Icon icon={ClipboardCheck} size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BatchScheduleModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        defaultDate={selectedDate}
        interviewers={interviewers}
        onSubmit={async (payload) => {
          const created = await createBatchInterviewSlots({ campaignId, ...payload });
          await reloadSlots(campaignId);
          setSelectedDate(payload.date);
          toastApi.created(
            `${created.length} ca phỏng vấn` +
              (payload.interviewerIds.length
                ? ` · ${payload.interviewerIds.length} người PV`
                : ""),
          );
        }}
      />

      <AssignInterviewersModal
        open={!!assignSlot}
        slot={assignSlot}
        interviewers={interviewers}
        onClose={() => setAssignSlot(null)}
        onSubmit={async (slotId, list) => {
          await assignInterviewersToSlot(slotId, list);
          await reloadSlots(campaignId);
          toastApi.updated("phân công người phỏng vấn");
        }}
      />

      <RescheduleModal
        open={!!rescheduleSlot}
        slot={rescheduleSlot}
        onClose={() => setRescheduleSlot(null)}
        onSubmit={async (slotId, patch) => {
          await rescheduleInterviewSlot(slotId, patch);
          await reloadSlots(campaignId);
          setSelectedDate(patch.date);
          toastApi.updated("ca phỏng vấn");
        }}
      />

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất kết quả phỏng vấn toàn đợt"
        description="Toàn bộ ứng viên đã đặt lịch ở mọi ca — kèm điểm và nhận xét từng người chấm để thảo luận:"
        columns={EXPORT_COLUMNS}
        rows={exportRows}
        filenameBase={`ket_qua_phong_van_${campaignId || "dot"}`}
        onExported={(n) => showToast(`Đã tải xuống ${n} dòng (CSV — mở bằng Excel).`)}
      />

      <ConfirmDialog
        open={deleteSlotTarget !== null}
        title="Xoá ca phỏng vấn"
        message={
          deleteSlotTarget
            ? `Xoá ca ${deleteSlotTarget.startTime} ngày ${formatDate(deleteSlotTarget.date)} tại ${deleteSlotTarget.locationOrLink}?`
            : ""
        }
        confirmLabel="Xoá ca"
        loading={deletingSlot}
        onConfirm={async () => {
          if (!deleteSlotTarget) return;
          setDeletingSlot(true);
          try {
            await deleteInterviewSlot(deleteSlotTarget.id);
            await reloadSlots(campaignId);
            toastApi.deleted("ca phỏng vấn");
            setDeleteSlotTarget(null);
          } catch (err) {
            toastApi.error(err instanceof Error ? err.message : "Xoá ca thất bại.");
          } finally {
            setDeletingSlot(false);
          }
        }}
        onClose={() => setDeleteSlotTarget(null)}
      />

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={emailRecipients}
        module="recruitment-interviews"
        category="recruitment"
        preferredTemplateId={emailTpl}
        title="Gửi email phỏng vấn"
        onSent={async (sent) => {
          if (sent <= 0) return;
          // Thư mời PV — không stamp kết quả
          if (emailTpl === "tpl-interview") {
            showToast(`Đã gửi thư mời tới ${sent} ứng viên.`);
            return;
          }
          // Kết quả Pass / Fail đều stamp đã gửi email kết quả
          if (emailTpl !== "tpl-passed" && emailTpl !== "tpl-rejected") {
            showToast(`Đã gửi ${sent} email.`);
            return;
          }
          try {
            await notifyInterviewResults(emailRecipients.map((r) => r.id));
            showToast(`Đã gửi email kết quả tới ${sent} ứng viên.`);
          } catch (err) {
            showToast(
              err instanceof Error
                ? `Email đã gửi nhưng cập nhật trạng thái thất bại: ${err.message}`
                : `Đã gửi ${sent} email nhưng cập nhật trạng thái thất bại.`,
            );
          }
        }}
      />
    </>
  );
}

export default RecruitmentInterviewsPage;
