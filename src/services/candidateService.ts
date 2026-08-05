// API dành cho Ứng viên (role candidate) — /api/v1/candidate/*
import { api } from "../api/client";

export type CandidateApplication = {
  _id: string;
  applicationCode: string | null;
  status: string;
  fullName: string;
  email: string;
  departmentPreferences: { department: string; priority: number }[];
  campaignId: { _id: string; name: string; openAt: string; closeAt: string; status: string } | string;
  submittedAt: string | null;
};

export type CandidateSlot = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  bookedCount: number;
  availableSlots: number;
};

export type CandidateBooking = {
  _id: string;
  slotId: CandidateSlot | string;
  status: "booked" | "changed" | "no_show" | "completed";
  changeCount: number;
  bookedAt: string;
};

export function getMe(): Promise<{ application: CandidateApplication; booking: CandidateBooking | null }> {
  return api.get("/candidate/me");
}

export function getAvailableSlots(): Promise<CandidateSlot[]> {
  return api.get<{ slots: CandidateSlot[] }>("/candidate/slots").then((d) => d.slots);
}

/** Giữ chỗ 150 giây — trả về hạn xác nhận */
export function holdSlot(slotId: string): Promise<{ expiresAt: string }> {
  return api
    .post<{ hold: { expiresAt: string } }>(`/candidate/slots/${slotId}/hold`)
    .then((d) => d.hold);
}

export function confirmBooking(slotId: string): Promise<CandidateBooking> {
  return api
    .post<{ booking: CandidateBooking }>("/candidate/bookings/confirm", { slotId })
    .then((d) => d.booking);
}

/** Đổi ca — tối đa 1 lần, ca mới cách hiện tại >= 24h */
export function changeSlot(newSlotId: string): Promise<CandidateBooking> {
  return api
    .put<{ booking: CandidateBooking }>("/candidate/bookings/change-slot", { newSlotId })
    .then((d) => d.booking);
}
