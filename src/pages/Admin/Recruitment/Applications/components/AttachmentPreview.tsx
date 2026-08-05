import type { ApplicationAttachment } from "../../../../../types/recruitment";

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || url.includes("/image/upload/");
}

function isPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}

/** Xem trực tiếp tài liệu đính kèm ngay trong trang — ảnh render <img>, PDF nhúng iframe */
function AttachmentPreview({ attachment }: { attachment: ApplicationAttachment }) {
  const { url, label } = attachment;

  if (isImage(url)) {
    return (
      <img
        src={url}
        alt={label}
        className="max-h-72 w-full rounded-2xl object-contain shadow-inset-sm bg-background"
        loading="lazy"
      />
    );
  }

  if (isPdf(url)) {
    return (
      <iframe
        src={`${url}#toolbar=0`}
        title={label}
        className="h-96 w-full rounded-2xl shadow-inset-sm bg-background"
      />
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
