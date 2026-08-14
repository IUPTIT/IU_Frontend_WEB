// Postbuild: sinh dist/<route>/index.html với meta riêng cho từng trang công khai,
// để crawler mạng xã hội (Zalo/Facebook/Telegram — không chạy JS) thấy đúng card từng route.
// Thêm trang mới = thêm một entry vào ROUTES dưới đây (và thêm vào public/sitemap.xml).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://portal.iuptit.com";
const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

const ROUTES = [
  {
    path: "/tuyen-thanh-vien",
    title: "Tuyển thành viên IU Club | IU PTIT — Câu lạc bộ CNTT",
    description:
      "Đăng ký ứng tuyển thành viên IU Club (IUPTIT) — câu lạc bộ CNTT định hướng ứng dụng. Nộp đơn trực tuyến, theo dõi trạng thái hồ sơ dễ dàng.",
  },
  {
    path: "/tra-cuu",
    title: "Tra cứu hồ sơ ứng tuyển | IU Club — IU PTIT",
    description:
      "Tra cứu trạng thái hồ sơ ứng tuyển thành viên IU Club (IUPTIT) bằng mã hồ sơ hoặc email.",
  },
  // Chưa có route trong app — bỏ comment khi trang được thêm vào App.tsx:
  // { path: "/tin-tuc", title: "Tin tức | IU Club — IU PTIT", description: "Tin tức và hoạt động mới nhất của IU Club (IUPTIT)." },
  // { path: "/su-kien", title: "Sự kiện | IU Club — IU PTIT", description: "Các sự kiện sắp diễn ra của IU Club (IUPTIT)." },
];

const base = readFileSync(join(dist, "index.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const r of ROUTES) {
  const url = `${SITE_URL}${r.path}`;
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
    .replace(/(<meta property="og:description"\s+content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
    .replace(/(<meta name="twitter:description"\s+content=")[^"]*(")/, `$1${esc(r.description)}$2`);

  const outDir = join(dist, ...r.path.split("/").filter(Boolean));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`prerender-meta: ${r.path} -> ${join(outDir, "index.html")}`);
}
