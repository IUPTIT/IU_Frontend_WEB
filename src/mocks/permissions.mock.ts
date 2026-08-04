// TODO: MOCK — thay bằng API thật khi có backend
import type { ManagedAccount } from "../types/permissions";

export const mockManagedAccounts: ManagedAccount[] = [
  {
    id: "acc-1",
    fullName: "Lê Minh Cường",
    email: "cuong.le@student.iu.edu.vn",
    role: "member",
    isTrainingMember: true,
    departmentId: "dept-tech",
    departmentName: "Ban Kỹ thuật",
    createdAt: "2026-08-01T10:00:00.000Z",
    createdBy: "admin-1",
  },
  {
    id: "acc-2",
    fullName: "Võ Hải Phong",
    email: "phong.vo@student.iu.edu.vn",
    role: "member",
    isTrainingMember: true,
    departmentId: "dept-tech",
    departmentName: "Ban Kỹ thuật",
    createdAt: "2026-08-01T10:05:00.000Z",
    createdBy: "admin-1",
  },
  {
    id: "acc-3",
    fullName: "Nguyễn Leader",
    email: "leader.nguyen@student.iu.edu.vn",
    role: "leader",
    departmentId: "dept-tech",
    departmentName: "Ban Kỹ thuật",
    createdAt: "2026-07-15T09:00:00.000Z",
    createdBy: "admin-1",
  },
  {
    id: "acc-4",
    fullName: "Trần Mentor",
    email: "mentor.tran@student.iu.edu.vn",
    role: "leader",
    departmentId: "dept-media",
    departmentName: "Ban Truyền thông",
    createdAt: "2026-07-16T09:00:00.000Z",
    createdBy: "admin-1",
  },
];

export const mockManagedAccountsEmpty: ManagedAccount[] = [];
