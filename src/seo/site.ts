export const SITE_NAME = "IU CLUB";
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") || "https://portal.iuptit.com";
export const SITE_TAGLINE = "Shine and Thrive";
export const DEFAULT_DESCRIPTION =
  "Câu lạc bộ IU CLUB là cộng đồng dành cho sinh viên PTIT, nơi kết nối những bạn trẻ cùng học hỏi, khám phá và phát triển bản thân. Thông qua các hoạt động, dự án, workshop và sự kiện, IU CLUB tạo môi trường để sinh viên rèn luyện kỹ năng, tích lũy trải nghiệm và cùng nhau tạo nên những giá trị ý nghĩa với tinh thần \"Shine and Thrive\".";

export const OG_IMAGE_PATH = "/og.jpg";

type SeoEntry = {
  title: string;
  description: string;
  robots?: string;
};

const PUBLIC_PAGES: Record<string, SeoEntry> = {
  "/": {
    title: "IU CLUB — Shine and Thrive",
    description: DEFAULT_DESCRIPTION,
  },
  "/ve-iu-club": {
    title: "Về IU CLUB — Câu chuyện cộng đồng",
    description:
      "Hành trình IU CLUB từ ngày thành lập 03/01/2024, những thế hệ đặt nền móng và tinh thần Shine and Thrive.",
  },
  "/dao-tao": {
    title: "Đào tạo IU CLUB — Lộ trình và kỹ năng",
    description:
      "Lộ trình đào tạo IU CLUB: nền tảng, định hướng, thực hành và đồng hành cùng mentor trong cộng đồng CNTT.",
  },
  "/su-kien": {
    title: "Sự kiện IU CLUB — Workshop, contest và cộng đồng",
    description:
      "Các sự kiện, cuộc thi và hoạt động cộng đồng của IU CLUB dành cho sinh viên công nghệ.",
  },
  "/tuyen-thanh-vien": {
    title: "Tuyển thành viên IU CLUB",
    description:
      "Nộp hồ sơ ứng tuyển thành viên IU CLUB. Điền form, theo dõi hạn đăng ký và gia nhập cộng đồng CNTT.",
  },
  "/tra-cuu": {
    title: "Tra cứu hồ sơ IU CLUB",
    description: "Tra cứu trạng thái hồ sơ ứng tuyển IU CLUB bằng email hoặc mã hồ sơ, không cần đăng nhập.",
  },
  "/login": {
    title: "Đăng nhập — IU CLUB",
    description: "Đăng nhập không gian quản lý IU CLUB dành cho ứng viên, thành viên và Ban Chủ nhiệm.",
    robots: "noindex, nofollow",
  },
  "/reset-password": {
    title: "Đặt lại mật khẩu — IU CLUB",
    description: "Đặt lại mật khẩu tài khoản không gian quản lý IU CLUB.",
    robots: "noindex, nofollow",
  },
};

export function seoForPath(pathname: string): SeoEntry & { canonical: string; robots: string } {
  const path = pathname.replace(/\/+$/, "") || "/";
  const isApp =
    path.startsWith("/admin") ||
    path.startsWith("/leader") ||
    path.startsWith("/member") ||
    path.startsWith("/candidate");
  const page = PUBLIC_PAGES[path];
  if (isApp) {
    return {
      title: "IU CLUB Studio",
      description: "Không gian quản lý IU CLUB.",
      robots: "noindex, nofollow",
      canonical: `${SITE_URL}${path}`,
    };
  }
  return {
    title: page?.title ?? `${SITE_NAME} — Shine and Thrive`,
    description: page?.description ?? DEFAULT_DESCRIPTION,
    robots: page?.robots ?? "index, follow",
    canonical: `${SITE_URL}${path === "/" ? "/" : path}`,
  };
}
