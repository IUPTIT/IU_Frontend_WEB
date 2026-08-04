import type { CampaignStatusLabel, RecruitmentCampaign } from "../../../../../types/recruitment";
import { getCampaignStatusLabel } from "./campaignStatus";

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
