/**
 * Ảnh landing lấy từ src/assets (khớp đúng tên file, kể cả khoảng trắng).
 */

const ASSET_MODULES = {
  ...import.meta.glob("../../assets/*.webp", { eager: true, import: "default" }),
  ...import.meta.glob("../../assets/logo.png", { eager: true, import: "default" }),
  ...import.meta.glob("../../assets/logo-v2.jpg", { eager: true, import: "default" }),
} as Record<string, string>;

export function assetUrl(...fileNames: string[]): string | undefined {
  for (const fileName of fileNames) {
    const webpName = fileName.replace(/\.(png|jpe?g)$/i, ".webp");
    for (const needle of [webpName, fileName].map((name) => name.toLowerCase())) {
      const hit = Object.entries(ASSET_MODULES).find(([path]) =>
        path.replace(/\\/g, "/").toLowerCase().endsWith(`/${needle}`),
      );
      if (hit) return hit[1];
    }
  }
  return undefined;
}

export const LANDING_IMAGES = {
  banner: assetUrl("Banner.png"),
  bannerMobile: assetUrl("Banner-960.webp", "Banner.png"),
  logo: assetUrl("logo.png", "logo-v2.jpg", "logo-mark.png"),
  logoMark: assetUrl("logo-mark.png", "logo.png"),
  about1: assetUrl("about-gallery-1.jpg", "about-gallery-1.png", "Sinh nhật IU.png"),
  about2: assetUrl("about-gallery-2.jpg", "about-gallery-2.png", "DinhChan.png"),
  activities: [
    { file: "Traning New.png", src: assetUrl("Traning New.png") },
    { file: "AI CHALLENGE 2025.png", src: assetUrl("AI CHALLENGE 2025.png") },
    {
      file: "UDU OPEN ESPORTS CHAMPIONSHIP 2025.png",
      src: assetUrl("UDU OPEN ESPORTS CHAMPIONSHIP 2025.png"),
    },
    { file: "YEAR END PARTY.png", src: assetUrl("YEAR END PARTY.png") },
    { file: "Sinh nhật IU.png", src: assetUrl("Sinh nhật IU.png") },
  ],
  mentor1: assetUrl("Thầy phan lý huỳnh.png", "mentor-1.jpg", "mentor-1.png"),
  mentor2: assetUrl("Thầy Trần Quang Đại.png", "mentor-2.jpg", "mentor-2.png"),
  achievements: [
    { file: "UEB DATA SHOWDOWN 2025.png", src: assetUrl("UEB DATA SHOWDOWN 2025.png") },
    { file: "Coding Fest.png", src: assetUrl("Coding Fest.png") },
    { file: "Hội Thảo Việt ÚC.png", src: assetUrl("Hội Thảo Việt ÚC.png") },
  ],
  moments: [
    { file: "Traning New.png", src: assetUrl("Traning New.png") },
    { file: "about-gallery-1.png", src: assetUrl("about-gallery-1.png") },
    { file: "Sinh nhật IU.png", src: assetUrl("Sinh nhật IU.png") },
    { file: "YEAR END PARTY.png", src: assetUrl("YEAR END PARTY.png") },
    { file: "AI CHALLENGE 2025.png", src: assetUrl("AI CHALLENGE 2025.png") },
  ],
  founders: {
    dinh: assetUrl("TranDucDinh.png"),
    minh: assetUrl("DoVanMinh.png"),
    phong: assetUrl("NguyenKhaPhong.png"),
    linh: assetUrl("NguyenPhuongLinh.png"),
  },
  aboutHero: [
    { file: "HeroVechungtoi1.png", src: assetUrl("HeroVechungtoi1.png") },
    { file: "HeroVechungtoi2.png", src: assetUrl("HeroVechungtoi2.png") },
    { file: "HeroVechungtoi3.png", src: assetUrl("HeroVechungtoi3.png") },
  ],
  trainChapters: [
    assetUrl("Dinhhuong.png"),
    assetUrl("NỀN TẢNG.png"),
    assetUrl("Thuchanh.png"),
    assetUrl("Thầy phan lý huỳnh.png", "mentor-1.jpg", "mentor-1.png"),
  ],
};

export const MENTOR_FALLBACKS = [
  "https://res.cloudinary.com/dqca5ltt9/image/upload/v1735713289/iuc-images/advisors/rq3fthmtfn6sh6sg8xrx.jpg",
  "https://res.cloudinary.com/dqca5ltt9/image/upload/v1735713289/iuc-images/advisors/r7hvqvs8tkllqbt1wyia.jpg",
] as const;
