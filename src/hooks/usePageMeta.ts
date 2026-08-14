import { useEffect } from "react";

const SITE_URL = "https://portal.iuptit.com";

/**
 * Set title + meta description + canonical theo từng trang (SPA nên phải đổi runtime).
 * Chỉ dùng cho các trang công khai cần index; trang portal không cần gọi.
 */
export function usePageMeta(title: string, description?: string, path?: string) {
  useEffect(() => {
    document.title = title;

    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (meta) meta.content = description;
    }

    if (path !== undefined) {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = `${SITE_URL}${path}`;
    }
  }, [title, description, path]);
}
