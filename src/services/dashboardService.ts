// Service cho dashboard Admin — hiện trả mock data, khi có backend chỉ sửa file này.
import { api } from "../api/client";
import type { StatCard, WeeklySubmission } from "../types/admin";
import { statCards, weeklySubmissions } from "../pages/Admin/mockData";

const USE_MOCK = true; // đổi false khi backend sẵn sàng

export async function getStatCards(): Promise<StatCard[]> {
  if (USE_MOCK) return statCards;
  return api.get<StatCard[]>("/dashboard/stats");
}

export async function getWeeklySubmissions(): Promise<WeeklySubmission[]> {
  if (USE_MOCK) return weeklySubmissions;
  return api.get<WeeklySubmission[]>("/dashboard/submissions");
}
