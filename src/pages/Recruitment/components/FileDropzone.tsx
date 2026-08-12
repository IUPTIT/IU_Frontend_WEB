import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

type Props = {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Ô nộp file kiểu kính — kéo-thả hoặc bấm chọn, hiện chip file đã chọn. */
function FileDropzone({ label, hint, accept, file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <label
      className={`reg-drop ${dragging ? "is-drag" : ""} ${file ? "has-file" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onChange(dropped);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <>
          <FileCheck2 size={22} className="text-purple-300" aria-hidden />
          <span className="max-w-full truncate text-sm font-medium text-[hsl(var(--landing-foreground))]">
            {file.name}
          </span>
          <span className="text-xs text-[hsl(var(--landing-foreground)/0.5)]">
            {formatSize(file.size)} · bấm để đổi
          </span>
          <button
            type="button"
            aria-label={`Bỏ ${label}`}
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--landing-foreground)/0.6)] transition-colors hover:bg-white/10 hover:text-[hsl(var(--landing-foreground))]"
          >
            <X size={15} />
          </button>
        </>
      ) : (
        <>
          <UploadCloud size={24} className="text-[hsl(var(--landing-foreground)/0.55)]" aria-hidden />
          <span className="text-sm font-medium text-[hsl(var(--landing-foreground)/0.85)]">
            {label}
          </span>
          <span className="text-xs text-[hsl(var(--landing-foreground)/0.5)]">{hint}</span>
        </>
      )}
    </label>
  );
}

export default FileDropzone;
