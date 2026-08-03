import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/ui/Button";
import FilterMenu from "../../../../components/ui/FilterMenu";
import Select from "../../../../components/ui/Select";
import { useAuth } from "../../../../context/AuthContext";
import {
  assignInterviewersToSlot,
  createBatchInterviewSlots,
  getCampaigns,
  getInterviewCriteria,
  getInterviewDatesWithSlots,
  getInterviewSlots,
  getInterviewers,
  getPassedScreeningApplications,
  notifyInterviewResults,
  rescheduleInterviewSlot,
  saveInterviewScore,
  setInterviewDecision,
} from "../../../../services/recruitmentService";
import type {
  Application,
  InterviewCriterion,
  InterviewSlot,
  InterviewerRef,
  RecruitmentCampaign,
} from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";
import AssignInterviewersModal from "./components/AssignInterviewersModal";
import BatchScheduleModal from "./components/BatchScheduleModal";
import DaySummaryCard from "./components/DaySummaryCard";
import InterviewCalendar from "./components/InterviewCalendar";
import InterviewScoreModal from "./components/InterviewScoreModal";
import InterviewSlotCard from "./components/InterviewSlotCard";
import RescheduleModal from "./components/RescheduleModal";

type TabId = "schedule" | "results";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function RecruitmentInterviewsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("schedule");
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [selectedDate, setSelectedDate] = useState("2024-10-07");
  const [calYear, setCalYear] = useState(2024);
  const [calMonth, setCalMonth] = useState(9); // Oct
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [daySlots, setDaySlots] = useState<InterviewSlot[]>([]);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerRef[]>([]);
  const [criteria, setCriteria] = useState<InterviewCriterion[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "scheduled" | "missing_interviewers" | "done">("");
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [batchOpen, setBatchOpen] = useState(false);
  const [assignSlot, setAssignSlot] = useState<InterviewSlot | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<InterviewSlot | null>(null);
  const [scoreSlot, setScoreSlot] = useState<InterviewSlot | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const loadCampaigns = useCallback(async () => {
    const data = await getCampaigns();
    const usable = data.filter((c) => c.status !== "draft");
    setCampaigns(usable);
    setCampaignId((prev) => {
      if (prev && usable.some((c) => c.id === prev)) return prev;
      return usable.find((c) => c.isActive)?.id ?? usable[0]?.id ?? "";
    });
  }, []);

  useEffect(() => {
    void loadCampaigns();
    void getInterviewers().then(setInterviewers);
    void getInterviewCriteria().then(setCriteria);
  }, [loadCampaigns]);

  const reloadSlots = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    try {
      const [all, dates, apps] = await Promise.all([
        getInterviewSlots(cid),
        getInterviewDatesWithSlots(cid),
        getPassedScreeningApplications(cid),
      ]);
      setSlots(all);
      setMarkedDates(new Set(dates));
      setCandidates(apps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadSlots(campaignId);
  }, [campaignId, reloadSlots]);

  useEffect(() => {
    setDaySlots(slots.filter((s) => s.date === selectedDate));
  }, [slots, selectedDate]);

  const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? "—";

  const filteredDaySlots = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return daySlots
      .filter((s) => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (!q) return true;
        return (
          (s.candidateName ?? "").toLowerCase().includes(q) ||
          s.interviewers.some((i) => i.name.toLowerCase().includes(q)) ||
          s.locationOrLink.toLowerCase().includes(q)
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

  const resultRows = useMemo(() => {
    return slots
      .filter((s) => s.applicationId)
      .map((s) => {
        const app = candidates.find((c) => c.id === s.applicationId);
        return { slot: s, app };
      });
  }, [slots, candidates]);

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
                leftIcon={
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M4 10h12M10 4v12" strokeLinecap="round" />
                  </svg>
                }
              >
                Xếp lịch hàng loạt
              </Button>
            </>
          )}

          {tab === "results" && (
            <Button
              variant="soft"
              size="sm"
              className="!h-11"
              onClick={async () => {
                const ids = resultRows
                  .map((r) => r.app)
                  .filter((a): a is Application => !!a && (a.interviewResult === "pass" || a.interviewResult === "fail"))
                  .map((a) => a.id);
                if (ids.length === 0) {
                  showToast("Chưa có ứng viên đã duyệt kết quả PV để gửi thông báo.");
                  return;
                }
                const res = await notifyInterviewResults(ids);
                showToast(`Đã gửi thông báo kết quả PV tới ${res.sent} ứng viên (mock).`);
              }}
            >
              Gửi thông báo kết quả
            </Button>
          )}
        </div>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
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
                    onScore={setScoreSlot}
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
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="bg-accent/15 text-sm text-accent">
                  <th className="px-4 py-3.5 font-semibold">Ứng viên</th>
                  <th className="px-3 py-3.5 font-semibold">Ngày / Giờ</th>
                  <th className="px-3 py-3.5 font-semibold">Người PV</th>
                  <th className="px-3 py-3.5 font-semibold text-center">Kết quả PV</th>
                  <th className="px-3 py-3.5 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-muted">
                      Chưa có lịch phỏng vấn cho đợt {campaignName}.
                    </td>
                  </tr>
                ) : (
                  resultRows.map(({ slot, app }) => (
                    <tr key={slot.id} className="hover:bg-accent/[0.04]">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{slot.candidateName}</p>
                        <p className="text-xs text-muted">{slot.candidateDepartment}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-muted">
                        {formatDate(slot.date)} · {slot.startTime}
                      </td>
                      <td className="px-3 py-4 text-sm">
                        {slot.interviewers.map((i) => i.name).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-4 text-center text-sm">
                        {app?.interviewResult === "pass"
                          ? "Đạt"
                          : app?.interviewResult === "fail"
                            ? "Không đạt"
                            : "Chờ"}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button variant="soft" size="sm" className="!h-9" onClick={() => setScoreSlot(slot)}>
                          Nhập điểm / Pass-Fail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BatchScheduleModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        candidates={candidates}
        defaultDate={selectedDate}
        onSubmit={async (payload) => {
          await createBatchInterviewSlots({ campaignId, ...payload });
          await reloadSlots(campaignId);
          setSelectedDate(payload.date);
          showToast(`Đã xếp ${payload.applicationIds.length} lịch phỏng vấn.`);
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
          showToast("Đã phân công người phỏng vấn.");
        }}
      />

      <RescheduleModal
        open={!!rescheduleSlot}
        slot={rescheduleSlot}
        onClose={() => setRescheduleSlot(null)}
        onSubmit={async (slotId, date, startTime) => {
          await rescheduleInterviewSlot(slotId, { date, startTime });
          await reloadSlots(campaignId);
          setSelectedDate(date);
          showToast("Đã đổi lịch phỏng vấn.");
        }}
      />

      <InterviewScoreModal
        open={!!scoreSlot}
        slot={scoreSlot}
        criteria={criteria}
        onClose={() => setScoreSlot(null)}
        onSave={async ({ scores, comment }) => {
          if (!scoreSlot?.applicationId || !user) return;
          await saveInterviewScore({
            slotId: scoreSlot.id,
            applicationId: scoreSlot.applicationId,
            interviewerId: user.id,
            interviewerName: user.name,
            comment,
            criteriaScores: criteria.map((c) => ({
              criteriaId: c.id,
              criteriaName: c.name,
              maxScore: c.maxScore,
              score: Number.parseFloat(scores[c.id] || "0") || 0,
            })),
          });
          showToast("Đã lưu điểm phỏng vấn.");
        }}
        onPassFail={async (result) => {
          if (!scoreSlot?.applicationId) return;
          await setInterviewDecision(scoreSlot.applicationId, result);
          await reloadSlots(campaignId);
          showToast(result === "pass" ? "Đã đánh dấu Đạt vòng PV." : "Đã đánh dấu Không đạt.");
        }}
      />
    </>
  );
}

export default RecruitmentInterviewsPage;
