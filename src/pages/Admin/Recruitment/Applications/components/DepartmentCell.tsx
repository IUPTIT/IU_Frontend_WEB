/** Icon nhỏ theo ban nguyện vọng — Soft UI well */

type Props = {
  departmentId: string;
  departmentName: string;
};

function DeptIcon({ departmentId }: { departmentId: string }) {
  const common = "h-4 w-4";
  if (departmentId.includes("media") || departmentId.includes("truyen")) {
    return (
      <svg className={`${common} text-emerald-600`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M3 8.5v3h3l4 3.5V5L6 8.5H3Z" strokeLinejoin="round" />
        <path d="M13 7.5a3 3 0 0 1 0 5" strokeLinecap="round" />
      </svg>
    );
  }
  if (departmentId.includes("event") || departmentId.includes("su-kien")) {
    return (
      <svg className={`${common} text-violet-600`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="3" y="5" width="14" height="12" rx="2" />
        <path d="M3 9h14M7 3v4M13 3v4" strokeLinecap="round" />
      </svg>
    );
  }
  if (departmentId.includes("hr") || departmentId.includes("doi-ngoai") || departmentId.includes("ext")) {
    return (
      <svg className={`${common} text-rose-500`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M7 11.5 5.5 13a2.5 2.5 0 1 0 3.5 3.5l1-1" strokeLinecap="round" />
        <path d="m13 8.5 1.5-1.5a2.5 2.5 0 1 0-3.5-3.5l-1 1" strokeLinecap="round" />
        <path d="m8 12 4-4" strokeLinecap="round" />
      </svg>
    );
  }
  // default: chuyên môn / kỹ thuật
  return (
    <svg className={`${common} text-sky-600`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="m6 7-3 3 3 3M14 7l3 3-3 3M11 5l-2 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DepartmentCell({ departmentId, departmentName }: Props) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="neu-well-sm h-8 w-8 shrink-0">
        <DeptIcon departmentId={departmentId} />
      </span>
      <span className="text-sm text-foreground">{departmentName}</span>
    </div>
  );
}

export default DepartmentCell;
