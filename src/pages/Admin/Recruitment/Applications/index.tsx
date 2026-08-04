import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import { ROUTES } from "../../../../constants/routes";
import { usePortalUi } from "../../../../context/usePortalUi";
import { getApplications, getCampaigns } from "../../../../services/recruitmentService";
import type { Application, ApplicationStatus, RecruitmentCampaign } from "../../../../types/recruitment";
import { formatDate } from "../../../../utils/formatDate";
import ApplicationFilterBar, {
  type ApplicationFilterDraft,
} from "./components/ApplicationFilterBar";
import ApplicationTable from "./components/ApplicationTable";
import { getApplicationStatusLabel } from "./components/applicationStatus";

const PAGE_SIZE = 5;

const EMPTY_FILTER: ApplicationFilterDraft = {
  departmentId: "",
  status: "",
  scoreMin: "",
};

function countActiveFilters(f: ApplicationFilterDraft) {
  let n = 0;
  if (f.departmentId) n += 1;
  if (f.status) n += 1;
  if (f.scoreMin.trim() !== "") n += 1;
  return n;
}

function buildApplicationExportColumns(
  campaignName: string,
  departments: { id: string; name: string }[],
): ExportColumnDef<Application>[] {
  return [
    { id: "fullName", label: "Họ và tên", getValue: (r) => r.fullName, defaultSelected: true },
    { id: "email", label: "Email", getValue: (r) => r.email, defaultSelected: true },
    { id: "phone", label: "Số điện thoại", getValue: (r) => r.phone ?? "", defaultSelected: true },
    {
      id: "department",
      label: "Ban nguyện vọng",
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
      id: "submittedAt",
      label: "Ngày nộp",
      getValue: (r) => formatDate(r.submittedAt),
      defaultSelected: true,
    },
    {
      id: "totalScore",
      label: "Điểm ĐG",
      getValue: (r) => (r.totalScore != null ? String(r.totalScore) : ""),
      defaultSelected: true,
    },
    {
      id: "status",
      label: "Trạng thái",
      getValue: (r) => getApplicationStatusLabel(r.status),
      getFilterKey: (r) => r.status,
      filterOptions: [
        { value: "submitted", label: "Mới nộp" },
        { value: "screening", label: "Đang đánh giá" },
        { value: "interview", label: "Chờ phỏng vấn" },
        { value: "accepted", label: "Đã đậu" },
        { value: "rejected", label: "Loại" },
      ],
      defaultSelected: true,
    },
  ];
}

function RecruitmentApplicationsPage() {
  const { search, navigate } = usePortalUi();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [campaignId, setCampaignId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [draftFilter, setDraftFilter] = useState<ApplicationFilterDraft>(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<ApplicationFilterDraft>(EMPTY_FILTER);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const loadCampaigns = useCallback(async () => {
    const data = await getCampaigns();
    // Chỉ đợt đã publish/closed mới có hồ sơ thực tế
    const usable = data.filter((c) => c.status !== "draft");
    setCampaigns(usable);
    setCampaignId((prev) => {
      if (prev && usable.some((c) => c.id === prev)) return prev;
      const active = usable.find((c) => c.isActive);
      return active?.id ?? usable[0]?.id ?? "";
    });
  }, []);

  const loadApplications = useCallback(async (id: string) => {
    if (!id) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getApplications(id);
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    void loadApplications(campaignId);
    setSelectedIds(new Set());
    setPage(1);
  }, [campaignId, loadApplications]);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const app of applications) {
      map.set(app.preferredDepartmentId, app.preferredDepartmentName);
    }
    if (selectedCampaign) {
      for (const q of selectedCampaign.quotas) {
        map.set(q.departmentId, q.departmentName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [applications, selectedCampaign]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const scoreMin =
      appliedFilter.scoreMin.trim() === ""
        ? null
        : Number.parseFloat(appliedFilter.scoreMin);

    return applications.filter((app) => {
      if (q) {
        const hit =
          app.fullName.toLowerCase().includes(q) ||
          app.email.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (appliedFilter.departmentId && app.preferredDepartmentId !== appliedFilter.departmentId) {
        return false;
      }
      if (appliedFilter.status && app.status !== (appliedFilter.status as ApplicationStatus)) {
        return false;
      }
      if (scoreMin != null && !Number.isNaN(scoreMin)) {
        if (app.totalScore == null || app.totalScore < scoreMin) return false;
      }
      return true;
    });
  }, [applications, search, appliedFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const campaignOptions = campaigns.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? "";
  const exportColumns = useMemo(
    () => buildApplicationExportColumns(campaignName, departmentOptions),
    [campaignName, departmentOptions],
  );

  const activeFilterCount = countActiveFilters(appliedFilter);

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Danh sách ứng tuyển
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted">
            <span className="text-sm sm:text-base">Quản lý và duyệt hồ sơ ứng viên</span>
            <Select
              value={campaignId}
              options={campaignOptions}
              onChange={setCampaignId}
              placeholder="Chọn đợt tuyển"
              ariaLabel="Bộ lọc theo đợt tuyển"
              className="min-w-[220px]"
              triggerClassName="!shadow-extruded-sm !h-10 text-accent !font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">
            Tổng số:{" "}
            <span className="font-bold text-foreground">{filtered.length}</span>
          </p>
          <ApplicationFilterBar
            draft={draftFilter}
            onDraftChange={setDraftFilter}
            departments={departmentOptions}
            activeCount={activeFilterCount}
            onApply={() => setAppliedFilter(draftFilter)}
            onReset={() => {
              setDraftFilter(EMPTY_FILTER);
              setAppliedFilter(EMPTY_FILTER);
            }}
          />
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
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      {loading ? (
        <div className="neu-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />
      ) : (
        <>
          <ApplicationTable
            applications={paged}
            selectedIds={selectedIds}
            onToggleOne={handleToggleOne}
            onToggleAll={handleToggleAll}
            onOpenDetail={(app) => navigate(ROUTES.admin.recruitment.applicationDetail(app.id))}
          />
          <div className="flex justify-end">
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất danh sách hồ sơ"
        description="Chọn cột cần xuất. Với cột trạng thái / ban, chọn giá trị muốn giữ lại:"
        columns={exportColumns}
        rows={filtered}
        filenameBase={`ho_so_${campaignId || "dot"}`}
        onExported={(n) => showToast(`Đã tải xuống ${n} hồ sơ (CSV).`)}
      />
    </>
  );
}

export default RecruitmentApplicationsPage;
