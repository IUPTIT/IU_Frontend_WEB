// Tải file từ URL (kể cả cross-origin Cloudinary) về máy đúng tên + đuôi.
// Cloudinary raw phục vụ CV dạng octet-stream không đuôi → link `download` trực
// tiếp bị trình duyệt bỏ qua (khác origin) và lưu sai tên. Fetch blob rồi tải.
export async function downloadUrlAsFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tải thất bại (HTTP ${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Slug tên file an toàn: bỏ dấu tiếng Việt + ký tự lạ, giữ khoảng trắng gọn. */
export function safeFileStem(name: string): string {
  return (name || "file")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "file";
}
