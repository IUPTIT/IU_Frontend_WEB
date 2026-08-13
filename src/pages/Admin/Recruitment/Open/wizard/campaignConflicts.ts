import type { RecruitmentCampaign } from "../../../../../types/recruitment";
import type { CampaignDraft } from "./types";

function toOpenMs(v: string) {
  if (!v) return NaN;
  return new Date(v.includes("T") ? v : `${v}T00:00:00`).getTime();
}

function toCloseMs(v: string) {
  if (!v) return NaN;
  return new Date(v.includes("T") ? v : `${v}T23:59:59`).getTime();
}

function isOpenCampaign(c: RecruitmentCampaign) {
  return c.isActive || c.status === "published";
}

export type CampaignConflict = {
  kind: "name" | "overlap";
  message: string;
};

/** Kiểm tra trùng tên / trùng thời gian+ban với đợt đang mở */
export function findCampaignConflicts(
  draft: CampaignDraft,
  campaigns: RecruitmentCampaign[],
  excludeId?: string | null,
): CampaignConflict[] {
  const conflicts: CampaignConflict[] = [];
  const name = draft.name.trim();

  if (name) {
    const dup = campaigns.find(
      (c) =>
        c.id !== excludeId &&
        c.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (dup) {
      conflicts.push({
        kind: "name",
        message: `Tên đợt đã tồn tại: "${dup.name}". Đổi tên khác trước khi tiếp tục.`,
      });
    }
  }

  const open = toOpenMs(draft.openAt);
  const close = toCloseMs(draft.closeAt);
  // Ban đã đặt chỉ tiêu; nếu chưa đặt thì vẫn check mọi ban trên form để báo sớm
  const deptNames = draft.quotas
    .filter((q) => q.quota > 0)
    .map((q) => q.departmentName);
  const deptsToCheck =
    deptNames.length > 0
      ? deptNames
      : draft.quotas.map((q) => q.departmentName).filter(Boolean);

  if (Number.isFinite(open) && Number.isFinite(close) && open < close) {
    const overlap = campaigns.find((c) => {
      if (c.id === excludeId) return false;
      if (!isOpenCampaign(c)) return false;
      const cOpen = new Date(c.openAt).getTime();
      const cClose = new Date(c.closeAt).getTime();
      if (!(open < cClose && close > cOpen)) return false;
      // Trùng time + cùng ít nhất 1 ban (hoặc đợt mở chưa có ban thì vẫn cảnh báo trùng time)
      const openDepts = c.quotas
        .filter((q) => q.quota > 0)
        .map((q) => q.departmentName);
      if (openDepts.length === 0 || deptsToCheck.length === 0) return true;
      return openDepts.some((d) => deptsToCheck.includes(d));
    });
    if (overlap) {
      conflicts.push({
        kind: "overlap",
        message: `Trùng thời gian với đợt đang mở "${overlap.name}" (${formatRange(overlap.openAt, overlap.closeAt)}). Đổi thời gian/ban hoặc đóng đợt đó trước.`,
      });
    }
  }

  return conflicts;
}

function formatRange(openAt: string, closeAt: string) {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return `${fmt(openAt)} → ${fmt(closeAt)}`;
}

/** Gộp mọi lỗi conflict thành 1 thông báo (xuống dòng) */
export function formatConflictErrors(conflicts: CampaignConflict[]): string | null {
  if (conflicts.length === 0) return null;
  return conflicts.map((c) => c.message).join("\n");
}
