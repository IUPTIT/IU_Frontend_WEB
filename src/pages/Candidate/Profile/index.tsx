import { useEffect, useState } from "react";
import { getMe, type CandidateApplication } from "../../../services/candidateService";
import { formatDate } from "../../../utils/formatDate";

const STATUS_LABEL: Record<string, string> = {
  pending_review: "Chờ xét duyệt vòng đơn",
  passed_cv: "Đạt vòng đơn — chờ phỏng vấn",
  failed_cv: "Không đạt vòng đơn",
  passed_interview: "Đạt phỏng vấn — chờ kết quả cuối",
  failed_interview: "Không đạt phỏng vấn",
  admitted: "Trúng tuyển chính thức",
  rejected: "Không trúng tuyển",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-black/5 py-3 text-sm last:border-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function CandidateProfilePage() {
  const [application, setApplication] = useState<CandidateApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void getMe()
      .then((me) => alive && setApplication(me.application))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <div className="ui-card h-64 animate-pulse" aria-busy="true" aria-label="Đang tải" />;
  }
  if (!application) {
    return (
      <section className="ui-card !p-8 text-center">
        <p className="text-muted">Không tìm thấy hồ sơ ứng tuyển.</p>
      </section>
    );
  }

  const wishes = [...(application.departmentPreferences ?? [])]
    .sort((a, b) => a.priority - b.priority)
    .map((p, i) => `NV${i + 1}: ${p.department}`)
    .join(" · ");

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hồ sơ của tôi
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted max-w-xl">
          Thông tin hồ sơ ứng tuyển và trạng thái hiện tại.
        </p>
      </div>

      <section className="ui-card !p-6">
        <Row label="Mã hồ sơ" value={application.applicationCode ?? "—"} />
        <Row label="Họ và tên" value={application.fullName} />
        <Row label="Email" value={application.email} />
        <Row
          label="Đợt tuyển"
          value={typeof application.campaignId === "object" ? application.campaignId.name : "—"}
        />
        <Row label="Ban nguyện vọng" value={wishes || "—"} />
        <Row
          label="Ngày nộp"
          value={application.submittedAt ? formatDate(application.submittedAt) : "—"}
        />
        <Row
          label="Trạng thái"
          value={STATUS_LABEL[application.status] ?? application.status}
        />
      </section>
    </>
  );
}

export default CandidateProfilePage;
