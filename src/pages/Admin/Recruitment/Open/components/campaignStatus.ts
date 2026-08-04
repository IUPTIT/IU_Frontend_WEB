import type { CampaignStatusLabel, RecruitmentCampaign } from "../../../../../types/recruitment";

export function getCampaignStatusLabel(campaign: RecruitmentCampaign): CampaignStatusLabel {
  if (campaign.status === "draft") return "Nháp";
  if (campaign.status === "closed" || !campaign.isActive) return "Đã kết thúc";
  return "Đang diễn ra";
}
