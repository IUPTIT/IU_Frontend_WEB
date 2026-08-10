import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
  Save,
  Upload,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import Button from "../../../../components/ui/Button";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import Icon from "../../../../components/ui/Icon";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import {
  importClubMembers,
  validateMemberImport,
} from "../../../../services/membersService";
import type {
  MemberImportInvalid,
  MemberImportRow,
} from "../../../../types/members";
import {
  validatePersonName,
  validatePhoneVN,
} from "../../../../utils/validateContact";

type Step = 1 | 2 | 3 | 4;

type SystemFieldKey =
  | "fullName"
  | "email"
  | "phone"
  | "studentId"
  | "generation"
  | "departmentName";

const STEP_LABELS: Record<Step, string> = {
  1: "Select file",
  2: "Match data columns",
  3: "Preview data",
  4: "Processing results",
};

const SYSTEM_FIELDS: {
  key: SystemFieldKey;
  label: string;
  required: boolean;
}[] = [
  { key: "fullName", label: "Họ tên", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "SĐT", required: false },
  { key: "studentId", label: "MSSV", required: false },
  { key: "generation", label: "Lớp", required: false },
  { key: "departmentName", label: "Ban", required: false },
];

const SAMPLE_HEADERS = [
  "Họ tên",
  "Email",
  "SĐT",
  "MSSV",
  "Lớp",
  "Ban",
] as const;

const MAX_BYTES = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREVIEW_PAGE_SIZE = 10;

type FieldErrors = Partial<Record<SystemFieldKey, string>>;

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
};

function downloadSampleTemplate() {
  const aoa = [
    [...SAMPLE_HEADERS],
    [
      "Nguyễn Văn A",
      "nguyenvana@gmail.com",
      "0987654321",
      "B24DCCC001",
      "D24CQCC01-B",
      "",
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  XLSX.writeFile(wb, "Mau_import_thanh_vien.xlsx");
}

function cellStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return String(v).trim();
}

function ImportStepper({ step }: { step: Step }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 border-b border-black/5 px-5 py-4 sm:gap-4 sm:px-6">
      {([1, 2, 3, 4] as Step[]).map((s, i) => {
        const done = s < step;
        const active = s === step;
        return (
          <li key={s} className="flex min-w-0 items-center gap-2">
            {i > 0 && (
              <span className="mx-1 hidden h-px w-6 bg-black/10 sm:block" />
            )}
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-foreground text-background"
                    : "bg-black/10 text-muted"
              }`}
            >
              {done ? <Icon icon={Check} size={14} /> : s}
            </span>
            <span
              className={`truncate text-xs font-semibold sm:text-sm ${
                active ? "text-foreground" : "text-muted"
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function MemberImportModal({ open, onClose, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [headerRow, setHeaderRow] = useState(1);
  const [mapping, setMapping] = useState<
    Partial<Record<SystemFieldKey, string>>
  >({});
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [validRows, setValidRows] = useState<MemberImportRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<MemberImportInvalid[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<number, FieldErrors>>(
    {},
  );
  const [showFailed, setShowFailed] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);
  const [confirmSave, setConfirmSave] = useState(false);
  const [importDone, setImportDone] = useState<{ count: number } | null>(null);
  const [previewPage, setPreviewPage] = useState(1);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStep(1);
      setFileName("");
      setWorkbook(null);
      setSheetName("");
      setHeaderRow(1);
      setMapping({});
      setChecking(false);
      setSaving(false);
      setError(null);
      setChecked(false);
      setValidRows([]);
      setInvalidRows([]);
      setFieldErrors({});
      setShowFailed(true);
      setShowSuccess(true);
      setConfirmSave(false);
      setImportDone(null);
      setPreviewPage(1);
    }
  }

  const sheetNames = workbook?.SheetNames ?? [];

  const sheetMatrix = useMemo(() => {
    if (!workbook || !sheetName) return [] as unknown[][];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as unknown[][];
  }, [workbook, sheetName]);

  const excelColumns = useMemo(() => {
    const row = sheetMatrix[headerRow - 1] ?? [];
    return row.map((cell, i) => cellStr(cell) || `Cột ${i + 1}`);
  }, [sheetMatrix, headerRow]);

  const dataRows = useMemo(() => {
    return sheetMatrix
      .slice(headerRow)
      .filter((row) => (row as unknown[]).some((c) => cellStr(c) !== ""));
  }, [sheetMatrix, headerRow]);

  const mappedRows: MemberImportRow[] = useMemo(() => {
    const colIndex = (header: string | undefined) =>
      header ? excelColumns.indexOf(header) : -1;
    return dataRows.map((row, i) => {
      const get = (key: SystemFieldKey) => {
        const idx = colIndex(mapping[key]);
        if (idx < 0) return "";
        return cellStr((row as unknown[])[idx]);
      };
      return {
        rowIndex: headerRow + i + 1,
        fullName: get("fullName"),
        email: get("email"),
        phone: get("phone") || undefined,
        studentId: get("studentId") || undefined,
        generation: get("generation") || undefined,
        departmentName: get("departmentName") || undefined,
      };
    });
  }, [dataRows, excelColumns, mapping, headerRow]);

  const requiredMapped = Boolean(mapping.fullName) && Boolean(mapping.email);
  const hasClientFormatErrors = Object.keys(fieldErrors).length > 0;

  const computeClientErrors = () => {
    const next: Record<number, FieldErrors> = {};
    for (const row of mappedRows) {
      const errs: FieldErrors = {};
      const nameErr = validatePersonName(row.fullName || "");
      if (nameErr) errs.fullName = nameErr;
      if (!row.email?.trim()) errs.email = "Email là bắt buộc";
      else if (!EMAIL_RE.test(row.email.trim()))
        errs.email = "Email không hợp lệ";
      const phoneErr = validatePhoneVN(row.phone || "", { emptyOk: true });
      if (phoneErr) errs.phone = phoneErr;
      if (Object.keys(errs).length) next[row.rowIndex!] = errs;
    }
    setFieldErrors(next);
    return next;
  };

  if (!open) return null;

  const resetCheck = () => {
    setChecked(false);
    setValidRows([]);
    setInvalidRows([]);
    setImportDone(null);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("Chỉ chấp nhận file .xlsx hoặc .xls");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Maximum 1 items, each file must not exceed 5Mb.");
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      setWorkbook(wb);
      setFileName(file.name);
      setSheetName(wb.SheetNames[0] ?? "");
      setHeaderRow(1);
      setMapping({});
      resetCheck();
    } catch {
      setError("Không đọc được file Excel");
    }
  };

  const autoMap = (cols: string[]) => {
    const next: Partial<Record<SystemFieldKey, string>> = {};
    const lower = cols.map((c) => c.toLowerCase());
    const find = (...needles: string[]) => {
      const i = lower.findIndex((c) => needles.some((n) => c.includes(n)));
      return i >= 0 ? cols[i] : undefined;
    };
    next.fullName = find("họ tên", "ho ten", "fullname", "full name");
    next.email = find("email", "e-mail");
    next.phone = find("sđt", "sdt", "phone", "điện thoại", "dien thoai");
    next.studentId = find("mssv", "student");
    next.generation = find("lớp", "lop", "class", "generation");
    next.departmentName = find("ban", "department", "dept");
    setMapping(next);
  };

  const goStep2 = () => {
    if (!workbook || !sheetName) {
      setError("Chọn file và Spreadsheet containing data trước");
      return;
    }
    if (excelColumns.length === 0) {
      setError("Column header row không có cột");
      return;
    }
    autoMap(excelColumns);
    setError(null);
    resetCheck();
    setStep(2);
  };

  const goStep3 = () => {
    if (!requiredMapped) {
      setError("Cần map ít nhất Họ tên (*) và Email (*)");
      return;
    }
    setError(null);
    computeClientErrors();
    resetCheck();
    setPreviewPage(1);
    setStep(3);
  };

  const handleCheck = async () => {
    const errs = computeClientErrors();
    if (Object.keys(errs).length > 0) {
      setError(
        "Có lỗi định dạng — xem ô đỏ để biết lỗi cụ thể (họ tên, email, SĐT).",
      );
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const result = await validateMemberImport(
        mappedRows.map((r) => ({
          rowIndex: r.rowIndex,
          fullName: r.fullName,
          email: r.email.trim().toLowerCase(),
          phone: r.phone || undefined,
          studentId: r.studentId || undefined,
          generation: r.generation || undefined,
          departmentName: r.departmentName || undefined,
        })),
      );
      setValidRows(result.valid);
      setInvalidRows(result.invalid);
      setChecked(true);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check data thất bại");
    } finally {
      setChecking(false);
    }
  };

  const handleSaveConfirm = async () => {
    setConfirmSave(false);
    setSaving(true);
    setError(null);
    try {
      const result = await importClubMembers(validRows, { skipInvalid: true });
      setImportDone({ count: result.createdCount });
      onImported(result.createdCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import thất bại");
    } finally {
      setSaving(false);
    }
  };

  const downloadResults = () => {
    const headers = [
      "Row No.",
      "Họ tên",
      "Email",
      "SĐT",
      "MSSV",
      "Lớp",
      "Ban",
      "Result",
      "Errors",
    ];
    const aoa: string[][] = [headers];
    for (const row of validRows) {
      aoa.push([
        String(row.rowIndex ?? ""),
        row.fullName,
        row.email,
        row.phone || "",
        row.studentId || "",
        row.generation || "",
        row.departmentName || "",
        "Successful",
        "",
      ]);
    }
    for (const row of invalidRows) {
      aoa.push([
        String(row.rowIndex),
        row.data.fullName || "",
        row.data.email || "",
        row.data.phone || "",
        row.data.studentId || "",
        row.data.generation || "",
        row.data.departmentName || "",
        "Failed",
        row.errors.join("; "),
      ]);
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "Ket_qua_import_thanh_vien.xlsx");
  };

  const previewPages = Math.max(
    1,
    Math.ceil(mappedRows.length / PREVIEW_PAGE_SIZE),
  );
  const safePreviewPage = Math.min(previewPage, previewPages);
  const previewSlice = mappedRows.slice(
    (safePreviewPage - 1) * PREVIEW_PAGE_SIZE,
    safePreviewPage * PREVIEW_PAGE_SIZE,
  );

  const renderCell = (
    rowIndex: number,
    field: SystemFieldKey,
    value: string | undefined,
  ) => {
    const msg = fieldErrors[rowIndex]?.[field];
    if (msg) {
      return (
        <td
          className="bg-rose-500/10 px-3 py-2 text-rose-700"
          title={msg}
        >
          <span className="font-medium">{value || "Dữ liệu không hợp lệ"}</span>
          <span className="mt-0.5 block text-[11px] font-normal">{msg}</span>
        </td>
      );
    }
    return <td className="px-3 py-2">{value || "—"}</td>;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
          aria-label="Đóng"
          onClick={() => !saving && onClose()}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-card bg-background shadow-extruded"
        >
          <header className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-6">
            <h2 className="font-display text-xl font-extrabold text-accent sm:text-2xl">
              Import data
            </h2>
            <Button
              variant="icon"
              size="sm"
              aria-label="Đóng"
              disabled={saving}
              onClick={onClose}
            >
              <Icon icon={X} size={16} />
            </Button>
          </header>

          <ImportStepper step={step} />

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {error && (
              <p className="mb-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <button
                  type="button"
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-12 text-center transition hover:border-accent hover:bg-accent/10"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                >
                  <Icon icon={Upload} size={32} className="text-accent" />
                  <div>
                    <p className="font-semibold text-accent">
                      {fileName || "Click or drag a file to upload"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Select a data file to import into the system.
                    </p>
                    <p className="mt-2 text-xs italic text-muted">
                      Maximum 1 items, each file must not exceed 5Mb.
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      Spreadsheet containing data{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <Select
                      value={sheetName}
                      onChange={(v) => {
                        setSheetName(v);
                        setMapping({});
                        resetCheck();
                      }}
                      options={
                        sheetNames.length
                          ? sheetNames.map((n) => ({ value: n, label: n }))
                          : [{ value: "", label: "Chọn sheet…" }]
                      }
                      disabled={!workbook}
                      width="full"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      Column header row{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <Select
                      value={String(headerRow)}
                      onChange={(v) => {
                        setHeaderRow(Number(v) || 1);
                        setMapping({});
                        resetCheck();
                      }}
                      options={Array.from(
                        {
                          length: Math.min(
                            10,
                            Math.max(1, sheetMatrix.length),
                          ),
                        },
                        (_, i) => ({
                          value: String(i + 1),
                          label: `Row ${i + 1}`,
                        }),
                      )}
                      disabled={!workbook}
                      width="full"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted">
                    Use a sample dataset for faster and more accurate
                    processing.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent hover:underline"
                    onClick={downloadSampleTemplate}
                  >
                    <Icon icon={Download} size={16} />
                    Download sample file
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Match system fields with Excel columns. Required fields
                  marked *.
                </p>
                <div className="space-y-3">
                  {SYSTEM_FIELDS.map((f) => (
                    <div
                      key={f.key}
                      className="grid items-center gap-3 rounded-2xl bg-black/[0.03] px-4 py-3 sm:grid-cols-[160px_1fr]"
                    >
                      <span className="text-sm font-semibold">
                        {f.label}
                        {f.required ? (
                          <span className="text-red-500"> *</span>
                        ) : null}
                      </span>
                      <Select
                        value={mapping[f.key] ?? ""}
                        onChange={(v) => {
                          setMapping((prev) => ({
                            ...prev,
                            [f.key]: v || undefined,
                          }));
                          resetCheck();
                        }}
                        options={[
                          { value: "", label: "— Skip —" },
                          ...excelColumns.map((c) => ({ value: c, label: c })),
                        ]}
                        width="full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Data list from file</h3>
                  <p className="mt-1 text-sm">
                    Total:{" "}
                    <span className="font-bold text-red-500">
                      {mappedRows.length}
                    </span>
                  </p>
                </div>
                {hasClientFormatErrors && (
                  <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
                    Có ô lỗi (đỏ) kèm mô tả cụ thể. Sửa file/mapping rồi Quay
                    lại bước 2, hoặc sửa Excel rồi upload lại. CHECK DATA bị
                    khóa khi còn lỗi format.
                  </p>
                )}
                <div className="overflow-x-auto rounded-2xl shadow-inset-sm">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="text-left text-xs uppercase text-muted">
                      <tr>
                        <th className="px-3 py-2">Row No.</th>
                        <th className="px-3 py-2">Họ tên</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">SĐT</th>
                        <th className="px-3 py-2">MSSV</th>
                        <th className="px-3 py-2">Lớp</th>
                        <th className="px-3 py-2">Ban</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewSlice.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className="border-t border-black/5 align-top"
                        >
                          <td className="px-3 py-2 text-muted">
                            {row.rowIndex}
                          </td>
                          {renderCell(row.rowIndex!, "fullName", row.fullName)}
                          {renderCell(row.rowIndex!, "email", row.email)}
                          {renderCell(row.rowIndex!, "phone", row.phone)}
                          <td className="px-3 py-2">{row.studentId || "—"}</td>
                          <td className="px-3 py-2">
                            {row.generation || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.departmentName || "—"}
                          </td>
                        </tr>
                      ))}
                      {previewSlice.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-8 text-center text-muted"
                          >
                            Không có dòng dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={safePreviewPage}
                  totalPages={previewPages}
                  onChange={setPreviewPage}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {importDone ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Icon
                      icon={CheckCircle2}
                      size={40}
                      className="text-emerald-600"
                    />
                    <p className="font-display text-xl font-bold">
                      Data imported
                    </p>
                    <p className="text-sm text-muted">
                      Đã lưu thành công {importDone.count} thành viên.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted">
                      Validation result. Data has been checked in the system.
                      Please see the detailed list below.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Icon icon={Download} size={15} />}
                      onClick={downloadResults}
                    >
                      Download results
                    </Button>

                    {invalidRows.length === 0 ? (
                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <Icon icon={CheckCircle2} size={18} />
                        All {validRows.length} rows of data have been
                        successfully validated
                      </p>
                    ) : (
                      <p className="text-sm text-rose-700">
                        {validRows.length} successful · {invalidRows.length}{" "}
                        failed — xem chi tiết lỗi bên dưới.
                      </p>
                    )}

                    <div className="space-y-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5 text-left text-sm font-semibold"
                        onClick={() => setShowSuccess((v) => !v)}
                      >
                        <Icon
                          icon={showSuccess ? ChevronDown : ChevronRight}
                          size={16}
                        />
                        Successful ({validRows.length})
                      </button>
                      {showSuccess && (
                        <ul className="max-h-36 space-y-1 overflow-y-auto rounded-2xl bg-black/[0.03] p-3 text-sm">
                          {validRows.length === 0 && (
                            <li className="text-muted">Không có</li>
                          )}
                          {validRows.slice(0, 40).map((r) => (
                            <li key={r.rowIndex}>
                              Row {r.rowIndex}: {r.fullName} — {r.email}
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5 text-left text-sm font-semibold"
                        onClick={() => setShowFailed((v) => !v)}
                      >
                        <Icon
                          icon={showFailed ? ChevronDown : ChevronRight}
                          size={16}
                        />
                        Failed ({invalidRows.length})
                      </button>
                      {showFailed && (
                        <ul className="max-h-40 space-y-2 overflow-y-auto rounded-2xl bg-black/[0.03] p-3 text-sm">
                          {invalidRows.length === 0 && (
                            <li className="text-muted">Không có</li>
                          )}
                          {invalidRows.map((r) => (
                            <li key={r.rowIndex} className="text-rose-700">
                              <span className="font-semibold">
                                Row {r.rowIndex}
                              </span>
                              {r.data.email ? ` (${r.data.email})` : ""}:{" "}
                              {r.errors.join("; ")}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-4 sm:px-6">
            <div>
              {step === 1 ? (
                <Button
                  variant="secondary"
                  leftIcon={<Icon icon={X} size={15} />}
                  disabled={saving}
                  onClick={onClose}
                >
                  CANCEL
                </Button>
              ) : !importDone ? (
                <Button
                  variant="secondary"
                  leftIcon={<Icon icon={ArrowLeft} size={15} />}
                  disabled={saving || checking}
                  onClick={() => {
                    setError(null);
                    setStep((s) => (s - 1) as Step);
                  }}
                >
                  BACK
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {step === 1 && (
                <Button
                  variant="primary"
                  rightIcon={<Icon icon={ArrowRight} size={15} />}
                  disabled={!workbook || !sheetName}
                  onClick={goStep2}
                >
                  NEXT
                </Button>
              )}
              {step === 2 && (
                <Button
                  variant="primary"
                  rightIcon={<Icon icon={ArrowRight} size={15} />}
                  disabled={!requiredMapped}
                  onClick={goStep3}
                >
                  NEXT
                </Button>
              )}
              {step === 3 && (
                <Button
                  variant="primary"
                  leftIcon={<Icon icon={CircleHelp} size={15} />}
                  disabled={
                    checking ||
                    mappedRows.length === 0 ||
                    hasClientFormatErrors
                  }
                  onClick={() => void handleCheck()}
                >
                  {checking ? "Checking…" : "CHECK DATA"}
                </Button>
              )}
              {step === 4 && !importDone && (
                <Button
                  variant="primary"
                  leftIcon={<Icon icon={Save} size={15} />}
                  disabled={saving || !checked || validRows.length === 0}
                  onClick={() => setConfirmSave(true)}
                >
                  {saving ? "Saving…" : "SAVE DATA"}
                </Button>
              )}
              {importDone && (
                <Button variant="primary" onClick={onClose}>
                  Complete
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>

      <ConfirmDialog
        open={confirmSave}
        title="Save data?"
        message={
          invalidRows.length > 0
            ? "Tồn tại dữ liệu không hợp lệ. Vẫn lưu? (Chỉ các dòng Successful sẽ được import.)"
            : "Bạn có muốn lưu dữ liệu?"
        }
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={saving}
        onClose={() => setConfirmSave(false)}
        onConfirm={() => void handleSaveConfirm()}
      />
    </>
  );
}

export default MemberImportModal;
