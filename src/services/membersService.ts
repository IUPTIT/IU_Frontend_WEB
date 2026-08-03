// TODO: MOCK — thay bằng API thật khi có backend
import type { ClubMember, CreateClubMemberInput } from "../types/members";
import { mockClubMembers } from "../mocks/members.mock";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let store = [...mockClubMembers];

export async function getClubMembers(): Promise<ClubMember[]> {
  await delay();
  return [...store];
}

export async function createClubMember(input: CreateClubMemberInput): Promise<ClubMember> {
  await delay(400);
  const created: ClubMember = {
    id: `cm-${Date.now()}`,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    role: input.role,
    departmentId: input.departmentId,
    departmentName: input.departmentName,
    status: "active",
    joinedAt: new Date().toISOString(),
    studentId: input.studentId,
    generation: input.generation,
  };
  store = [created, ...store];
  return created;
}

export async function setClubMemberStatus(
  id: string,
  status: ClubMember["status"],
): Promise<ClubMember | undefined> {
  await delay(250);
  store = store.map((m) => (m.id === id ? { ...m, status } : m));
  return store.find((m) => m.id === id);
}

export async function updateClubMemberRole(
  id: string,
  role: ClubMember["role"],
): Promise<ClubMember | undefined> {
  await delay(250);
  store = store.map((m) => (m.id === id ? { ...m, role } : m));
  return store.find((m) => m.id === id);
}
