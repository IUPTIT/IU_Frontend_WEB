import { api } from "../api/client";

export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function listNotifications(): Promise<{ items: AppNotification[]; unread: number }> {
  return api.get("/notifications");
}

export function markNotificationRead(id: string): Promise<void> {
  return api.post(`/notifications/${id}/read`).then(() => undefined);
}

export function markAllNotificationsRead(): Promise<void> {
  return api.post("/notifications/read-all").then(() => undefined);
}
