import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, MessageSquare, Send, UserCheck, UserPlus } from "lucide-react";
import Button from "../../../../components/ui/Button";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import FilterMenu from "../../../../components/ui/FilterMenu";
import Icon from "../../../../components/ui/Icon";
import MetricCard from "../../../../components/ui/MetricCard";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { usePortalUi } from "../../../../context/usePortalUi";
import useCountUp from "../../../../hooks/useCountUp";
import {
  convertAcceptedToMembers,
  getApplications,
  getCampaignResultSummary,
  getCampaigns,
  notifyFinalResults,
  rejectFinalCandidates,
  assignOfficialDepartment,
  type CampaignResultSummary,
} from "../../../../services/recruitmentService";
import type { Application, RecruitmentCampaign } from "../../../../types/recruitment";
import type { EmailRecipient } from "../../../../types/email";
import { applicationToEmailRecipient } from "../../../../utils/emailRecipients";
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
  if (status === "converted") return "Đã vào training";
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
        { value: "converted", label: "Đã vào training" },
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
  const [convertIds, setConvertIds] = useState<string[] | null>(null);
  const [rejectIds, setRejectIds] = useState<string[] | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [emailTemplateId, setEmailTemplateId] = useState<string | undefined>("tpl-passed");

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const openEmailForIds = (ids: string[], preferredTemplateId?: string) => {
    const apps = applications.filter((a) => ids.includes(a.id) && a.resultNotifyStatus !== "converted");
    if (apps.length === 0) {
      showToast("Không có ứng viên phù hợp để gửi email.");
      return;
    }
    const passApps = apps.filter(
      (a) =>
        a.interviewResult === "pass" ||
        a.status === "interview_passed" ||
        a.status === "accepted",
    );
    const failApps = apps.filter(
      (a) =>
        a.interviewResult === "fail" ||
        a.status === "interview_failed" ||
        a.status === "rejected" ||
        a.status === "cv_failed",
    );
    let templateId = preferredTemplateId;
    let targets = apps;
    if (!templateId) {
      if (passApps.length > 0 && failApps.length > 0) {
        showToast(
          "Danh sách vừa Pass vừa Fail — gửi riêng từng nhóm hoặc chọn từng người.",
        );
        return;
      }
      if (failApps.length > 0 && passApps.length === 0) {
        templateId = "tpl-rejected";
        targets = failApps;
      } else {
        templateId = "tpl-passed";
        targets = passApps.length > 0 ? passApps : apps;
      }
    }
    setEmailRecipients(targets.map((a) => applicationToEmailRecipient(a)));
    setEmailTemplateId(templateId);
    setEmailOpen(true);
    setMenuId(null);
  };

  const reload = useCallback(async (cid: string) => {
    try {
      // Luôn await để mọi setState nằm sau async boundary
      const [apps, sum] = await (cid
        ? Promise.all([getApplications(cid), getCampaignResultSummary(cid)])
        : Promise.resolve([[], { totalApplications: 0, interviewed: 0, accepted: 0 }] as const));
      setApplications(apps as Application[]);
      setSummary(sum as CampaignResultSummary);
      setSelectedIds(new Set());
    } catch (err) {
      showToast(
        err instanceof Error
          ? `Không tải được kết quả: ${err.message}`
          : "Không tải được kết quả tuyển dụng.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
    return () => {
      alive = false;
    };
  }, []);

  // Đổi đợt tuyển → về trang 1 + bật skeleton (adjust state during render)
  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  if (campaignId !== prevCampaignId) {
    setPrevCampaignId(campaignId);
    setPage(1);
    setLoading(true);
  }

  useEffect(() => {
    void reload(campaignId);
  }, [campaignId, reload]);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId);
  const campaignName = selectedCampaign?.name ?? "";

  // Pool kết quả cuối: đã Pass PV (chờ chốt / đã trúng / không trúng tuyển)
  const decisionList = useMemo(
    () => applications.filter((a) => a.interviewResult === "pass"),
    [applications],
  );

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of decisionList) map.set(a.preferredDepartmentId, a.preferredDepartmentName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [decisionList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const scoreMin =
      applied.scoreMin.trim() === "" ? null : Number.parseFloat(applied.scoreMin);

    return decisionList.filter((a) => {
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
  }, [decisionList, search, applied]);

  // Đổi tìm kiếm / bộ lọc → về trang 1 (adjust state during render)
  const [prevFilterKey, setPrevFilterKey] = useState("");
  const filterKey = `${search}|${JSON.stringify(applied)}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

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

  const handleNotify = () => {
    openEmailForIds(targetIds());
  };

  const handleConvert = async () => {
    const ids = targetIds().filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && app.status === "interview_passed";
    });
    if (ids.length === 0) {
      showToast("Chọn ứng viên đang ở trạng thái Đạt phỏng vấn để xác nhận trúng tuyển.");
      return;
    }
    setConvertIds(ids);
  };

  const handleReject = () => {
    const ids = targetIds().filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && app.status === "interview_passed";
    });
    if (ids.length === 0) {
      showToast("Chọn ứng viên đang ở trạng thái Đạt phỏng vấn để đánh dấu không trúng tuyển.");
      return;
    }
    setRejectIds(ids);
  };

  const confirmConvert = async () => {
    if (!convertIds) return;
    setBusy(true);
    try {
      const res = await convertAcceptedToMembers(convertIds);
      await reload(campaignId);
      if (res.converted === 0) {
        showToast("Không có ứng viên nào được xác nhận trúng tuyển.");
      } else if (res.failed > 0) {
        showToast(
          `Đã xác nhận ${res.converted} ứng viên; ${res.failed} hồ sơ thất bại.`,
        );
      } else {
        showToast(`Đã xác nhận trúng tuyển ${res.converted} ứng viên → tân binh (vẫn role Ứng viên). Chỉ lên Member sau khi hoàn thành training.`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Xác nhận trúng tuyển thất bại.");
    } finally {
      setBusy(false);
      setConvertIds(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectIds) return;
    setBusy(true);
    try {
      const res = await rejectFinalCandidates(rejectIds);
      await reload(campaignId);
      if (res.rejected === 0) {
        showToast("Không có ứng viên nào bị đánh dấu không trúng tuyển.");
      } else if (res.failed > 0) {
        showToast(
          `Đã đánh dấu ${res.rejected} ứng viên; ${res.failed} hồ sơ thất bại.`,
        );
      } else {
        showToast(`Đã đánh dấu không trúng tuyển ${res.rejected} ứng viên.`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Đánh dấu không trúng tuyển thất bại.");
    } finally {
      setBusy(false);
      setRejectIds(null);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={convertIds !== null}
        title="Xác nhận trúng tuyển"
        message={`Xác nhận ${convertIds?.length ?? 0} ứng viên trúng tuyển? Họ vào Tân binh training, giữ role Ứng viên — chỉ lên Member sau khi hoàn thành training.`}
        confirmLabel="Trúng tuyển (tân binh)"
        loading={busy}
        onConfirm={confirmConvert}
        onClose={() => setConvertIds(null)}
      />
      <ConfirmDialog
        open={rejectIds !== null}
        title="Không trúng tuyển"
        message={`Đánh dấu ${rejectIds?.length ?? 0} ứng viên không trúng tuyển? Tài khoản ứng viên sẽ bị vô hiệu hoá.`}
        confirmLabel="Không trúng tuyển"
        loading={busy}
        onConfirm={confirmReject}
        onClose={() => setRejectIds(null)}
      />
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kết quả cuối cùng
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted">
            <span className="text-sm sm:text-base">Tổng hợp sau 2 vòng — xác nhận trúng tuyển</span>
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
            onClick={() => handleNotify()}
            leftIcon={<Icon icon={Send} size={16} />}
          >
            Gửi email hàng loạt
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            disabled={busy}
            onClick={handleReject}
          >
            Không trúng tuyển
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!h-11"
            disabled={busy}
            onClick={() => void handleConvert()}
            leftIcon={<Icon icon={UserPlus} size={16} />}
          >
            Xác nhận trúng tuyển
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
                    { value: "converted", label: "Đã vào training" },
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
          <h2 className="font-display text-lg font-bold text-foreground">
            Ứng viên đã qua 2 vòng
          </h2>
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
                      Không có ứng viên đạt phỏng vấn phù hợp bộ lọc.
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
                        <td className="px-3 py-4 text-sm text-foreground">
                          {app.status === "interview_passed" &&
                          app.departmentPreferences.length > 1 ? (
                            <select
                              className="neu-input !h-10 !text-sm max-w-full"
                              value={app.preferredDepartmentName}
                              onChange={async (e) => {
                                const dept = e.target.value;
                                try {
                                  await assignOfficialDepartment(app.id, dept);
                                  await reload(campaignId);
                                  showToast(`Đã chuyển ${app.fullName} sang ban ${dept}.`);
                                } catch (err) {
                                  showToast(
                                    err instanceof Error
                                      ? err.message
                                      : "Đổi ban thất bại.",
                                  );
                                }
                              }}
                              aria-label={`Đổi ban cho ${app.fullName}`}
                            >
                              {app.departmentPreferences.map((p) => (
                                <option key={p.priority} value={p.department}>
                                  NV{p.priority}: {p.department}
                                </option>
                              ))}
                            </select>
                          ) : (
                            app.preferredDepartmentName
                          )}
                        </td>
                        <td className="px-3 py-4 text-center text-sm font-bold text-foreground">
                          {score != null ? score.toFixed(1) : "--"}
                        </td>
                        <td className="px-3 py-4 text-center">
                          {app.status === "interview_passed" ? (
                            <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700">
                              Chờ kết quả cuối
                            </span>
                          ) : app.status === "accepted" ? (
                            <NotifyBadge status={app.resultNotifyStatus ?? "converted"} />
                          ) : (
                            <span className="inline-flex rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700">
                              Không trúng tuyển
                            </span>
                          )}
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
                            <div className="absolute right-4 top-12 z-20 w-52 rounded-2xl bg-background p-2 shadow-extruded ring-1 ring-black/5 text-left">
                              <button
                                type="button"
                                className="block w-full rounded-xl px-3 py-2 text-sm hover:bg-accent/10"
                                onClick={() => openEmailForIds([app.id])}
                              >
                                Gửi email
                              </button>
                              {app.status === "interview_passed" && (
                                <>
                                  <button
                                    type="button"
                                    className="block w-full rounded-xl px-3 py-2 text-sm text-accent hover:bg-accent/10"
                                    onClick={() => {
                                      setMenuId(null);
                                      setConvertIds([app.id]);
                                    }}
                                  >
                                    Trúng tuyển
                                  </button>
                                  <button
                                    type="button"
                                    className="block w-full rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
                                    onClick={() => {
                                      setMenuId(null);
                                      setRejectIds([app.id]);
                                    }}
                                  >
                                    Không trúng tuyển
                                  </button>
                                </>
                              )}
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

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={emailRecipients}
        module="recruitment-results"
        category="recruitment"
        preferredTemplateId={emailTemplateId}
        title="Gửi email kết quả tuyển"
        onSent={async (sent) => {
          if (sent <= 0) return;
          const ids = emailRecipients.map((r) => r.id);
          try {
            await notifyFinalResults(ids);
            await reload(campaignId);
            showToast(`Đã gửi email tới ${sent} ứng viên.`);
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

export default RecruitmentResultsPage;
