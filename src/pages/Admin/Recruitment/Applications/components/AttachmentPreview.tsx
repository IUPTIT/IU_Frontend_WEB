import { useEffect, useState } from "react";
import type { ApplicationAttachment } from "../../../../../types/recruitment";

function isImage(url: string, kind: ApplicationAttachment["kind"]) {
  if (kind === "pdf") return false;
  return (
    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) ||
    url.includes("/image/upload/")
  );
}

/** Cloudinary raw/upload: CV thường không có đuôi, được phục vụ dạng
 *  application/octet-stream + Content-Disposition: attachment → nhúng iframe
 *  trực tiếp sẽ khiến trình duyệt TẢI FILE VỀ thay vì xem. Phải fetch blob. */
function isCloudinaryRaw(url: string) {
  return /\/raw\/upload\//i.test(url);
}

/** PDF render inline an toàn (có đuôi .pdf) — trình duyệt tự mở, không tải về. */
function isInlinePdf(url: string, kind: ApplicationAttachment["kind"]) {
  if (isCloudinaryRaw(url)) return false;
  return kind === "pdf" || /\.pdf(\?|$)/i.test(url);
}

/**
 * Xem CV bị Cloudinary phục vụ dạng attachment: tải về blob, ép MIME
 * application/pdf rồi render qua object URL (blob URL không có
 * Content-Disposition nên hiển thị inline, KHÔNG auto-download).
 */
function BlobPdfPreview({ url, label }: { url: string; label: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setState("loading");
    setBlobUrl(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(async (blob) => {
        // Kiểm tra magic bytes "%PDF" — tránh nhúng nhầm file không phải PDF
        const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
        const isPdf =
          head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
        if (!isPdf) throw new Error("not-pdf");
        objectUrl = URL.createObjectURL(
          blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" }),
        );
        if (!cancelled) {
          setBlobUrl(objectUrl);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (state === "error") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="neu-btn !h-12 w-full !justify-center !px-4 text-sm font-medium"
      >
        Tải {label} (không xem trước được)
      </a>
    );
  }

  return (
    <div className="space-y-2">
      {state === "loading" || !blobUrl ? (
        <div
          className="h-96 w-full animate-pulse rounded-2xl bg-background shadow-inset-sm"
          aria-busy="true"
        />
      ) : (
        <iframe
          src={`${blobUrl}#toolbar=0`}
          title={label}
          className="h-96 w-full rounded-2xl shadow-inset-sm bg-background"
        />
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-sm font-medium text-accent hover:underline"
      >
        Tải {label}
      </a>
    </div>
  );
}

/** Xem trực tiếp tài liệu đính kèm ngay trong trang — ảnh render <img>, PDF nhúng inline */
function AttachmentPreview({ attachment }: { attachment: ApplicationAttachment }) {
  const { url, label, kind } = attachment;

  if (isImage(url, kind)) {
    return (
      <img
        src={url}
        alt={label}
        className="max-h-72 w-full rounded-2xl object-contain shadow-inset-sm bg-background"
        loading="lazy"
      />
    );
  }

  // PDF thật (đuôi .pdf) → nhúng iframe trực tiếp, trình duyệt render inline
  if (isInlinePdf(url, kind)) {
    return (
      <div className="space-y-2">
        <iframe
          src={`${url}#toolbar=0`}
          title={label}
          className="h-96 w-full rounded-2xl shadow-inset-sm bg-background"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-accent hover:underline"
        >
          Mở {label} ở tab mới
        </a>
      </div>
    );
  }

  // Cloudinary raw (CV không đuôi) hoặc kind=pdf bị phục vụ attachment → fetch blob
  if (isCloudinaryRaw(url) || kind === "pdf") {
    return <BlobPdfPreview url={url} label={label} />;
  }

  // DOCX và định dạng khác trình duyệt không render được — đành mở tab mới
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="neu-btn !h-12 w-full !justify-center !px-4 text-sm font-medium"
    >
      Xem {label} (định dạng không nhúng được)
    </a>
  );
}

export default AttachmentPreview;
