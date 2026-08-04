import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import Pagination from "../../../../components/ui/Pagination";
import { usePortalUi } from "../../../../context/PortalUiContext";
import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  setCampaignActive,
} from "../../../../services/recruitmentService";
import type { RecruitmentCampaign } from "../../../../types/recruitment";
import CampaignTable from "./components/CampaignTable";
import CampaignWizard from "./components/CampaignWizard";
import type { CampaignDraft } from "./wizard/types";

const PAGE_SIZE = 5;

function RecruitmentOpenPage() {
  const { search } = usePortalUi();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "wizard">("list");

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => c.name.toLowerCase().includes(q));
  }, [campaigns, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await setCampaignActive(id, active);
      await load();
      showToast(active ? "Đã kích hoạt đợt tuyển." : "Đã tắt kích hoạt đợt tuyển.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleDelete = async (campaign: RecruitmentCampaign) => {
    if (campaign.isActive) {
      showToast("Không thể xóa đợt đang kích hoạt.");
      return;
    }
    const ok = window.confirm(`Xóa đợt "${campaign.name}"?`);
    if (!ok) return;
    try {
      await deleteCampaign(campaign.id);
      await load();
      showToast("Đã xóa đợt tuyển.");
    } catch (err) {
      // VD: backend chặn xoá đợt đã có hồ sơ nộp
      showToast(err instanceof Error ? err.message : "Xóa đợt tuyển thất bại.");
    }
  };

  const handleEdit = () => {
    setMode("wizard");
    showToast("Mở wizard chỉnh sửa — dùng form tạo mới.");
  };

  const handleWizardDone = async (draft: CampaignDraft, saveMode: "draft" | "publish") => {
    // datetime-local ("YYYY-MM-DDTHH:mm", giờ địa phương) → ISO; hỗ trợ cả giá trị chỉ có ngày (nháp cũ)
    const toOpenIso = (v: string) =>
      v ? new Date(v.includes("T") ? v : `${v}T00:00:00`).toISOString() : null;
    const toCloseIso = (v: string) =>
      v ? new Date(v.includes("T") ? v : `${v}T23:59:59`).toISOString() : null;

    try {
      await createCampaign({
        name: draft.name.trim() || "Đợt tuyển chưa đặt tên",
        description: draft.description,
        openAt: toOpenIso(draft.openAt),
        closeAt: toCloseIso(draft.closeAt),
        quotas: draft.quotas.map((q) => ({
          departmentId: q.departmentId,
          departmentName: q.departmentName,
          quota: q.quota,
        })),
        customQuestions: draft.questions.map((q, index) => ({
          label: q.content,
          type: q.type,
          options: q.options.map((o) => o.label),
          required: q.required,
          order: index,
        })),
        status: saveMode === "publish" ? "published" : "draft",
        isActive: saveMode === "publish" && draft.activateOnPublish,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Tạo đợt tuyển thất bại.");
      return; // giữ nguyên wizard để sửa lại
    }

    await load();
    setMode("list");
    showToast(
      saveMode === "publish"
        ? "Đã xuất bản đợt tuyển thành công."
        : "Đã lưu nháp đợt tuyển.",
    );
  };

  if (mode === "wizard") {
    return (
      <>
        {toast && (
          <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
            {toast}
          </p>
        )}
        <CampaignWizard
          onCancel={() => setMode("list")}
          onPublished={handleWizardDone}
        />
      </>
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Danh sách đợt tuyển dụng
          </h1>
          <p className="mt-2 text-muted max-w-xl">
            Quản lý và theo dõi các chiến dịch tuyển thành viên mới.
          </p>
        </div>
        <Button
          variant="soft"
          size="md"
          onClick={() => setMode("wizard")}
          leftIcon={<Icon icon={Plus} size={18} />}
        >
          THÊM MỚI
        </Button>
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
          <CampaignTable
            campaigns={paged}
            page={safePage}
            pageSize={PAGE_SIZE}
            onToggleActive={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default RecruitmentOpenPage;
