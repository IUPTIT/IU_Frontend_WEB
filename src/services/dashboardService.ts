// Service tổng quan Admin — số liệu thật từ BE.
import { api } from "../api/client";
import type {
  FunnelStage,
  PendingReview,
  StatCard,
  TraineeDepartment,
  TrainingScore,
  WeeklySubmission,
} from "../types/admin";

export type DashboardOverview = {
  id: string;
  label: string;
  statCards: StatCard[];
  recruitmentFunnel: FunnelStage[];
  weeklySubmissions: WeeklySubmission[];
  dailySubmissions: WeeklySubmission[];
  trainingScores: TrainingScore[];
  traineeTotal: number;
  traineeDepartments: TraineeDepartment[];
  pendingReview: PendingReview;
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { overview } = await api.get<{ overview: DashboardOverview }>(
    "/admin/dashboard/overview",
  );
  return overview;
}
