// Mock ban điều hành theo nhiệm kỳ — sau này lấy từ trang quản trị qua services
export type BoardMember = {
  name: string;
  role: string;
  team?: string;
  image?: string; // chưa có ảnh → hiển thị chữ cái đầu
};

export const CURRENT_TERM = "Nhiệm kỳ 2026 – 2027";

export const BOARD_MEMBERS: BoardMember[] = [
  { name: "Trần Đức Định", role: "Chủ nhiệm" },
  { name: "Lê Thị Thảo", role: "Phó chủ nhiệm", team: "Phụ trách Sự kiện — Truyền thông" },
  { name: "Trần Nhật Phúc", role: "Phó chủ nhiệm", team: "Phụ trách Chuyên môn" },
  { name: "Phạm Xuân Công", role: "Thủ quỹ" },
];
