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
      phone: app.phone || "—",
      score: app.interviewScore?.toFixed(1) ?? app.totalScore?.toFixed(1) ?? "—",
      result,
      interview_date: extras?.interview_date ?? "—",
      interview_time:
        extras?.interview_time ??
        "Đăng nhập portal để chọn ca phỏng vấn phù hợp",
      location:
        extras?.location ??
        "Sẽ hiển thị khi bạn đăng ký lịch (hoặc Ban Tuyển thông báo)",
      meeting_link: extras?.meeting_link ?? "",
      booking_deadline: extras?.booking_deadline ?? "theo thông báo đợt tuyển",
      ...extras,
      // Luôn ghi đè sau extras — tài khoản = email ứng viên, MK = DOB
      email: app.email,
      temp_password:
        passwordFromDob(app.dateOfBirth) || extras?.temp_password || "",
      login_url:
        extras?.login_url ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/login`,
    },
  };
}

/** MK mặc định = ngày sinh DDMMYYYY */
export function passwordFromDob(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateOfBirth).slice(0, 10));
  if (m) return `${m[3]}${m[2]}${m[1]}`;
  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}${mm}${d.getUTCFullYear()}`;
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
      certificate_code: t.certificateCode || (t.evalStatus === "certified" ? `IU-CERT-${t.id.slice(-4).toUpperCase()}` : "—"),
    },
  };
}
