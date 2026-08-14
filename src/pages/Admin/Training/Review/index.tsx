import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  CircleCheck,
  CircleX,
  Download,
  Eye,
  Send,
  UserX,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import ExportDataModal, {
  type ExportColumnDef,
} from "../../../../components/ui/ExportDataModal";
import FilterMenu from "../../../../components/ui/FilterMenu";
import Icon from "../../../../components/ui/Icon";
import MetricCard from "../../../../components/ui/MetricCard";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import useCountUp from "../../../../hooks/useCountUp";
import {
  getTrainees,
  getTrainingReviewSummary,
  handleIncompleteTrainee,
  issueCertificates,
  setTraineeEvalStatus,
  type TrainingReviewSummary,
} from "../../../../services/trainingService";
import { getCampaigns } from "../../../../services/recruitmentService";
import type { RecruitmentCampaign } from "../../../../types/recruitment";
import type {
  PenaltyActionType,
  Trainee,
  TraineeEvalStatus,
} from "../../../../types/training";
import type { EmailRecipient } from "../../../../types/email";
import { traineeToEmailRecipient } from "../../../../utils/emailRecipients";

const PAGE_SIZE = 5;

type QuickFilter = "all" | "qualified" | "failed";

type DraftFilter = {
  departmentId: string;
  evalStatus: TraineeEvalStatus | "";
};

const EMPTY: DraftFilter = { departmentId: "", evalStatus: "" };

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function evalLabel(s?: TraineeEvalStatus) {
  switch (s) {
    case "qualified":
      return "Đủ điều kiện";
    case "certified":
      return "Đã cấp CN";
    case "failed":
      return "Chưa đạt";
    case "studying":
    default:
      return "Đang học";
  }
}

function EvalBadge({ status }: { status?: TraineeEvalStatus }) {
  const s = status ?? "studying";
  const cls =
    s === "qualified"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : s === "certified"
        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
        : s === "failed"
          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
          : "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {evalLabel(s)}
    </span>
  );
}

function StatCard({
  title,
  value,
  suffix,
  hint,
  tone,
}: {
  title: string;
  value: number;
  suffix?: string;
  hint?: string;
  tone?: "default" | "danger" | "success";
}) {
  const n = useCountUp(value);
  const metricTone =
    tone === "danger" ? "rose" : tone === "success" ? "emerald" : "accent";
  return (
    <MetricCard
      label={title}
      value={
        <>
          {n}
          {suffix}
        </>
      }
      hint={hint}
      tone={metricTone}
    />
  );
}

function TrainingReviewPage() {
  const { search } = usePortalUi();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  // Đợt tuyển: user chọn thì ưu tiên, không thì lấy đợt đang mở / mới nhất
  const [campaignIdOverride, setCampaignIdOverride] = useState("");
  const campaignId = useMemo(() => {
    if (
      campaignIdOverride &&
      campaigns.some((c) => c.id === campaignIdOverride)
    ) {
      return campaignIdOverride;
    }
    return campaigns.find((c) => c.isActive)?.id ?? campaigns[0]?.id ?? "";
  }, [campaignIdOverride, campaigns]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [summary, setSummary] = useState<TrainingReviewSummary>({
    totalTrainees: 0,
    completionRate: 0,
    needsAction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [draft, setDraft] = useState<DraftFilter>(EMPTY);
  const [applied, setApplied] = useState<DraftFilter>(EMPTY);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [detailTrainee, setDetailTrainee] = useState<Trainee | null>(null);
  const [penaltyTarget, setPenaltyTarget] = useState<Trainee | null>(null);
  const [penaltyAction, setPenaltyAction] =
    useState<PenaltyActionType>("final_reminder");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [penaltySaving, setPenaltySaving] = useState(false);

  // loading khởi tạo true — refresh sau thao tác giữ nguyên bảng cũ
  const load = useCallback(async () => {
    try {
      const [list, sum] = await Promise.all([
        getTrainees(undefined, campaignId || undefined),
        getTrainingReviewSummary(campaignId || undefined),
      ]);
      setTrainees(list);
      setSummary(sum);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Không tải được đánh giá: ${err.message}`
          : "Không tải được dữ liệu đánh giá training.",
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast]);

  useEffect(() => {
    let alive = true;
    void getCampaigns().then((data) => {
      if (alive) setCampaigns(data.filter((c) => c.status !== "draft"));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of trainees) map.set(t.departmentId, t.departmentName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [trainees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainees.filter((t) => {
      if (
        q &&
        !t.fullName.toLowerCase().includes(q) &&
        !t.email.toLowerCase().includes(q)
      )
        return false;
      if (
        quick === "qualified" &&
        t.evalStatus !== "qualified" &&
        t.evalStatus !== "certified"
      )
        return false;
      if (quick === "failed" && t.evalStatus !== "failed") return false;
      if (applied.departmentId && t.departmentId !== applied.departmentId)
        return false;
      if (applied.evalStatus && t.evalStatus !== applied.evalStatus)
        return false;
      return true;
    });
  }, [trainees, search, quick, applied]);

  // Đổi tìm kiếm / bộ lọc → về trang 1 (adjust state during render)
  const [prevFilterKey, setPrevFilterKey] = useState("");
  const filterKey = `${search}|${quick}|${JSON.stringify(applied)}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const exportColumns: ExportColumnDef<Trainee>[] = useMemo(
    () => [
      {
        id: "fullName",
        label: "Họ tên",
        getValue: (r) => r.fullName,
        defaultSelected: true,
      },
      {
        id: "email",
        label: "Email",
        getValue: (r) => r.email,
        defaultSelected: true,
      },
      {
        id: "department",
        label: "Ban",
        getValue: (r) => r.departmentName,
        getFilterKey: (r) => r.departmentId,
        filterOptions: departments.map((d) => ({ value: d.id, label: d.name })),
        defaultSelected: true,
      },
      {
        id: "avgScore",
        label: "Điểm TB",
        getValue: (r) => (r.avgScore != null ? String(r.avgScore) : ""),
        defaultSelected: true,
      },
      {
        id: "progress",
        label: "Tiến độ",
        getValue: (r) => `${r.sessionsDone ?? 0}/${r.sessionsTotal ?? 0}`,
        defaultSelected: true,
      },
      {
        id: "status",
        label: "Trạng thái",
        getValue: (r) => evalLabel(r.evalStatus),
        getFilterKey: (r) => r.evalStatus ?? "studying",
        filterOptions: [
          { value: "studying", label: "Đang học" },
          { value: "qualified", label: "Đủ điều kiện" },
          { value: "certified", label: "Đã cấp CN" },
          { value: "failed", label: "Chưa đạt" },
        ],
        defaultSelected: true,
      },
    ],
    [departments],
  );

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleIssue = async () => {
    const ids =
      selected.size > 0
        ? [...selected]
        : filtered.filter((t) => t.evalStatus === "qualified").map((t) => t.id);
    if (ids.length === 0) {
      toast.info("Không có học viên đủ điều kiện để cấp chứng nhận.");
      return;
    }
    try {
      const res = await issueCertificates(ids);
      await load();
      setSelected(new Set());
      toast.success(`Đã cấp chứng nhận cho ${res.issued} học viên.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cấp chứng nhận thất bại.",
      );
    }
  };

  const handleEval = async (
    traineeId: string,
    evalStatus: "qualified" | "failed",
  ) => {
    try {
      await setTraineeEvalStatus(traineeId, evalStatus);
      toast.success(
        evalStatus === "qualified"
          ? "Đã đánh dấu Đạt."
          : "Đã đánh dấu Chưa đạt.",
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại.");
    }
  };

  const handlePenalty = async () => {
    if (!penaltyTarget || !penaltyReason.trim()) {
      toast.info("Vui lòng nhập lý do xử lý.");
      return;
    }
    if (penaltyAction === "extend_once" && penaltyTarget.extendedOnce) {
      toast.info("Tân binh này đã được gia hạn 1 lần.");
      return;
    }
    setPenaltySaving(true);
    try {
      await handleIncompleteTrainee(penaltyTarget.id, {
        action: penaltyAction,
        reason: penaltyReason.trim(),
      });
      toast.success(
        penaltyAction === "remove_from_club"
          ? `Đã loại ${penaltyTarget.fullName} khỏi CLB.`
          : penaltyAction === "extend_once"
            ? `Đã gia hạn deadline +7 ngày cho ${penaltyTarget.fullName}.`
            : `Đã gửi nhắc lần cuối tới ${penaltyTarget.fullName}.`,
      );
      setPenaltyTarget(null);
      setPenaltyReason("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xử lý thất bại.");
    } finally {
      setPenaltySaving(false);
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Đánh giá &amp; Hoàn thành
            </h1>
            <Select
              value={campaignId}
              options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
              onChange={setCampaignIdOverride}
              placeholder="Chọn đợt tuyển"
              ariaLabel="Bộ lọc theo đợt tuyển"
              className="min-w-[220px]"
              triggerClassName="!shadow-soft-sm !h-10 text-accent !font-semibold"
            />
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Tổng kết đợt training — theo dõi tiến độ tân binh.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            onClick={() => setExportOpen(true)}
            leftIcon={<Icon icon={Download} size={16} />}
          >
            Xuất báo cáo
          </Button>
          <Button
            variant="soft"
            size="sm"
            className="!h-11"
            leftIcon={<Icon icon={Send} size={16} />}
            onClick={() => {
              const list =
                selected.size > 0
                  ? trainees.filter((t) => selected.has(t.id))
                  : filtered;
              if (list.length === 0) {
                toast.info(
                  "Chọn học viên hoặc để trống để gửi theo bộ lọc hiện tại.",
                );
                return;
              }
              setEmailRecipients(list.map(traineeToEmailRecipient));
              setEmailOpen(true);
            }}
          >
            Gửi email
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            onClick={() => void handleIssue()}
          >
            Cấp chứng nhận hàng loạt
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Tổng tân binh" value={summary.totalTrainees} />
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={summary.completionRate}
          suffix="%"
          hint="+5% so với kỳ trước"
          tone="success"
        />
        <StatCard
          title="Cần xử lý"
          value={summary.needsAction}
          hint="Chưa đạt / Bỏ cuộc"
          tone="danger"
        />
      </div>

      <section className="ui-card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Danh sách đánh giá</h2>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all" as const, label: "Tất cả" },
                { id: "qualified" as const, label: "Đủ điều kiện" },
                { id: "failed" as const, label: "Chưa đạt" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setQuick(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  quick === f.id
                    ? "bg-accent/20 text-accent shadow-hairline"
                    : "text-muted shadow-soft-sm hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
            <FilterMenu
              activeCount={
                (applied.departmentId ? 1 : 0) + (applied.evalStatus ? 1 : 0)
              }
              onApply={() => setApplied(draft)}
              onReset={() => {
                setDraft(EMPTY);
                setApplied(EMPTY);
              }}
            >
              <div>
                <span className="ui-field-label">Ban</span>
                <Select
                  width="full"
                  value={draft.departmentId}
                  options={[
                    { value: "", label: "Tất cả" },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  onChange={(departmentId) =>
                    setDraft({ ...draft, departmentId })
                  }
                />
              </div>
              <div>
                <span className="ui-field-label">Trạng thái</span>
                <Select
                  width="full"
                  value={draft.evalStatus}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "studying", label: "Đang học" },
                    { value: "qualified", label: "Đủ điều kiện" },
                    { value: "certified", label: "Đã cấp CN" },
                    { value: "failed", label: "Chưa đạt" },
                  ]}
                  onChange={(evalStatus) =>
                    setDraft({
                      ...draft,
                      evalStatus: evalStatus as TraineeEvalStatus | "",
                    })
                  }
                />
              </div>
            </FilterMenu>
          </div>
        </div>

        {loading ? (
          <div className="h-56 animate-pulse bg-accent/5" aria-busy="true" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-accent/15 text-sm text-accent">
                  <th className="px-4 py-3.5 w-10" />
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    Học viên
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    Ban
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Điểm TB
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">
                    Tiến độ
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Trạng thái
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-muted"
                    >
                      Không có học viên phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paged.map((t) => {
                    const done = t.sessionsDone ?? 0;
                    const total = t.sessionsTotal ?? 10;
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <tr key={t.id} className="hover:bg-accent/[0.04]">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="accent-accent"
                            checked={selected.has(t.id)}
                            onChange={() => toggleOne(t.id)}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                              {initials(t.fullName)}
                            </span>
                            <div>
                              <p className="font-semibold">{t.fullName}</p>
                              <p className="text-xs text-muted">
                                {t.id.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {t.departmentName}
                        </td>
                        <td className="px-3 py-4 text-center">
                          {t.mentorReviewStatus === "submitted" ? (
                            <span className="font-bold">
                              {t.avgScore != null
                                ? t.avgScore.toFixed(1)
                                : "--"}
                            </span>
                          ) : (
                            <span
                              className="text-xs text-muted"
                              title="Mentor chưa gửi kết quả lên BCN"
                            >
                              Chờ mentor gửi
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="h-2 rounded-full bg-background shadow-hairline overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted">
                              {done}/{total} buổi
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <EvalBadge status={t.evalStatus} />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              aria-label={`Xem chi tiết kết quả training của ${t.fullName}`}
                              title="Xem chi tiết"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-accent shadow-soft-sm transition-colors hover:bg-accent/10"
                              onClick={() => setDetailTrainee(t)}
                            >
                              <Icon icon={Eye} size={17} />
                            </button>
                            {(t.evalStatus === "studying" ||
                              t.evalStatus === "failed") && (
                              <button
                                type="button"
                                aria-label={`Đánh dấu ${t.fullName} đạt`}
                                title="Đạt"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 shadow-soft-sm transition-colors hover:bg-emerald-500/10"
                                onClick={() =>
                                  void handleEval(t.id, "qualified")
                                }
                              >
                                <Icon icon={CircleCheck} size={17} />
                              </button>
                            )}
                            {(t.evalStatus === "studying" ||
                              t.evalStatus === "qualified") && (
                              <button
                                type="button"
                                aria-label={`Đánh dấu ${t.fullName} chưa đạt`}
                                title="Chưa đạt"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 shadow-soft-sm transition-colors hover:bg-rose-500/10"
                                onClick={() => void handleEval(t.id, "failed")}
                              >
                                <Icon icon={CircleX} size={17} />
                              </button>
                            )}
                            {(t.evalStatus === "failed" ||
                              t.evalStatus === "studying") &&
                              t.status !== "removed" && (
                              <button
                                type="button"
                                aria-label={`Xử lý không hoàn thành: ${t.fullName}`}
                                title="Nhắc / loại khỏi CLB"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-amber-600 shadow-soft-sm transition-colors hover:bg-amber-500/10"
                                onClick={() => {
                                  setPenaltyTarget(t);
                                  setPenaltyAction("final_reminder");
                                  setPenaltyReason("");
                                }}
                              >
                                <Icon icon={UserX} size={17} />
                              </button>
                            )}
                            {t.evalStatus === "certified" && (
                              <span
                                className="flex h-8 w-8 items-center justify-center text-sky-500"
                                title="Đã cấp chứng nhận"
                              >
                                <Icon icon={Award} size={17} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-4">
          <p className="text-sm text-muted">
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} trên{" "}
            {filtered.length} tân binh
          </p>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </section>

      {detailTrainee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={() => setDetailTrainee(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trainee-detail-title"
            className="relative z-10 flex max-h-[min(90vh,600px)] w-full max-w-md flex-col overflow-hidden rounded-card bg-background shadow-soft"
          >
            <header className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="trainee-detail-title"
                  className="font-display text-xl font-extrabold"
                >
                  {detailTrainee.fullName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {detailTrainee.departmentName}
                  {detailTrainee.mentorName &&
                    ` · Mentor: ${detailTrainee.mentorName}`}
                </p>
              </div>
              <Button
                variant="icon"
                size="sm"
                aria-label="Đóng"
                onClick={() => setDetailTrainee(null)}
              >
                <Icon icon={CircleX} size={16} />
              </Button>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 sm:px-6">
              <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 shadow-hairline">
                <span className="text-sm text-muted">Kết quả từ mentor</span>
                {detailTrainee.mentorReviewStatus === "submitted" ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Đã gửi
                    {detailTrainee.mentorReviewSubmittedAt &&
                      ` · ${new Date(detailTrainee.mentorReviewSubmittedAt).toLocaleDateString("vi-VN")}`}
                  </span>
                ) : (
                  <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold text-muted">
                    Mentor chưa gửi
                  </span>
                )}
              </div>
              {detailTrainee.mentorReviewStatus === "submitted" ? (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 shadow-hairline">
                    <span className="text-sm text-muted">Điểm quá trình</span>
                    <span className="text-xl font-extrabold text-accent">
                      {detailTrainee.avgScore != null
                        ? `${detailTrainee.avgScore.toFixed(1)}/10`
                        : "--"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-background px-4 py-3 shadow-hairline">
                    <p className="text-sm text-muted">
                      Note quá trình của mentor
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm">
                      {detailTrainee.mentorNote || "Mentor không ghi note."}
                    </p>
                  </div>
                </>
              ) : (
                <p className="px-1 text-sm text-muted">
                  Mentor còn đang lưu nháp — điểm và note sẽ hiện khi mentor bấm
                  "Gửi BCN".
                </p>
              )}
              <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 shadow-hairline">
                <span className="text-sm text-muted">Kết luận của BCN</span>
                <EvalBadge status={detailTrainee.evalStatus} />
              </div>
            </div>
          </div>
        </div>
      )}

      {penaltyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
            aria-label="Đóng"
            onClick={() => setPenaltyTarget(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md space-y-4 rounded-card bg-background p-5 shadow-soft"
          >
            <h2 className="font-display text-xl font-extrabold">
              Xử lý không hoàn thành
            </h2>
            <p className="text-sm text-muted">
              {penaltyTarget.fullName} — nhắc lần cuối, gia hạn 1 lần, hoặc loại
              khỏi CLB
            </p>
            <Select
              value={penaltyAction}
              onChange={(v) => setPenaltyAction(v as PenaltyActionType)}
              options={[
                { value: "final_reminder", label: "Nhắc nhở lần cuối" },
                {
                  value: "extend_once",
                  label: penaltyTarget.extendedOnce
                    ? "Gia hạn 1 lần (đã dùng)"
                    : "Gia hạn deadline +7 ngày (1 lần)",
                },
                { value: "remove_from_club", label: "Loại khỏi CLB" },
              ]}
            />
            <textarea
              className="ui-input min-h-[88px] w-full text-sm"
              placeholder="Lý do *"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPenaltyTarget(null)}
              >
                Huỷ
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={penaltySaving}
                onClick={() => void handlePenalty()}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất báo cáo đào tạo"
        description="Chọn cột và lọc trạng thái / ban trước khi tải:"
        columns={exportColumns}
        rows={filtered}
        filenameBase="danh_gia_training"
        onExported={(n) => toast.success(`Đã tải xuống ${n} dòng (CSV).`)}
      />

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={emailRecipients}
        module="training-review"
        category="training"
        preferredTemplateId="tpl-training-complete"
        title="Gửi email training"
        onSent={(sent) => toast.success(`Đã gửi email tới ${sent} học viên.`)}
      />
    </>
  );
}

export default TrainingReviewPage;
