import { useState } from "react";
import { Link } from "react-router-dom";
import { STATUS_LABEL } from "../types";
import type { ApplicationRecord, ApplicationStatus } from "../types";

type Props = {
  application: ApplicationRecord;
  closeAt: string; // hạn đóng đơn của đợt tuyển
  onWithdraw: () => void;
};

const POSITIVE: ApplicationStatus[] = ["dat_vong_don", "dat_phong_van", "trung_tuyen"];
const NEGATIVE: ApplicationStatus[] = [
  "khong_dat_vong_don",
  "khong_dat_phong_van",
  "khong_trung_tuyen",
  "da_rut_don",
];

function statusColor(status: ApplicationStatus) {
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

function ApplicationStatusCard({ application, closeAt, onWithdraw }: Props) {
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  const beforeDeadline = Date.now() < new Date(closeAt).getTime();
  // Chỉ sửa/rút được khi còn "Chờ xét duyệt" và còn hạn nộp (mục 1.5 nghiệp vụ)
  const editable = application.status === "cho_xet_duyet" && beforeDeadline;

  return (
    <div className="liquid-glass landing-card-solid rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="landing-headline text-xl font-semibold text-[hsl(var(--landing-foreground))]">
            {application.fullName}
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--landing-foreground)/0.6)]">{application.campaignName}</p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-medium ${statusColor(application.status)}`}>
          {STATUS_LABEL[application.status]}
        </span>
      </div>

      <div className="mt-6">
        <Row label="Mã hồ sơ" value={application.code} />
        <Row label="Email" value={application.email} />
        <Row label="Nộp lúc" value={new Date(application.submittedAt).toLocaleString("vi-VN")} />
        <Row label="Ban nguyện vọng" value={application.wishes.map((w, i) => `NV${i + 1}: ${w}`).join(" · ")} />
      </div>

      {application.note && (
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[hsl(var(--landing-foreground)/0.8)]">
          {application.note}
        </p>
      )}

      {editable ? (
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <Link
            to="/tuyen-thanh-vien"
            className="landing-btn-secondary liquid-glass flex-1 rounded-full py-3 text-center"
          >
            Sửa hồ sơ
          </Link>
          {confirmingWithdraw ? (
            <div className="flex flex-1 gap-2">
              <button
                onClick={onWithdraw}
                className="flex-1 rounded-full border border-red-400/60 bg-red-500/20 py-3 font-medium text-red-300 transition-colors hover:bg-red-500/30"
              >
                Xác nhận rút đơn
              </button>
              <button
                onClick={() => setConfirmingWithdraw(false)}
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
        application.status === "cho_xet_duyet" && (
          <p className="mt-5 text-sm text-[hsl(var(--landing-foreground)/0.5)]">
            Đã hết hạn đóng đơn — không thể sửa hoặc rút hồ sơ nữa.
          </p>
        )
      )}
    </div>
  );
}

export default ApplicationStatusCard;
