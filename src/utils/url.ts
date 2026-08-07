/** Chuẩn hoá URL người dùng nhập — Joi `.uri()` từ chối host không có scheme. */
export function ensureHttpUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}
