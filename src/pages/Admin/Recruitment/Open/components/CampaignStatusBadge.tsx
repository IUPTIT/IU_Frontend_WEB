import type { CampaignStatusLabel, RecruitmentCampaign } from "../../../../../types/recruitment";

export function getCampaignStatusLabel(campaign: RecruitmentCampaign): CampaignStatusLabel {
  if (campaign.status === "draft") return "Nháp";
  if (campaign.status === "closed" || !campaign.isActive) return "Đã kết thúc";
  return "Đang diễn ra";
}

const statusClass: Record<CampaignStatusLabel, string> = {
  "Đang diễn ra": "bg-accent/15 text-accent",
  "Đã kết thúc": "bg-muted/15 text-muted",
  Nháp: "bg-accent-light/25 text-accent",
};

function CampaignStatusBadge({ campaign }: { campaign: RecruitmentCampaign }) {
  const label = getCampaignStatusLabel(campaign);
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass[label]}`}>
      {label}
    </span>
  );
}

export default CampaignStatusBadge;
