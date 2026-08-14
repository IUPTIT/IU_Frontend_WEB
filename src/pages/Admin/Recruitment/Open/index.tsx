import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import Pagination from "../../../../components/ui/Pagination";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import {
  createCampaign,
  deleteCampaign,
  getApplications,
  getCampaigns,
  getFormQuestions,
  setCampaignActive,
  updateCampaign,
  completeCampaign,
} from "../../../../services/recruitmentService";
import type { RecruitmentCampaign } from "../../../../types/recruitment";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import CampaignTable from "./components/CampaignTable";
import CampaignWizard from "./components/CampaignWizard";
import { getDepartments } from "../../../../services/departmentsService";
import type { CampaignDraft, QuestionDraft } from "./wizard/types";
import { createEmptyDraft, quotasFromDepartments, uid } from "./wizard/types";

const PAGE_SIZE = 5;

function RecruitmentOpenPage() {
  const { search } = usePortalUi();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "wizard">("list");
  // Đợt đang sửa (null = tạo mới) + draft prefill cho wizard
  const [editing, setEditing] = useState<RecruitmentCampaign | null>(null);
  const [editDraft, setEditDraft] = useState<CampaignDraft | null>(null);
  const [editLocks, setEditLocks] = useState<{ nameAndOpen?: boolean; questions?: boolean }>({});

  const showToast = (msg: string) => {
    toast.info(msg);
  };

  // loading khởi tạo true — refresh sau thao tác giữ nguyên bảng cũ, không nháy skeleton
  const load = useCallback(async () => {
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

  // Đổi từ khoá tìm kiếm → về trang 1 (adjust state during render)
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

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

  const [deleteTarget, setDeleteTarget] = useState<RecruitmentCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (campaign: RecruitmentCampaign) => {
    if (campaign.isActive) {
      showToast("Không thể xóa đợt đang kích hoạt.");
      return;
    }
    setDeleteTarget(campaign);
  };

  const handleComplete = async (campaign: RecruitmentCampaign) => {
    try {
      await completeCampaign(campaign.id);
      await load();
      showToast(`Đã đánh dấu hoàn tất: ${campaign.name}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể hoàn tất đợt tuyển.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCampaign(deleteTarget.id);
      await load();
      showToast("Đã xóa đợt tuyển.");
      setDeleteTarget(null);
    } catch (err) {
      // VD: backend chặn xoá đợt đã có hồ sơ nộp
      showToast(err instanceof Error ? err.message : "Xóa đợt tuyển thất bại.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ISO → giá trị datetime-local theo giờ địa phương ("YYYY-MM-DDTHH:mm")
  const toLocalInput = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleCreateNew = async () => {
    try {
      const departments = await getDepartments("active");
      setEditing(null);
      setEditDraft(createEmptyDraft(quotasFromDepartments(departments)));
      setEditLocks({});
      setMode("wizard");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tải được danh sách Ban.");
    }
  };

  const handleEdit = async (campaign: RecruitmentCampaign) => {
    try {
      const [questions, applications, departments] = await Promise.all([
        getFormQuestions(campaign.id),
        getApplications(campaign.id),
        getDepartments("active"),
      ]);
      const published = campaign.status !== "draft";
      setEditLocks({
        nameAndOpen: published,
        questions: applications.length > 0,
      });
      const draftQuestions: QuestionDraft[] = questions.map((q) => ({
        id: q.id,
        content: q.content,
        // QuestionDraft chưa hỗ trợ multi_choice/rating — quy về loại gần nhất
        type:
          q.type === "multi_choice"
            ? "single_choice"
            : q.type === "rating"
              ? "short_text"
              : q.type,
        required: q.required,
        options: q.options?.map((o) => ({ id: o.id, label: o.label })) ?? [],
      }));

      const quotas = quotasFromDepartments(departments, campaign.quotas);
      // Ban trong đợt nhưng không còn trong danh mục active
      for (const q of campaign.quotas) {
        if (!quotas.some((x) => x.departmentName === q.departmentName)) {
          quotas.push({
            departmentId: uid("dept"),
            departmentName: q.departmentName,
            icon: "code",
            tone: "blue",
            quota: q.quota,
          });
        }
      }

      setEditing(campaign);
      setEditDraft({
        name: campaign.name,
        dateRangeLabel: "",
        openAt: toLocalInput(campaign.openAt),
        closeAt: toLocalInput(campaign.closeAt),
        description: campaign.description ?? "",
        quotas,
        questions: draftQuestions,
        activateOnPublish: campaign.isActive,
        notifyOnPublish: false,
      });
      setMode("wizard");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không tải được đợt tuyển để sửa.");
    }
  };

  const handleWizardDone = async (draft: CampaignDraft, saveMode: "draft" | "publish") => {
    // datetime-local ("YYYY-MM-DDTHH:mm", giờ địa phương) → ISO; hỗ trợ cả giá trị chỉ có ngày (nháp cũ)
    const toOpenIso = (v: string) =>
      v ? new Date(v.includes("T") ? v : `${v}T00:00:00`).toISOString() : null;
    const toCloseIso = (v: string) =>
      v ? new Date(v.includes("T") ? v : `${v}T23:59:59`).toISOString() : null;

    const quotas = draft.quotas.map((q) => ({
      departmentId: q.departmentId,
      departmentName: q.departmentName,
      quota: q.quota,
    }));
    const customQuestions = draft.questions.map((q, index) => ({
      label: q.content,
      type: q.type,
      options: q.options.map((o) => o.label),
      required: q.required,
      order: index,
    }));

    // Chặn sớm trước khi gọi API: trùng tên / trùng thời gian với đợt đang mở cùng ban
    const name = draft.name.trim();
    if (name) {
      const dupName = campaigns.find(
        (c) =>
          c.id !== editing?.id &&
          c.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (dupName) {
        showToast(`Tên đợt đăng ký đã tồn tại: "${dupName.name}".`);
        return;
      }
    }

    if (saveMode === "publish") {
      const openIso = toOpenIso(draft.openAt);
      const closeIso = toCloseIso(draft.closeAt);
      const deptNames = quotas.filter((q) => q.quota > 0).map((q) => q.departmentName);
      if (openIso && closeIso && deptNames.length > 0) {
        const open = new Date(openIso).getTime();
        const close = new Date(closeIso).getTime();
        const overlap = campaigns.find((c) => {
          if (c.id === editing?.id) return false;
          if (!c.isActive || !c.openAt || !c.closeAt) return false;
          const cOpen = new Date(c.openAt).getTime();
          const cClose = new Date(c.closeAt).getTime();
          if (!(open < cClose && close > cOpen)) return false;
          return c.quotas.some(
            (q) => q.quota > 0 && deptNames.includes(q.departmentName),
          );
        });
        if (overlap) {
          showToast(
            `Không kích hoạt được: đã có đợt đang mở trùng thời gian/ban ("${overlap.name}"). Đóng đợt đó hoặc đổi thời gian/ban trước.`,
          );
          return;
        }
      }
    }

    try {
      if (editing) {
        // Đợt đã publish: backend chỉ cho sửa closeAt/chỉ tiêu/mô tả (+ câu hỏi khi chưa có hồ sơ)
        const published = editing.status !== "draft";
        await updateCampaign(editing.id, {
          ...(published ? {} : { name: draft.name.trim(), openAt: toOpenIso(draft.openAt) }),
          description: draft.description,
          closeAt: toCloseIso(draft.closeAt),
          quotas,
          // Đã có hồ sơ nộp → không gửi câu hỏi (UI cũng đã khoá)
          ...(editLocks.questions ? {} : { customQuestions }),
        });
        if (!published && saveMode === "publish") {
          await setCampaignActive(editing.id, true, {
            notify: draft.notifyOnPublish,
          });
        }
      } else {
        await createCampaign({
          name: draft.name.trim() || "Đợt tuyển chưa đặt tên",
          description: draft.description,
          openAt: toOpenIso(draft.openAt),
          closeAt: toCloseIso(draft.closeAt),
          quotas,
          customQuestions,
          status: saveMode === "publish" ? "published" : "draft",
          isActive: saveMode === "publish" && draft.activateOnPublish,
          notifyOnPublish: draft.notifyOnPublish,
        });
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lưu đợt tuyển thất bại.");
      return; // giữ wizard để sửa — đợt chưa được tạo (đã rollback nếu publish fail)
    }

    await load();
    setMode("list");
    setEditing(null);
    setEditDraft(null);
    showToast(
      editing
        ? "Đã cập nhật đợt tuyển."
        : saveMode === "publish"
          ? "Đã xuất bản đợt tuyển thành công."
          : "Đã lưu nháp đợt tuyển.",
    );
  };

  if (mode === "wizard") {
    return (
      <>
        <CampaignWizard
          key={editing?.id ?? "new"}
          initialDraft={editDraft ?? undefined}
          locks={editing ? editLocks : undefined}
          existingCampaigns={campaigns}
          excludeCampaignId={editing?.id ?? null}
          onCancel={() => {
            setMode("list");
            setEditing(null);
            setEditDraft(null);
          }}
          onPublished={handleWizardDone}
        />
      </>
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Danh sách đợt tuyển dụng
            </h1>
          </div>
        </div>
        <Button
          variant="soft"
          size="md"
          onClick={() => void handleCreateNew()}
          leftIcon={<Icon icon={Plus} size={18} />}
        >
          THÊM MỚI
        </Button>
      </section>

      {loading ? (
        <div className="ui-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />
      ) : (
        <>
          <CampaignTable
            campaigns={paged}
            page={safePage}
            pageSize={PAGE_SIZE}
            onToggleActive={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa đợt tuyển"
        message={
          deleteTarget ? (
            <>
              Xóa đợt <b>"{deleteTarget.name}"</b>? Hành động này không thể hoàn tác.
            </>
          ) : undefined
        }
        confirmLabel="Xóa đợt tuyển"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default RecruitmentOpenPage;
