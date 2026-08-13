import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Download, Loader2, Maximize2 } from "lucide-react";
import type { ApplicationAttachment } from "../../../../../types/recruitment";
import Icon from "../../../../../components/ui/Icon";
import AttachmentLightbox from "./AttachmentLightbox";
import { downloadUrlAsFile, safeFileStem } from "../../../../../utils/downloadFile";

function isImage(url: string, kind: ApplicationAttachment["kind"]) {
  if (kind === "pdf") return false;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || url.includes("/image/upload/");
}

/** Cloudinary raw/upload: CV không đuôi, phục vụ octet-stream + Content-Disposition
 *  attachment → nhúng trực tiếp sẽ TẢI VỀ thay vì xem. Phải fetch blob. */
function isCloudinaryRaw(url: string) {
  return /\/raw\/upload\//i.test(url);
}

/** PDF render inline an toàn (có đuôi .pdf) — trình duyệt tự mở. */
function isInlinePdf(url: string, kind: ApplicationAttachment["kind"]) {
  if (isCloudinaryRaw(url)) return false;
  return kind === "pdf" || /\.pdf(\?|$)/i.test(url);
}

function imageExt(url: string): string {
  const m = /\.(jpe?g|png|gif|webp)(\?|$)/i.exec(url);
  return (m?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
}

/** Nút tải xuống — đúng vibe Soft UI, tải blob về đúng tên/đuôi. */
function DownloadAction({ url, filename, label }: { url: string; filename: string; label: string }) {
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try {
      await downloadUrlAsFile(url, filename);
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <button type="button" onClick={download} disabled={downloading} className="ui-btn !h-10 !px-4 text-sm">
      <Icon icon={downloading ? Loader2 : Download} size={15} className={downloading ? "animate-spin" : ""} />
      {downloading ? "Đang tải..." : `Tải ${label}`}
    </button>
  );
}

/** Bọc preview: bấm vào để phóng to (overlay phủ cả iframe), hiện icon khi hover. */
function ZoomableFrame({ onZoom, children }: { onZoom: () => void; children: ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <button
        type="button"
        onClick={onZoom}
        aria-label="Phóng to"
        className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 transition-opacity hover:bg-black/25 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
          <Icon icon={Maximize2} size={18} />
        </span>
      </button>
    </div>
  );
}

/** CV bị Cloudinary phục vụ attachment: fetch blob, ép PDF, render iframe inline. */
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
        const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
        const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
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
      <p className="rounded-2xl bg-background p-4 text-sm text-muted shadow-hairline">
        Không xem trước được — dùng nút Tải xuống bên dưới.
      </p>
    );
  }
  if (state === "loading" || !blobUrl) {
    return <div className="h-96 w-full animate-pulse rounded-2xl bg-background shadow-hairline" aria-busy="true" />;
  }
  return (
    <iframe
      src={`${blobUrl}#toolbar=0`}
      title={label}
      className="h-96 w-full rounded-2xl bg-background shadow-hairline"
    />
  );
}

/** Xem tài liệu đính kèm ngay trong trang; bấm để phóng to toàn màn hình. */
function AttachmentPreview({
  attachment,
  ownerName,
}: {
  attachment: ApplicationAttachment;
  ownerName?: string;
}) {
  const { url, label, kind } = attachment;
  const [lightbox, setLightbox] = useState(false);
  const stem = ownerName ? `${safeFileStem(ownerName)}-` : "";

  // Ảnh đại diện
  if (isImage(url, kind)) {
    const filename = `${stem}${safeFileStem(label)}.${imageExt(url)}`;
    return (
      <div className="space-y-2.5">
        <ZoomableFrame onZoom={() => setLightbox(true)}>
          <img
            src={url}
            alt={label}
            loading="lazy"
            className="max-h-72 w-full rounded-2xl bg-background object-contain shadow-hairline"
          />
        </ZoomableFrame>
        <DownloadAction url={url} filename={filename} label={label} />
        <AttachmentLightbox
          open={lightbox}
          onClose={() => setLightbox(false)}
          url={url}
          label={label}
          filename={filename}
          variant="image"
        />
      </div>
    );
  }

  // PDF thật (đuôi .pdf) → nhúng iframe trực tiếp
  if (isInlinePdf(url, kind)) {
    const filename = `${stem}${safeFileStem(label)}.pdf`;
    return (
      <div className="space-y-2.5">
        <ZoomableFrame onZoom={() => setLightbox(true)}>
          <iframe
            src={`${url}#toolbar=0`}
            title={label}
            className="h-96 w-full rounded-2xl bg-background shadow-hairline"
          />
        </ZoomableFrame>
        <DownloadAction url={url} filename={filename} label={label} />
        <AttachmentLightbox
          open={lightbox}
          onClose={() => setLightbox(false)}
          url={url}
          label={label}
          filename={filename}
          variant="pdf"
        />
      </div>
    );
  }

  // CV Cloudinary raw / kind=pdf phục vụ attachment → blob preview
  if (isCloudinaryRaw(url) || kind === "pdf") {
    const filename = `${stem}${safeFileStem(label)}.pdf`;
    return (
      <div className="space-y-2.5">
        <ZoomableFrame onZoom={() => setLightbox(true)}>
          <BlobPdfPreview url={url} label={label} />
        </ZoomableFrame>
        <DownloadAction url={url} filename={filename} label={label} />
        <AttachmentLightbox
          open={lightbox}
          onClose={() => setLightbox(false)}
          url={url}
          label={label}
          filename={filename}
          variant="pdf"
        />
      </div>
    );
  }

  // DOCX và định dạng khác — chỉ tải xuống
  const filename = `${stem}${safeFileStem(label)}`;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await downloadUrlAsFile(url, filename);
        } catch {
          window.open(url, "_blank", "noopener");
        }
      }}
      className="ui-btn !h-12 w-full !justify-center !px-4 text-sm"
    >
      <Icon icon={Download} size={16} />
      Tải {label} (định dạng không nhúng được)
    </button>
  );
}

export default AttachmentPreview;
