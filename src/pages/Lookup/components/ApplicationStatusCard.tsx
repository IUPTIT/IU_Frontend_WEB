import { useState } from "react";
import { STATUS_LABEL } from "../types";
import type { PublicApplication, PublicApplicationStatus } from "../../../services/publicRecruitmentService";

type Props = {
  application: PublicApplication;
  withdrawing: boolean;
  onWithdraw: () => void;
};

const POSITIVE: PublicApplicationStatus[] = ["passed_screening", "passed_interview", "accepted"];
const NEGATIVE: PublicApplicationStatus[] = [
  "failed_screening",
  "failed_interview",
  "rejected",
  "withdrawn",
];

function statusColor(status: PublicApplicationStatus) {
  if (POSITIVE.includes(status)) return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300";
  if (NEGATIVE.includes(status)) return "border-red-400/50 bg-red-500/15 text-red-300";
  return "border-amber-400/50 bg-amber-500/15 text-amber-300";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-white/10 py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-[hsl(var(--landing-foreground)/0.55)]">{label}</span>
      <span className="text-right font-medium text-[hsl(var(--landing-foreground))]">{value}</span>
    </div>
  );
}

function ApplicationStatusCard({ application, withdrawing, onWithdraw }: Props) {
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  const beforeDeadline = Date.now() < new Date(application.campaign.closeAt).getTime();
  // Chỉ rút được khi còn "Chờ xét duyệt" và còn hạn nộp (mục 1.5 nghiệp vụ)
  const editable = application.status === "pending" && beforeDeadline;

  return (
    <div className="liquid-glass landing-card-solid rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
            {application.fullName}
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--landing-foreground)/0.6)]">{application.campaign.name}</p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-medium ${statusColor(application.status)}`}>
          {STATUS_LABEL[application.status]}
        </span>
      </div>

      <div className="mt-6">
        <Row label="Mã hồ sơ" value={application.code} />
        <Row label="Email" value={application.email} />
        <Row label="Nộp lúc" value={new Date(application.createdAt).toLocaleString("vi-VN")} />
        <Row label="Ban nguyện vọng" value={application.wishes.map((w, i) => `NV${i + 1}: ${w}`).join(" · ")} />
      </div>

      {application.note && (
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[hsl(var(--landing-foreground)/0.8)]">
          {application.note}
        </p>
      )}

      {editable ? (
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          {confirmingWithdraw ? (
            <div className="flex flex-1 gap-2">
              <button
                onClick={onWithdraw}
                disabled={withdrawing}
                className="flex-1 rounded-full border border-red-400/60 bg-red-500/20 py-3 font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                {withdrawing ? "Đang rút đơn..." : "Xác nhận rút đơn"}
              </button>
              <button
                onClick={() => setConfirmingWithdraw(false)}
                disabled={withdrawing}
                className="landing-btn-secondary liquid-glass rounded-full px-5"
              >
                Huỷ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingWithdraw(true)}
              className="flex-1 rounded-full border border-red-400/40 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              Rút đơn
            </button>
          )}
        </div>
      ) : (
        application.status === "pending" && (
          <p className="mt-5 text-sm text-[hsl(var(--landing-foreground)/0.5)]">
            Đã hết hạn đóng đơn — không thể sửa hoặc rút hồ sơ nữa.
          </p>
        )
      )}
    </div>
  );
}

export default ApplicationStatusCard;
