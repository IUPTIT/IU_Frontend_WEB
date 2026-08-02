// Định dạng ngày kiểu Việt Nam: "20/09/2023"
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// "20/09" — dạng ngắn cho chart/badge
export function formatDateShort(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}
