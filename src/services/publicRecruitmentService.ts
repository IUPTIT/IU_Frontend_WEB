// Luồng tuyển thành viên CÔNG KHAI (Guest) — gọi API thật /api/v1/recruitment.
// Phần quản trị BCN vẫn dùng recruitmentService (mock) — sẽ nối API sau.
import { api } from "../api/client";

export type PublicQuestion = {
  _id: string;
  label: string;
  type: "short_text" | "long_text" | "single_choice" | "multi_choice" | "file" | "scale";
  options?: string[];
  required: boolean;
  order: number;
};

export type PublicCampaign = {
  id: string;
  name: string;
  description: string;
  openAt: string;
  closeAt: string;
  status: "draft" | "open" | "closed" | "completed";
  quotas: { team: string; count: number }[];
  customQuestions: PublicQuestion[];
};

export type PublicApplicationStatus =
  | "pending"
  | "passed_screening"
  | "failed_screening"
  | "passed_interview"
  | "failed_interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type PublicApplication = {
  id: string;
  code: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
  status: PublicApplicationStatus;
  note?: string;
  createdAt: string;
  campaign: { _id: string; name: string; closeAt: string; status: string };
};

export type SubmitApplicationPayload = {
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth: string;
  avatarUrl?: string;
  cvUrl?: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
};

export function getActiveCampaign(): Promise<PublicCampaign | null> {
  return api.get<{ campaign: PublicCampaign | null }>("/recruitment/active").then((d) => d.campaign);
}

export function submitApplication(payload: SubmitApplicationPayload): Promise<PublicApplication> {
  return api
    .post<{ application: PublicApplication }>("/recruitment/applications", payload)
    .then((d) => d.application);
}

export function lookupApplication(query: string): Promise<PublicApplication> {
  return api
    .get<{ application: PublicApplication }>(
      `/recruitment/applications/lookup?query=${encodeURIComponent(query.trim())}`,
    )
    .then((d) => d.application);
}

export function withdrawApplication(code: string, email: string): Promise<PublicApplication> {
  return api
    .post<{ application: PublicApplication }>(`/recruitment/applications/${code}/withdraw`, { email })
    .then((d) => d.application);
}
