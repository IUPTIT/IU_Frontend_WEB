import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Download, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import Icon from "../../../../../components/ui/Icon";
import { downloadUrlAsFile } from "../../../../../utils/downloadFile";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
  label: string;
  filename: string;
  variant: "image" | "pdf";
};

/** Nút trên thanh công cụ lightbox — nền tối trong suốt, đồng bộ với backdrop. */
function BarButton({
  onClick,
  disabled,
  icon,
  spin,
  children,
  square,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: typeof Download;
  spin?: boolean;
  children?: ReactNode;
  square?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60 ${
        square ? "w-10" : "px-4"
      }`}
    >
      <Icon icon={icon} size={16} className={spin ? "animate-spin" : ""} />
      {children}
    </button>
  );
}

/** Xem tài liệu (ảnh/CV) toàn màn hình — ảnh phóng to được, CV render lớn. */
function AttachmentLightbox({ open, onClose, url, label, filename, variant }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfState, setPdfState] = useState<"loading" | "ready" | "error">("loading");

  // ESC đóng + khoá cuộn nền
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setZoomed(false);
  }, [open]);

  // CV Cloudinary raw phục vụ octet-stream → fetch blob, ép application/pdf để
  // iframe render inline (blob URL không có Content-Disposition nên không tải về)
  useEffect(() => {
    if (!open || variant !== "pdf") return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setPdfState("loading");
    setPdfUrl(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(
          blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" }),
        );
        if (!cancelled) {
          setPdfUrl(objectUrl);
          setPdfState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setPdfState("error");
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, url, variant]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadUrlAsFile(url, filename);
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="lb-fade fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="min-w-0 truncate text-sm font-medium text-white/90">{label}</span>
        <div className="flex items-center gap-2">
          {variant === "image" && (
            <BarButton
              onClick={() => setZoomed((z) => !z)}
              icon={zoomed ? ZoomOut : ZoomIn}
              ariaLabel={zoomed ? "Thu nhỏ" : "Phóng to"}
            >
              {zoomed ? "Thu nhỏ" : "Phóng to"}
            </BarButton>
          )}
          <BarButton onClick={handleDownload} disabled={downloading} icon={downloading ? Loader2 : Download} spin={downloading}>
            {downloading ? "Đang tải..." : "Tải xuống"}
          </BarButton>
          <BarButton onClick={onClose} icon={X} square ariaLabel="Đóng" />
        </div>
      </div>

      <div
        className="lb-pop ui-scroll min-h-0 flex-1 overflow-auto p-4 sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {variant === "image" ? (
          <div className="flex min-h-full items-center justify-center">
            <img
              src={url}
              alt={label}
              onClick={() => setZoomed((z) => !z)}
              className={
                zoomed
                  ? "max-w-none cursor-zoom-out rounded-lg"
                  : "max-h-[82vh] max-w-full cursor-zoom-in rounded-lg object-contain"
              }
            />
          </div>
        ) : pdfState === "error" ? (
          <div className="flex h-full items-center justify-center">
            <BarButton onClick={handleDownload} icon={Download}>
              Không xem trước được — tải {label}
            </BarButton>
          </div>
        ) : pdfState === "loading" || !pdfUrl ? (
          <div className="flex h-full items-center justify-center text-white/70">
            <Icon icon={Loader2} size={30} className="animate-spin" />
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            title={label}
            className="mx-auto h-[82vh] w-full max-w-4xl rounded-xl bg-white"
          />
        )}
      </div>
    </div>
  );
}

export default AttachmentLightbox;
