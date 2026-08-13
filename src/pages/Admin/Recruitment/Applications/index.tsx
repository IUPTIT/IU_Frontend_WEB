import { useCallback, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import Icon from "../../../../components/ui/Icon";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { ROUTES } from "../../../../constants/routes";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import {
  getApplications,
  getCampaigns,
  bulkDecideCvByThreshold,
  getFormQuestions,
  exportApplications,
} from "../../../../services/recruitmentService";
import type {
  Application,
  ApplicationStatus,
  FormQuestion,
  RecruitmentCampaign,
} from "../../../../types/recruitment";
import { applicationToEmailRecipient } from "../../../../utils/emailRecipients";
import { formatDate } from "../../../../utils/formatDate";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import ApplicationFilterBar, {
  type ApplicationFilterDraft,
} from "./components/ApplicationFilterBar";
import ApplicationTable from "./components/ApplicationTable";

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
  questions: FormQuestion[],
  applications: Application[] = [],
): ExportColumnDef<Application>[] {
  const formatDob = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const profile: ExportColumnDef<Application>[] = [
    {
      id: "fullName",
      label: "Họ và tên",
      getValue: (r) => r.fullName,
      defaultSelected: true,
      serverKey: { type: "profile", key: "fullName" },
    },
    {
      id: "studentId",
      label: "MSSV",
      getValue: (r) => r.studentId ?? "",
      defaultSelected: true,
      serverKey: { type: "profile", key: "studentId" },
    },
    {
      id: "className",
      label: "Lớp",
      getValue: (r) => r.className ?? "",
      defaultSelected: true,
      serverKey: { type: "profile", key: "className" },
    },
    {
      id: "faculty",
      label: "Khoa/Ngành",
      getValue: (r) => r.faculty ?? "",
      defaultSelected: true,
      serverKey: { type: "profile", key: "faculty" },
    },
    {
      id: "email",
      label: "Email",
      getValue: (r) => r.email,
      defaultSelected: true,
      serverKey: { type: "profile", key: "email" },
    },
    {
      id: "phone",
      label: "Số điện thoại",
      getValue: (r) => r.phone ?? "",
      defaultSelected: true,
      serverKey: { type: "profile", key: "phone" },
    },
    {
      id: "dateOfBirth",
      label: "Ngày sinh",
      getValue: (r) => formatDob(r.dateOfBirth),
      defaultSelected: true,
      serverKey: { type: "profile", key: "dateOfBirth" },
    },
    {
      id: "department",
      label: "Ban nguyện vọng",
      getValue: (r) => r.preferredDepartmentName,
      getFilterKey: (r) => r.preferredDepartmentId,
      filterOptions: departments.map((d) => ({ value: d.id, label: d.name })),
      defaultSelected: true,
      serverKey: { type: "profile", key: "department" },
    },
    {
      id: "departmentPreferences",
      label: "Nguyện vọng (đủ)",
      getValue: (r) =>
        [...(r.departmentPreferences ?? [])]
          .sort((a, b) => a.priority - b.priority)
          .map((p, i) => `NV${i + 1}: ${p.department}`)
          .join(" · ") || r.preferredDepartmentName,
      defaultSelected: true,
      serverKey: { type: "profile", key: "departmentPreferences" },
    },
    {
      id: "campaign",
      label: "Đợt tuyển",
      getValue: () => campaignName,
      defaultSelected: true,
      serverKey: { type: "profile", key: "campaign" },
    },
    {
      id: "submittedAt",
      label: "Ngày nộp",
      getValue: (r) => formatDate(r.submittedAt),
      defaultSelected: true,
      serverKey: { type: "profile", key: "submittedAt" },
    },
    {
      id: "totalScore",
      label: "Điểm vòng đơn",
      getValue: (r) => (r.totalScore != null ? String(r.totalScore) : ""),
      defaultSelected: true,
      serverKey: { type: "profile", key: "totalScore" },
    },
    {
      id: "screeningStatus",
      label: "Kết quả vòng đơn",
      getValue: (r) => {
        if (r.screeningResult === "fail" || r.status === "cv_failed") {
          return "Không đạt vòng đơn";
        }
        if (r.screeningResult === "pending" || r.status === "submitted" || r.status === "screening") {
          return "Chờ xét duyệt";
        }
        return "Đạt vòng đơn";
      },
      getFilterKey: (r) => {
        if (r.screeningResult === "fail" || r.status === "cv_failed") return "fail";
        if (r.screeningResult === "pending" || r.status === "submitted" || r.status === "screening") {
          return "pending";
        }
        return "pass";
      },
      filterOptions: [
        { value: "pending", label: "Chờ xét duyệt" },
        { value: "pass", label: "Đạt vòng đơn" },
        { value: "fail", label: "Không đạt vòng đơn" },
      ],
      defaultSelected: true,
      serverKey: { type: "profile", key: "screeningStatus" },
    },
  ];

  const knownQuestionIds = new Set(questions.map((q) => q.id));
  const FIXED_ANSWER_IDS = new Set([
    "full_name",
    "student_id",
    "class_name",
    "faculty",
    "email",
    "phone",
    "date_of_birth",
    "avatar",
    "cv",
    "department_preferences",
  ]);

  // Câu hỏi custom trên form — mặc định chọn hết để xuất đủ đáp án SV
  const answerCols: ExportColumnDef<Application>[] = questions.map((q) => ({
    id: `q:${q.id}`,
    label: q.content,
    group: "Câu trả lời form",
    defaultSelected: true,
    serverKey: { type: "question" as const, key: q.id },
    getValue: (r) => {
      const v = r.answers[q.id];
      if (v == null) return "";
      return Array.isArray(v) ? v.join(", ") : String(v);
    },
    ...(q.type === "single_choice" || q.type === "multi_choice"
      ? {
          getFilterKey: (r: Application) => {
            const v = r.answers[q.id];
            return Array.isArray(v) ? v.join(", ") : String(v ?? "");
          },
          filterOptions: (q.options ?? []).map((o) => ({ value: o.label, label: o.label })),
        }
      : {}),
  }));

  // Fallback: fieldId có trong answers nhưng không còn / chưa có trên form
  const orphanIds = new Set<string>();
  for (const app of applications) {
    for (const fieldId of Object.keys(app.answers ?? {})) {
      if (FIXED_ANSWER_IDS.has(fieldId) || knownQuestionIds.has(fieldId)) continue;
      orphanIds.add(fieldId);
    }
  }
  for (const fieldId of orphanIds) {
    answerCols.push({
      id: `q:${fieldId}`,
      label: fieldId,
      group: "Câu trả lời form",
      defaultSelected: true,
      serverKey: { type: "question", key: fieldId },
      getValue: (r) => {
        const v = r.answers[fieldId];
        if (v == null) return "";
        return Array.isArray(v) ? v.join(", ") : String(v);
      },
    });
  }

  return [...profile, ...answerCols];
}

function RecruitmentApplicationsPage() {
  const { search, navigate } = usePortalUi();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  // campaignId dẫn xuất: user chọn thì ưu tiên, không thì lấy đợt đang mở / mới nhất
  const [campaignIdOverride, setCampaignIdOverride] = useState<string>("");
  const campaignId = useMemo(() => {
    if (campaignIdOverride && campaigns.some((c) => c.id === campaignIdOverride)) {
      return campaignIdOverride;
    }
    return campaigns.find((c) => c.isActive)?.id ?? campaigns[0]?.id ?? "";
  }, [campaignIdOverride, campaigns]);
  const setCampaignId = setCampaignIdOverride;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState("7");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailKind, setEmailKind] = useState<"pass" | "fail">("pass");
  /** Người nhận email Pass/Fail — tự lọc theo trạng thái (không phụ thuộc tick) */
  const [emailApps, setEmailApps] = useState<Application[]>([]);

  const [draftFilter, setDraftFilter] = useState<ApplicationFilterDraft>(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<ApplicationFilterDraft>(EMPTY_FILTER);

  const showToast = (msg: string) => {
    toast.info(msg);
  };

  const loadApplications = useCallback(async (id: string) => {
    try {
      // Luôn await để mọi setState nằm sau async boundary (react-hooks/set-state-in-effect)
      const data = await (id ? getApplications(id) : Promise.resolve<Application[]>([]));
      setApplications(data);
    } catch (err) {
      showToast(
        err instanceof Error
          ? `Không tải được hồ sơ: ${err.message}`
          : "Không tải được danh sách hồ sơ.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Đổi đợt tuyển → reset chọn/trang + bật skeleton (adjust state during render)
  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  if (campaignId !== prevCampaignId) {
    setPrevCampaignId(campaignId);
    setSelectedIds(new Set());
    setPage(1);
    setLoading(true);
    setQuestions([]);
  }

  useEffect(() => {
    let alive = true;
    void getCampaigns().then((data) => {
      // Chỉ đợt đã publish/closed mới có hồ sơ thực tế
      if (alive) setCampaigns(data.filter((c) => c.status !== "draft"));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void loadApplications(campaignId);
  }, [campaignId, loadApplications]);

  useEffect(() => {
    if (!campaignId) return;
    let alive = true;
    getFormQuestions(campaignId)
      .then((qs) => {
        if (alive) setQuestions(qs);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [campaignId]);

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

  // Đổi tìm kiếm / bộ lọc → về trang 1 (adjust state during render)
  const [prevFilterKey, setPrevFilterKey] = useState("");
  const filterKey = `${search}|${JSON.stringify(appliedFilter)}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const campaignOptions = campaigns.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? "";
  /** Câu hỏi dùng cho modal xuất — set ngay trước khi mở để không bị stale */
  const [exportQuestions, setExportQuestions] = useState<FormQuestion[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const exportColumns = useMemo(
    () =>
      buildApplicationExportColumns(
        campaignName,
        departmentOptions,
        exportQuestions.length > 0 ? exportQuestions : questions,
        applications,
      ),
    [campaignName, departmentOptions, exportQuestions, questions, applications],
  );

  const openExportModal = async () => {
    if (!campaignId) {
      showToast("Chọn đợt tuyển trước khi xuất.");
      return;
    }
    setExportLoading(true);
    try {
      const qs = await getFormQuestions(campaignId);
      setQuestions(qs);
      setExportQuestions(qs);
      if (qs.length === 0) {
        showToast("Đợt này chưa có câu hỏi form tùy chỉnh — vẫn xuất được thông tin cá nhân.");
      }
      setExportOpen(true);
    } catch {
      showToast("Không tải được câu hỏi form — thử lại.");
    } finally {
      setExportLoading(false);
    }
  };

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

  const confirmBulkDecide = async () => {
    const threshold = Number.parseFloat(bulkThreshold);
    if (!campaignId || Number.isNaN(threshold)) {
      showToast("Ngưỡng điểm không hợp lệ.");
      return;
    }
    setBulkBusy(true);
    try {
      const res = await bulkDecideCvByThreshold(campaignId, threshold, true);
      await loadApplications(campaignId);
      showToast(
        `Duyệt hàng loạt: Pass ${res.passed}, Fail ${res.failed}, bỏ qua ${res.skipped} (ngưỡng ${threshold}/10). Hệ thống tự gửi email Pass/Trượt vòng đơn.`,
      );
      setBulkOpen(false);
    } catch {
      showToast("Duyệt hàng loạt thất bại — kiểm tra lại.");
    } finally {
      setBulkBusy(false);
    }
  };

  const openBulkEmail = (kind: "pass" | "fail") => {
    // Pass = status "interview" (Đạt vòng đơn); Fail = "cv_failed"
    const status = kind === "pass" ? "interview" : "cv_failed";
    const targets = applications.filter((a) => a.status === status);
    if (targets.length === 0) {
      showToast(
        kind === "pass"
          ? "Không có hồ sơ Đạt vòng đơn trong đợt này để gửi email."
          : "Không có hồ sơ Không đạt vòng đơn trong đợt này để gửi email.",
      );
      return;
    }
    setEmailKind(kind);
    setEmailApps(targets);
    setEmailOpen(true);
  };

  return (
    <>
      <ConfirmDialog
        open={bulkOpen}
        title="Duyệt hàng loạt theo ngưỡng điểm"
        message={`Hồ sơ Chờ xét duyệt đã có điểm ≥ ${bulkThreshold || "?"}/10 → Đạt vòng đơn; thấp hơn → Không đạt. Hồ sơ chưa chấm sẽ bỏ qua.`}
        confirmLabel="Duyệt hàng loạt"
        loading={bulkBusy}
        onConfirm={confirmBulkDecide}
        onClose={() => setBulkOpen(false)}
      />
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Danh sách ứng tuyển
            </h1>
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              className="neu-input !h-11 !w-20 text-sm"
              value={bulkThreshold}
              onChange={(e) => setBulkThreshold(e.target.value)}
              aria-label="Ngưỡng điểm Pass"
            />
            <Button variant="secondary" size="sm" className="!h-11" onClick={() => setBulkOpen(true)}>
              Duyệt theo ngưỡng
            </Button>
          </div>
          <Button
            variant="soft"
            size="sm"
            className="!h-11"
            leftIcon={<Icon icon={Send} size={15} />}
            onClick={() => openBulkEmail("pass")}
            title="Tự lọc hồ sơ Đạt vòng đơn → xem trước / gửi thử / gửi hàng loạt"
          >
            Email Pass vòng đơn
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            leftIcon={<Icon icon={Send} size={15} />}
            onClick={() => openBulkEmail("fail")}
            title="Tự lọc hồ sơ Không đạt vòng đơn → xem trước / gửi thử / gửi hàng loạt"
          >
            Email Trượt vòng đơn
          </Button>
          <p className="text-sm text-muted">
            Tổng số:{" "}
            <span className="font-bold text-red-500">{filtered.length}</span>
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
            disabled={exportLoading || !campaignId}
            onClick={() => void openExportModal()}
            leftIcon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            {exportLoading ? "Đang tải…" : "Xuất danh sách"}
          </Button>
        </div>
      </section>

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
        description="Thông tin cá nhân + toàn bộ câu trả lời form đăng ký. Có thể bỏ chọn cột không cần:"
        columns={exportColumns}
        rows={filtered}
        filenameBase={`ho_so_${campaignId || "dot"}`}
        exporter={async ({ columns, rows }) => {
          const cols = columns
            .map((c) => c.serverKey)
            .filter(Boolean) as { type: "profile" | "question"; key: string }[];
          const profileKeys = cols.filter((c) => c.type === "profile").map((c) => c.key);
          const questionFieldIds = cols.filter((c) => c.type === "question").map((c) => c.key);
          const applicationIds = rows.map((r) => r.id);
          try {
            await exportApplications(campaignId, {
              applicationIds,
              columns: profileKeys,
              questionFieldIds,
            });
            showToast(`Đã xuất ${applicationIds.length} hồ sơ (xlsx).`);
          } catch {
            showToast("Xuất file thất bại — thử lại sau.");
          }
        }}
      />

      <SendEmailModal
        open={emailOpen}
        onClose={() => {
          setEmailOpen(false);
          setEmailApps([]);
        }}
        recipients={emailApps.map((a) => applicationToEmailRecipient(a))}
        module="recruitment-screening"
        category="recruitment"
        preferredTemplateId={emailKind === "fail" ? "tpl-cv-fail" : "tpl-cv-pass"}
        autoPreview
        title={
          emailKind === "fail"
            ? `Gửi email Trượt vòng đơn (${emailApps.length})`
            : `Gửi email Pass vòng đơn (${emailApps.length})`
        }
        onSent={(sent) => {
          showToast(`Đã gửi ${sent} email kết quả vòng đơn.`);
          setSelectedIds(new Set());
        }}
      />
    </>
  );
}

export default RecruitmentApplicationsPage;
