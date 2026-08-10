/** Validate họ tên / SĐT — khớp BE (personName, phoneVN). */

export const PHONE_VN_RE = /^0\d{9}$/;

export function validatePersonName(name: string): string | null {
  const t = name.trim();
  if (t.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
  if (t.length > 100) return "Họ tên tối đa 100 ký tự";
  return null;
}

/** emptyOk: true cho phép để trống (hồ sơ tùy chọn). */
export function validatePhoneVN(
  phone: string,
  { emptyOk = false }: { emptyOk?: boolean } = {},
): string | null {
  const t = phone.trim();
  if (!t) return emptyOk ? null : "Số điện thoại là bắt buộc";
  if (!PHONE_VN_RE.test(t)) {
    return "Số điện thoại phải gồm 10 số và bắt đầu bằng 0";
  }
  return null;
}
