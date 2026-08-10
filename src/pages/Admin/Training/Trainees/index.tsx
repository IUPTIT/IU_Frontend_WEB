import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import { usePortalUi } from "../../../../context/usePortalUi";
import { useToast } from "../../../../context/useToast";
import { getTrainees } from "../../../../services/trainingService";
import { getCampaigns } from "../../../../services/recruitmentService";
import type { RecruitmentCampaign } from "../../../../types/recruitment";
import type { Trainee } from "../../../../types/training";

const PAGE_SIZE = 10;

/** BCN UC 32: danh sách tân binh cần training — bảng soft-UI như Applications */
export default function AdminTrainingTraineesPage() {
  const { search } = usePortalUi();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    void getCampaigns().then((c) => {
      const list = c.filter((x) => x.status !== "draft");
      setCampaigns(list);
      setCampaignId(list.find((x) => x.isActive)?.id ?? list[0]?.id ?? "");
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTrainees(await getTrainees(undefined, campaignId || undefined));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Không tải được tân binh: ${err.message}`
          : "Không tải được danh sách tân binh.",
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainees.filter((t) => {
      if (t.status === "removed") return false;
      if (statusFilter === "pending" && t.status !== "pending") return false;
      if (statusFilter === "in_progress" && t.status !== "in_progress")
        return false;
      if (statusFilter === "completed" && t.status !== "completed") return false;
      if (statusFilter === "need_group" && t.groupId) return false;
      if (!q) return true;
      return (
        t.fullName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.departmentName.toLowerCase().includes(q)
      );
    });
  }, [trainees, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <section className="space-y-6">
      <nav className="text-sm text-muted">
        Tuyển dụng › Training tân binh ›{" "}
        <span className="text-foreground/80">Danh sách tân binh</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Danh sách tân binh
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Thành viên vừa trúng tuyển, cần hoàn thành training.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={campaignId}
            options={campaigns.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => {
              setCampaignId(v);
              setPage(1);
            }}
            placeholder="Đợt tuyển"
            className="min-w-[200px]"
          />
          <Select
            value={statusFilter}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "need_group", label: "Chưa chia nhóm" },
              { value: "pending", label: "Chờ training" },
              { value: "in_progress", label: "Đang training" },
              { value: "completed", label: "Hoàn thành" },
            ]}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            className="min-w-[180px]"
          />
        </div>
      </header>

      <div className="neu-card !p-0 overflow-hidden">
        {loading ? (
          <div className="h-48 animate-pulse" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Thành viên</th>
                  <th className="px-3 py-3 font-semibold">Ban</th>
                  <th className="px-3 py-3 font-semibold">Nhóm / Mentor</th>
                  <th className="px-3 py-3 font-semibold">Trạng thái</th>
                  <th className="px-3 py-3 font-semibold">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-muted"
                    >
                      Không có tân binh phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  slice.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.fullName} size="sm" />
                          <div>
                            <p className="font-medium">{t.fullName}</p>
                            <p className="text-xs text-muted">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">{t.departmentName}</td>
                      <td className="px-3 py-3">
                        {t.groupId ? (
                          <span>
                            {t.mentorName ?? "Có nhóm"}
                            <span className="block text-xs text-muted">
                              Đã chia đội
                            </span>
                          </span>
                        ) : (
                          <Badge tone="warning">Chưa chia nhóm</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          tone={
                            t.status === "completed"
                              ? "success"
                              : t.status === "in_progress"
                                ? "accent"
                                : "muted"
                          }
                        >
                          {t.status === "completed"
                            ? "Hoàn thành"
                            : t.status === "in_progress"
                              ? "Đang training"
                              : "Chờ"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {t.evalStatus === "certified"
                          ? "Đã cấp CN"
                          : t.evalStatus === "qualified"
                            ? "Đạt"
                            : t.evalStatus === "failed"
                              ? "Chưa đạt"
                              : "Đang học"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-4">
          <p className="text-sm text-muted">
            {filtered.length} kết quả
          </p>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
