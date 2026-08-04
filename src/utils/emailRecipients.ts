import type { Application } from "../types/recruitment";
import type { EmailRecipient } from "../types/email";
import type { Trainee } from "../types/training";

/** Map ứng viên → recipient + placeholder data cho SendEmailModal */
export function applicationToEmailRecipient(
  app: Application,
  extras?: Partial<Record<string, string>>,
): EmailRecipient {
  const result =
    app.finalResult === "pass" || app.status === "accepted"
      ? "Đạt"
      : app.finalResult === "fail" || app.status === "rejected"
        ? "Không đạt"
        : app.interviewResult === "pass"
          ? "Pass PV"
          : app.interviewResult === "fail"
            ? "Fail PV"
            : app.screeningResult === "pass"
              ? "Pass hồ sơ"
              : app.screeningResult === "fail"
                ? "Loại hồ sơ"
                : "Đang xử lý";

  return {
    id: app.id,
    name: app.fullName,
    email: app.email,
    data: {
      candidate_name: app.fullName,
      department: app.preferredDepartmentName,
      position: "Member",
      club_name: "IU CLUB",
      contact_name: "Ban Chủ nhiệm",
      phone: "0901 234 567",
      email: "bcn@iuclub.edu.vn",
      score: app.interviewScore?.toFixed(1) ?? app.totalScore?.toFixed(1) ?? "—",
      result,
      interview_date: extras?.interview_date ?? "—",
      interview_time: extras?.interview_time ?? "—",
      location: extras?.location ?? "IU Campus",
      meeting_link: extras?.meeting_link ?? "https://meet.google.com/iu-club",
      ...extras,
    },
  };
}

export function traineeToEmailRecipient(t: Trainee): EmailRecipient {
  return {
    id: t.id,
    name: t.fullName,
    email: t.email,
    data: {
      candidate_name: t.fullName,
      department: t.departmentName,
      club_name: "IU CLUB",
      contact_name: "Ban Đào tạo",
      phone: "0901 234 567",
      email: "training@iuclub.edu.vn",
      score: t.avgScore != null ? t.avgScore.toFixed(1) : "—",
      result:
        t.evalStatus === "certified"
          ? "Đã cấp chứng nhận"
          : t.evalStatus === "qualified"
            ? "Đủ điều kiện"
            : t.evalStatus === "failed"
              ? "Chưa đạt"
              : "Đang học",
      program_name: t.cohortLabel ?? "Onboarding",
      certificate_code: t.evalStatus === "certified" ? `IU-CERT-${t.id.slice(-4).toUpperCase()}` : "—",
    },
  };
}
