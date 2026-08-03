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
    await setCampaignActive(id, active);
    await load();
    showToast(active ? "Đã kích hoạt đợt tuyển." : "Đã tắt kích hoạt đợt tuyển.");
  };

  const handleDelete = async (campaign: RecruitmentCampaign) => {
    if (campaign.isActive) {
      showToast("Không thể xóa đợt đang kích hoạt.");
      return;
    }
    const ok = window.confirm(`Xóa đợt "${campaign.name}"?`);
    if (!ok) return;
    await deleteCampaign(campaign.id);
    await load();
    showToast("Đã xóa đợt tuyển.");
  };

  const handleEdit = () => {
    setMode("wizard");
    showToast("Mở wizard chỉnh sửa — dùng form tạo mới.");
  };

  const handleWizardDone = async (draft: CampaignDraft, saveMode: "draft" | "publish") => {
    const toIso = (d: string) => (d ? new Date(`${d}T00:00:00.000Z`).toISOString() : null);

    await createCampaign({
      name: draft.name.trim() || "Đợt tuyển chưa đặt tên",
      description: draft.description,
      openAt: toIso(draft.openAt),
      closeAt: toIso(draft.closeAt),
      quotas: draft.quotas.map((q) => ({
        departmentId: q.departmentId,
        departmentName: q.departmentName,
        quota: q.quota,
      })),
      status: saveMode === "publish" ? "published" : "draft",
      isActive: saveMode === "publish" && draft.activateOnPublish,
    });

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
      <CampaignWizard
        onCancel={() => setMode("list")}
        onPublished={handleWizardDone}
      />
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
