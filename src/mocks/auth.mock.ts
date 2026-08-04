/** Tài khoản demo cứng — TODO: MOCK — thay bằng API auth khi có backend */

import type { Role } from "../types/navigation";

export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "user-admin",
    name: "BCN Admin",
    email: "admin@iuclub.edu.vn",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user-leader",
    name: "Leader Tech",
    email: "leader@iuclub.edu.vn",
    password: "leader123",
    role: "leader",
  },
  {
    id: "user-member",
    name: "Member Training",
    email: "member@iuclub.edu.vn",
    password: "member123",
    role: "member",
  },
];
