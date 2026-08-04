import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Send } from "lucide-react";
import Button from "../../../../components/ui/Button";
import ExportDataModal, { type ExportColumnDef } from "../../../../components/ui/ExportDataModal";
import FilterMenu from "../../../../components/ui/FilterMenu";
import Icon from "../../../../components/ui/Icon";
import MetricCard from "../../../../components/ui/MetricCard";
import Pagination from "../../../../components/ui/Pagination";
import Select from "../../../../components/ui/Select";
import SendEmailModal from "../../../../components/ui/SendEmailModal";
import { usePortalUi } from "../../../../context/PortalUiContext";
import useCountUp from "../../../../hooks/useCountUp";
import {
  getTrainees,
  getTrainingReviewSummary,
  issueCertificates,
  type TrainingReviewSummary,
} from "../../../../services/trainingService";
import type { Trainee, TraineeEvalStatus } from "../../../../types/training";
import type { EmailRecipient } from "../../../../types/email";
import { traineeToEmailRecipient } from "../../../../utils/emailRecipients";

const PAGE_SIZE = 5;

type QuickFilter = "all" | "qualified" | "failed";

type DraftFilter = {
  departmentId: string;
  evalStatus: TraineeEvalStatus | "";
};

const EMPTY: DraftFilter = { departmentId: "", evalStatus: "" };

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function evalLabel(s?: TraineeEvalStatus) {
  switch (s) {
    case "qualified":
      return "Đủ điều kiện";
    case "certified":
      return "Đã cấp CN";
    case "failed":
      return "Chưa đạt";
    case "studying":
    default:
      return "Đang học";
  }
}

function EvalBadge({ status }: { status?: TraineeEvalStatus }) {
  const s = status ?? "studying";
  const cls =
    s === "qualified"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : s === "certified"
        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
        : s === "failed"
          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
          : "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {evalLabel(s)}
    </span>
  );
}

function StatCard({
  title,
  value,
  suffix,
  hint,
  tone,
}: {
  title: string;
  value: number;
  suffix?: string;
  hint?: string;
  tone?: "default" | "danger" | "success";
}) {
  const n = useCountUp(value);
  const metricTone = tone === "danger" ? "rose" : tone === "success" ? "emerald" : "accent";
  return (
    <MetricCard
      label={title}
      value={
        <>
          {n}
          {suffix}
        </>
      }
      hint={hint}
      tone={metricTone}
    />
  );
}

function TrainingReviewPage() {
  const { search } = usePortalUi();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [summary, setSummary] = useState<TrainingReviewSummary>({
    totalTrainees: 0,
    completionRate: 0,
    needsAction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [draft, setDraft] = useState<DraftFilter>(EMPTY);
  const [applied, setApplied] = useState<DraftFilter>(EMPTY);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([getTrainees(), getTrainingReviewSummary()]);
      setTrainees(list);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of trainees) map.set(t.departmentId, t.departmentName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [trainees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainees.filter((t) => {
      if (q && !t.fullName.toLowerCase().includes(q) && !t.email.toLowerCase().includes(q)) return false;
      if (quick === "qualified" && t.evalStatus !== "qualified" && t.evalStatus !== "certified") return false;
      if (quick === "failed" && t.evalStatus !== "failed") return false;
      if (applied.departmentId && t.departmentId !== applied.departmentId) return false;
      if (applied.evalStatus && t.evalStatus !== applied.evalStatus) return false;
      return true;
    });
  }, [trainees, search, quick, applied]);

  useEffect(() => {
    setPage(1);
  }, [search, quick, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportColumns: ExportColumnDef<Trainee>[] = useMemo(
    () => [
      { id: "fullName", label: "Họ tên", getValue: (r) => r.fullName, defaultSelected: true },
      { id: "email", label: "Email", getValue: (r) => r.email, defaultSelected: true },
      {
        id: "department",
        label: "Ban",
        getValue: (r) => r.departmentName,
        getFilterKey: (r) => r.departmentId,
        filterOptions: departments.map((d) => ({ value: d.id, label: d.name })),
        defaultSelected: true,
      },
      {
        id: "avgScore",
        label: "Điểm TB",
        getValue: (r) => (r.avgScore != null ? String(r.avgScore) : ""),
        defaultSelected: true,
      },
      {
        id: "progress",
        label: "Tiến độ",
        getValue: (r) => `${r.sessionsDone ?? 0}/${r.sessionsTotal ?? 0}`,
        defaultSelected: true,
      },
      {
        id: "status",
        label: "Trạng thái",
        getValue: (r) => evalLabel(r.evalStatus),
        getFilterKey: (r) => r.evalStatus ?? "studying",
        filterOptions: [
          { value: "studying", label: "Đang học" },
          { value: "qualified", label: "Đủ điều kiện" },
          { value: "certified", label: "Đã cấp CN" },
          { value: "failed", label: "Chưa đạt" },
        ],
        defaultSelected: true,
      },
    ],
    [departments],
  );

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleIssue = async () => {
    const ids =
      selected.size > 0
        ? [...selected]
        : filtered.filter((t) => t.evalStatus === "qualified").map((t) => t.id);
    if (ids.length === 0) {
      showToast("Không có học viên đủ điều kiện để cấp chứng nhận.");
      return;
    }
    const res = await issueCertificates(ids);
    await load();
    setSelected(new Set());
    showToast(`Đã cấp chứng nhận cho ${res.issued} học viên.`);
  };

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Đánh giá &amp; Hoàn thành
          </h1>
          <p className="mt-2 text-muted">Tổng kết đợt training — theo dõi tiến độ tân binh.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!h-11"
            onClick={() => setExportOpen(true)}
            leftIcon={<Icon icon={Download} size={16} />}
          >
            Xuất báo cáo
          </Button>
          <Button
            variant="soft"
            size="sm"
            className="!h-11"
            leftIcon={<Icon icon={Send} size={16} />}
            onClick={() => {
              const list =
                selected.size > 0
                  ? trainees.filter((t) => selected.has(t.id))
                  : filtered;
              if (list.length === 0) {
                showToast("Chọn học viên hoặc để trống để gửi theo bộ lọc hiện tại.");
                return;
              }
              setEmailRecipients(list.map(traineeToEmailRecipient));
              setEmailOpen(true);
            }}
          >
            Gửi email
          </Button>
          <Button variant="primary" size="sm" className="!h-11" onClick={() => void handleIssue()}>
            Cấp chứng nhận hàng loạt
          </Button>
        </div>
      </section>

      {toast && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent" role="status">
          {toast}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Tổng tân binh" value={summary.totalTrainees} />
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={summary.completionRate}
          suffix="%"
          hint="+5% so với kỳ trước"
          tone="success"
        />
        <StatCard
          title="Cần xử lý"
          value={summary.needsAction}
          hint="Chưa đạt / Bỏ cuộc"
          tone="danger"
        />
      </div>

      <section className="neu-card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Danh sách đánh giá</h2>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all" as const, label: "Tất cả" },
                { id: "qualified" as const, label: "Đủ điều kiện" },
                { id: "failed" as const, label: "Chưa đạt" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setQuick(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  quick === f.id
                    ? "bg-accent/20 text-accent shadow-inset-sm"
                    : "text-muted shadow-extruded-sm hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
            <FilterMenu
              activeCount={(applied.departmentId ? 1 : 0) + (applied.evalStatus ? 1 : 0)}
              onApply={() => setApplied(draft)}
              onReset={() => {
                setDraft(EMPTY);
                setApplied(EMPTY);
              }}
            >
              <div>
                <span className="neu-field-label">Ban</span>
                <Select
                  width="full"
                  value={draft.departmentId}
                  options={[
                    { value: "", label: "Tất cả" },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  onChange={(departmentId) => setDraft({ ...draft, departmentId })}
                />
              </div>
              <div>
                <span className="neu-field-label">Trạng thái</span>
                <Select
                  width="full"
                  value={draft.evalStatus}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "studying", label: "Đang học" },
                    { value: "qualified", label: "Đủ điều kiện" },
                    { value: "certified", label: "Đã cấp CN" },
                    { value: "failed", label: "Chưa đạt" },
                  ]}
                  onChange={(evalStatus) =>
                    setDraft({ ...draft, evalStatus: evalStatus as TraineeEvalStatus | "" })
                  }
                />
              </div>
            </FilterMenu>
          </div>
        </div>

        {loading ? (
          <div className="h-56 animate-pulse bg-accent/5" aria-busy="true" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-accent/15 text-sm text-accent">
                  <th className="px-4 py-3.5 w-10" />
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">Học viên</th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">Ban</th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Điểm TB
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide">Tiến độ</th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Trạng thái
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-xs uppercase tracking-wide text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted">
                      Không có học viên phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paged.map((t) => {
                    const done = t.sessionsDone ?? 0;
                    const total = t.sessionsTotal ?? 10;
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <tr key={t.id} className="hover:bg-accent/[0.04]">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="accent-accent"
                            checked={selected.has(t.id)}
                            onChange={() => toggleOne(t.id)}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                              {initials(t.fullName)}
                            </span>
                            <div>
                              <p className="font-semibold">{t.fullName}</p>
                              <p className="text-xs text-muted">{t.id.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm">{t.departmentName}</td>
                        <td className="px-3 py-4 text-center font-bold">
                          {t.avgScore != null ? t.avgScore.toFixed(1) : "--"}
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="h-2 rounded-full bg-background shadow-inset-sm overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted">
                              {done}/{total} buổi
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <EvalBadge status={t.evalStatus} />
                        </td>
                        <td className="px-3 py-4 text-center">
                          <button type="button" className="text-sm font-medium text-accent hover:underline">
                            Xem hồ sơ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-4">
          <p className="text-sm text-muted">
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} trên{" "}
            {filtered.length} tân binh
          </p>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>

      <ExportDataModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Xuất báo cáo đào tạo"
        description="Chọn cột và lọc trạng thái / ban trước khi tải:"
        columns={exportColumns}
        rows={filtered}
        filenameBase="danh_gia_training"
        onExported={(n) => showToast(`Đã tải xuống ${n} dòng (CSV).`)}
      />

      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipients={emailRecipients}
        module="training-review"
        category="training"
        preferredTemplateId="tpl-training-complete"
        title="Gửi email training"
        onSent={(sent) => showToast(`Đã gửi email tới ${sent} học viên.`)}
      />
    </>
  );
}

export default TrainingReviewPage;
