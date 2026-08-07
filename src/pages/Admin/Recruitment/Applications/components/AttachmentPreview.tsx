import type { ApplicationAttachment } from "../../../../../types/recruitment";

function isImage(url: string, kind: ApplicationAttachment["kind"]) {
  if (kind === "pdf") return false;
  return (
    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) ||
    url.includes("/image/upload/")
  );
}

/** PDF: đuôi .pdf, kind=pdf, hoặc Cloudinary raw/upload (CV thường không có đuôi file). */
function isPdf(url: string, kind: ApplicationAttachment["kind"]) {
  if (kind === "pdf") return true;
  return /\.pdf(\?|$)/i.test(url) || /\/raw\/upload\//i.test(url);
}

/** Xem trực tiếp tài liệu đính kèm ngay trong trang — ảnh render <img>, PDF nhúng iframe */
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

  if (isPdf(url, kind)) {
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
          Mở {label} tab mới
        </a>
      </div>
    );
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
