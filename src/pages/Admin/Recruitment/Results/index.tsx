import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, MessageSquare, UserCheck } from "lucide-react";
import Button from "../../../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import FilterMenu from "../../../../components/ui/FilterMenu";
import MetricCard from "../../../../components/ui/MetricCard";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import { usePortalUi } from "../../../../context/PortalUiContext";
import useCountUp from "../../../../hooks/useCountUp";
import {
  convertAcceptedToMembers,
  getApplications,
  getCampaignResultSummary,
  getCampaigns,
  notifyFinalResults,
  type CampaignResultSummary,
} from "../../../../services/recruitmentService";
import type { Application, RecruitmentCampaign } from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";

const PAGE_SIZE = 6;

type NotifyStatus = "pending" | "email_sent" | "converted";

type ResultFilter = {
  departmentId: string;
  notifyStatus: NotifyStatus | "";
  scoreMin: string;
};

const EMPTY: ResultFilter = {
  departmentId: "",
  notifyStatus: "",
  scoreMin: "",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function notifyLabel(status?: NotifyStatus) {
  if (status === "email_sent") return "Đã Gửi Email";
  if (status === "converted") return "Đã chuyển Member";
  return "Chờ Xử Lý";
}

function NotifyBadge({ status }: { status?: NotifyStatus }) {
  const s = status ?? "pending";
  const cls =
    s === "email_sent"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : s === "converted"
        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
        : "bg-muted/15 text-muted";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {notifyLabel(s)}
    </span>
  );
}

function countActive(f: ResultFilter) {
  let n = 0;
  if (f.departmentId) n += 1;
  if (f.notifyStatus) n += 1;
  if (f.scoreMin.trim() !== "") n += 1;
  return n;
}

function KpiCard({
  value,
  label,
  tone,
  icon,
}: {
  value: number;
  label: string;
  tone: "green" | "purple" | "blue";
  icon: "file" | "chat" | "user";
}) {
  const display = useCountUp(value);
  const metricTone = tone === "green" ? "emerald" : tone === "purple" ? "violet" : "sky";
  const LucideIcon =
    icon === "file" ? FileText : icon === "chat" ? MessageSquare : UserCheck;
  return <MetricCard label={label} value={display} tone={metricTone} icon={LucideIcon} />;
}

function buildExportColumns(
  campaignName: string,
  departments: { id: string; name: string }[],
): ExportColumnDef<Application>[] {
  return [
    { id: "fullName", label: "Họ và tên", getValue: (r) => r.fullName, defaultSelected: true },
    { id: "email", label: "Email", getValue: (r) => r.email, defaultSelected: true },
    { id: "phone", label: "Số điện thoại", getValue: (r) => r.phone ?? "", defaultSelected: false },
    {
      id: "department",
      label: "Ban dự tuyển",
      getValue: (r) => r.preferredDepartmentName,
      getFilterKey: (r) => r.preferredDepartmentId,
      filterOptions: departments.map((d) => ({ value: d.id, label: d.name })),
      defaultSelected: true,
    },
    {
      id: "campaign",
      label: "Đợt tuyển",
      getValue: () => campaignName,
      defaultSelected: true,
    },
    {
      id: "interviewScore",
      label: "Điểm PV",
      getValue: (r) =>
        r.interviewScore != null
          ? String(r.interviewScore)
          : r.totalScore != null
            ? String(r.totalScore)
            : "",
      defaultSelected: true,
    },
    {
      id: "notifyStatus",
      label: "Trạng thái xử lý",
      getValue: (r) => notifyLabel(r.resultNotifyStatus),
      getFilterKey: (r) => r.resultNotifyStatus ?? "pending",
      filterOptions: [
        { value: "pending", label: "Chờ Xử Lý" },
        { value: "email_sent", label: "Đã Gửi Email" },
        { value: "converted", label: "Đã chuyển Member" },
      ],
      defaultSelected: true,
    },
    {
      id: "submittedAt",
      label: "Ngày nộp",
      getValue: (r) => formatDate(r.submittedAt),
      defaultSelected: false,
    },
  ];
}

function RecruitmentResultsPage() {
  const { search } = usePortalUi();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<CampaignResultSummary>({
    totalApplications: 0,
    interviewed: 0,
    accepted: 0,
  });
  const [campaignId, setCampaignId] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<ResultFilter>(EMPTY);
  const [applied, setApplied] = useState<ResultFilter>(EMPTY);
  const [exportOpen, setExportOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const reload = useCallback(async (cid: string) => {
    if (!cid) {
      setApplications([]);
      setSummary({ totalApplications: 0, interviewed: 0, accepted: 0 });
      return;
    }
    setLoading(true);
    try {
      const [apps, sum] = await Promise.all([
        getApplications(cid),
        getCampaignResultSummary(cid),
      ]);
      setApplications(apps);
      setSummary(sum);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    void reload(campaignId);
    setPage(1);
  }, [campaignId, reload]);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId);
  const campaignName = selectedCampaign?.name ?? "";

  const acceptedList = useMemo(
    () => applications.filter((a) => a.finalResult === "pass" || a.status === "accepted"),
    [applications],
  );

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of acceptedList) map.set(a.preferredDepartmentId, a.preferredDepartmentName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [acceptedList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const scoreMin =
      applied.scoreMin.trim() === "" ? null : Number.parseFloat(applied.scoreMin);

    return acceptedList.filter((a) => {
      if (q && !a.fullName.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q)) {
        return false;
      }
      if (applied.departmentId && a.preferredDepartmentId !== applied.departmentId) return false;
      const ns = a.resultNotifyStatus ?? "pending";
      if (applied.notifyStatus && ns !== applied.notifyStatus) return false;
      const score = a.interviewScore ?? a.totalScore;
      if (scoreMin != null && !Number.isNaN(scoreMin)) {
        if (score == null || score < scoreMin) return false;
      }
      return true;
    });
  }, [acceptedList, search, applied]);

  useEffect(() => {
    setPage(1);
  }, [search, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportColumns = useMemo(
    () => buildExportColumns(campaignName, departments),
    [campaignName, departments],
  );

  const allPageIds = paged.map((a) => a.id);
  const allChecked = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of allPageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const targetIds = () => {
    if (selectedIds.size > 0) return [...selectedIds];
    return filtered.map((a) => a.id);
  };

  const handleNotify = async () => {
    const ids = targetIds().filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && app.resultNotifyStatus !== "converted";
    });
    if (ids.length === 0) {
      showToast("Không có ứng viên phù hợp để gửi thông báo.");
      return;
    }
    setBusy(true);
    try {
      const res = await notifyFinalResults(ids);
      await reload(campaignId);
      showToast(`Đã gửi thông báo hàng loạt tới ${res.sent} ứng viên (mock).`);
    } finally {
      setBusy(false);
    }
  };

  const handleConvert = async () => {
    const ids = targetIds().filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && (app.finalResult === "pass" || app.status === "accepted");
    });
    if (ids.length === 0) {
      showToast("Chọn ít nhất một ứng viên trúng tuyển để chuyển đổi.");
      return;
    }
    const ok = window.confirm(`Chuyển ${ids.length} ứng viên thành Member?`);
    if (!ok) return;
    setBusy(true);
    try {
      const res = await convertAcceptedToMembers(ids);
      await reload(campaignId);
      showToast(`Đã chuyển ${res.converted} ứng viên thành Member (mock).`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kết quả &amp; Chuyển đổi
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted">
            <span className="text-sm sm:text-base">Tổng kết đợt tuyển dụng</span>
            <Select
              value={campaignId}
              options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
              onChange={setCampaignId}
              placeholder="Chọn đợt tuyển"
              ariaLabel="Bộ lọc theo đợt tuyển"
              className="min-w-[220px]"
              triggerClassName="!shadow-extruded-sm !h-10 text-accent !font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            disabled={busy}
            onClick={() => void handleNotify()}
            leftIcon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M3 10.5 17 4l-3.5 12-3-4.5L3 10.5Z" strokeLinejoin="round" />
              </svg>
            }
          >
            Gửi thông báo hàng loạt
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            disabled={busy}
            onClick={() => void handleConvert()}
            leftIcon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="8" cy="7" r="3" />
                <path d="M2.5 16.5a5.5 5.5 0 0 1 11 0M14.5 6v5M12 8.5h5" strokeLinecap="round" />
              </svg>
            }
          >
            Chuyển đổi thành Member
          </Button>
        </div>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-muted">Tổng quan đợt</p>
          <div className="flex flex-wrap items-center gap-2">
            <FilterMenu
              activeCount={countActive(applied)}
              label="Lọc điều kiện"
              onApply={() => setApplied(draft)}
              onReset={() => {
                setDraft(EMPTY);
                setApplied(EMPTY);
              }}
            >
              <div>
                <span className="neu-field-label">Ban dự tuyển</span>
                <Select
                  width="full"
                  value={draft.departmentId}
                  options={[
                    { value: "", label: "Tất cả ban" },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  onChange={(departmentId) => setDraft({ ...draft, departmentId })}
                />
              </div>
              <div>
                <span className="neu-field-label">Trạng thái xử lý</span>
                <Select
                  width="full"
                  value={draft.notifyStatus}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "pending", label: "Chờ Xử Lý" },
                    { value: "email_sent", label: "Đã Gửi Email" },
                    { value: "converted", label: "Đã chuyển Member" },
                  ]}
                  onChange={(notifyStatus) =>
                    setDraft({ ...draft, notifyStatus: notifyStatus as NotifyStatus | "" })
                  }
                />
              </div>
              <div>
                <span className="neu-field-label">Điểm PV tối thiểu</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="neu-input !h-11 text-sm"
                  placeholder="VD: 8"
                  value={draft.scoreMin}
                  onChange={(e) => setDraft({ ...draft, scoreMin: e.target.value })}
                />
              </div>
            </FilterMenu>
            <Button
              variant="soft"
              size="sm"
              className="!h-11"
              onClick={() => setExportOpen(true)}
              leftIcon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              Xuất danh sách
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard value={summary.totalApplications} label="Tổng Hồ Sơ Nhận" tone="green" icon="file" />
          <KpiCard value={summary.interviewed} label="Đã Phỏng Vấn" tone="purple" icon="chat" />
          <KpiCard value={summary.accepted} label="Trúng Tuyển Chính Thức" tone="blue" icon="user" />
        </div>
      </section>

      <section className="neu-card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-foreground">Danh sách Trúng Tuyển</h2>
          <p className="text-sm text-muted">
            Hiển thị <span className="font-semibold text-foreground">{filtered.length}</span>
            {selectedIds.size > 0 && (
              <>
                {" "}
                · đã chọn <span className="font-semibold text-accent">{selectedIds.size}</span>
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="h-56 animate-pulse bg-accent/5" aria-busy="true" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed text-left">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[28%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="bg-accent/15 text-sm text-accent">
                  <th className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-accent"
                      checked={allChecked}
                      onChange={(e) => toggleAllPage(e.target.checked)}
                      aria-label="Chọn tất cả trên trang"
                    />
                  </th>
                  <th className="px-3 py-3.5 font-semibold uppercase tracking-wide text-xs">Ứng viên</th>
                  <th className="px-3 py-3.5 font-semibold uppercase tracking-wide text-xs">Ban dự tuyển</th>
                  <th className="px-3 py-3.5 font-semibold uppercase tracking-wide text-xs text-center">
                    Điểm PV
                  </th>
                  <th className="px-3 py-3.5 font-semibold uppercase tracking-wide text-xs text-center">
                    Trạng thái
                  </th>
                  <th className="px-3 py-3.5 font-semibold uppercase tracking-wide text-xs text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted">
                      Không có ứng viên trúng tuyển phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paged.map((app) => {
                    const score = app.interviewScore ?? app.totalScore;
                    return (
                      <tr key={app.id} className="transition-colors hover:bg-accent/[0.04]">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded accent-accent"
                            checked={selectedIds.has(app.id)}
                            onChange={() => toggleOne(app.id)}
                            aria-label={`Chọn ${app.fullName}`}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent shadow-inset-sm">
                              {initials(app.fullName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{app.fullName}</p>
                              <p className="truncate text-xs text-muted">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-foreground">{app.preferredDepartmentName}</td>
                        <td className="px-3 py-4 text-center text-sm font-bold text-foreground">
                          {score != null ? score.toFixed(1) : "--"}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <NotifyBadge status={app.resultNotifyStatus} />
                        </td>
                        <td className="relative px-3 py-4 text-center">
                          <Button
                            variant="icon"
                            size="sm"
                            aria-label={`Thao tác ${app.fullName}`}
                            aria-expanded={menuId === app.id}
                            onClick={() => setMenuId((id) => (id === app.id ? null : app.id))}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <circle cx="10" cy="4" r="1.5" />
                              <circle cx="10" cy="10" r="1.5" />
                              <circle cx="10" cy="16" r="1.5" />
                            </svg>
                          </Button>
                          {menuId === app.id && (
                            <div className="absolute right-4 top-12 z-20 w-48 rounded-2xl bg-background p-2 shadow-extruded ring-1 ring-black/5 text-left">
                              <button
                                type="button"
                                className="block w-full rounded-xl px-3 py-2 text-sm hover:bg-accent/10"
                                onClick={async () => {
                                  setMenuId(null);
                                  await notifyFinalResults([app.id]);
                                  await reload(campaignId);
                                  showToast(`Đã gửi email tới ${app.fullName}.`);
                                }}
                              >
                                Gửi thông báo
                              </button>
                              <button
                                type="button"
                                className="block w-full rounded-xl px-3 py-2 text-sm hover:bg-accent/10"
                                onClick={async () => {
                                  setMenuId(null);
                                  await convertAcceptedToMembers([app.id]);
                                  await reload(campaignId);
                                  showToast(`Đã chuyển ${app.fullName} thành Member.`);
                                }}
                              >
                                Chuyển thành Member
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất danh sách trúng tuyển"
        description="Chọn cột và lọc trạng thái / ban trước khi tải xuống:"
        columns={exportColumns}
        rows={filtered}
        filenameBase={`trung_tuyen_${campaignId || "dot"}`}
        onExported={(n) => showToast(`Đã tải xuống ${n} dòng (CSV).`)}
      />
    </>
  );
}

export default RecruitmentResultsPage;
