import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  Server,
  Settings2,
  Trash2,
  Variable,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import Icon from "../../../../components/ui/Icon";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  duplicateEmailTemplate,
  getEmailAutomationRules,
  getEmailPlaceholders,
  getEmailTemplates,
  previewEmail,
  restoreEmailAutomationDefaults,
  updateEmailAutomationRule,
  updateEmailTemplate,
} from "../../../../services/emailService";
import type {
  AutomationTiming,
  AutomationTimingUnit,
  EmailAutomationRule,
  EmailPlaceholder,
  EmailTemplate,
  EmailTemplateCategory,
} from "../../../../types/email";
import type { BadgeTone } from "../../../../components/ui/Badge";

type TabId = "templates" | "automation" | "placeholders" | "smtp";

const TABS: { id: TabId; label: string; icon: typeof Server; hint: string }[] = [
  { id: "templates", label: "Templates", icon: Mail, hint: "Mẫu thư" },
  { id: "automation", label: "Gửi tự động", icon: Settings2, hint: "Quy tắc" },
  { id: "placeholders", label: "Placeholders", icon: Variable, hint: "Biến động" },
  { id: "smtp", label: "SMTP", icon: Server, hint: "Máy chủ (.env)" },
];

const CATEGORY_OPTS = [
  { value: "recruitment", label: "Recruitment" },
  { value: "training", label: "Training" },
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
];

const CAT_TONE: Record<string, BadgeTone> = {
  recruitment: "violet",
  training: "success",
  general: "info",
  event: "warning",
};

const EMPTY_TPL: {
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  body: string;
  status: "active" | "inactive";
} = {
  name: "",
  category: "recruitment",
  subject: "",
  body: "",
  status: "active",
};

function EmailConfigurationPage() {
  const [tab, setTab] = useState<TabId>("templates");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 animate-fade-in">
      {/* Soft hero */}
      <header className="relative overflow-hidden rounded-card bg-gradient-to-br from-accent/20 via-sky-500/10 to-background p-6 sm:p-8 shadow-extruded ring-1 ring-accent/15">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-sky-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-accent/25 text-accent shadow-extruded-sm ring-1 ring-accent/30">
            <Icon icon={Mail} size={28} />
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Hệ thống email
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Email Configuration
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto sm:mx-0">
              Mẫu thư và quy tắc gửi tự động (API thật). SMTP cấu hình trên
              server qua biến môi trường — không lưu giả lập trên trình duyệt.
            </p>
          </div>
        </div>
      </header>

      {toast && (
        <p
          className="mx-auto max-w-xl rounded-2xl bg-emerald-500/15 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20"
          role="status"
        >
          {toast}
        </p>
      )}

      {/* Soft pill tabs — centered */}
      <nav className="flex justify-center" aria-label="Email sections">
        <div className="inline-flex max-w-full flex-wrap justify-center gap-1.5 rounded-[1.75rem] bg-background/90 p-2 shadow-inset-sm ring-1 ring-black/5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`group inline-flex min-w-[7.5rem] flex-col items-center gap-0.5 rounded-2xl px-4 py-2.5 transition-all duration-200 ease-in-out ${
                  active
                    ? "bg-accent text-white shadow-extruded-sm scale-[1.02]"
                    : "text-muted hover:bg-accent/10 hover:text-accent"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                  <Icon icon={t.icon} size={16} />
                  {t.label}
                </span>
                <span className={`text-[10px] font-medium ${active ? "text-white/80" : "text-muted/80"}`}>
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-h-[320px]">
        {tab === "smtp" && <SmtpInfoPanel />}
        {tab === "templates" && <TemplatesPanel onToast={showToast} />}
        {tab === "automation" && <AutomationPanel onToast={showToast} />}
        {tab === "placeholders" && <PlaceholdersPanel />}
      </div>
    </div>
  );
}

function timingLabel(rule: EmailAutomationRule): string {
  if (rule.timing === "immediate") return "Ngay khi sự kiện";
  const unit = rule.timingUnit === "hours" ? "giờ" : "ngày";
  if (rule.timing === "delay_after_event") {
    return `Sau ${rule.timingValue} ${unit} kể từ sự kiện`;
  }
  if (rule.timing === "before_slot") {
    return `Trước slot ${rule.timingValue} ${unit}`;
  }
  if (rule.timing === "before_deadline") {
    return `Trước hạn ${rule.timingValue} ${unit}`;
  }
  return rule.timing;
}

const TIMING_OPTS: { value: AutomationTiming; label: string }[] = [
  { value: "immediate", label: "Ngay khi sự kiện" },
  { value: "delay_after_event", label: "Sau sự kiện (delay)" },
  { value: "before_deadline", label: "Trước hạn đăng ký" },
  { value: "before_slot", label: "Trước giờ PV (slot)" },
];

const UNIT_OPTS: { value: AutomationTimingUnit; label: string }[] = [
  { value: "days", label: "Ngày" },
  { value: "hours", label: "Giờ" },
];

function AutomationPanel({ onToast }: { onToast: (m: string) => void }) {
  const [rules, setRules] = useState<EmailAutomationRule[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailAutomationRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([
        getEmailAutomationRules(),
        getEmailTemplates(),
      ]);
      setRules(r);
      setTemplates(t.filter((x) => x.status === "active" && x.slug));
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Không tải được quy tắc.");
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const templateOpts = useMemo(
    () =>
      templates.map((t) => ({
        value: t.slug || t.id,
        label: `${t.name} (${t.slug})`,
      })),
    [templates],
  );

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateEmailAutomationRule(editing.id, {
        name: editing.name,
        enabled: editing.enabled,
        templateSlug: editing.templateSlug,
        timing: editing.timing,
        timingValue: editing.timingValue,
        timingUnit: editing.timingUnit,
        params: editing.params,
      });
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
      onToast("Đã lưu quy tắc gửi tự động.");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (rule: EmailAutomationRule, enabled: boolean) => {
    try {
      const updated = await updateEmailAutomationRule(rule.id, { enabled });
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      onToast(enabled ? `Đã bật: ${rule.name}` : `Đã tắt: ${rule.name}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Cập nhật thất bại.");
    }
  };

  const confirmRestore = async () => {
    setRestoring(true);
    try {
      const next = await restoreEmailAutomationDefaults();
      setRules(next);
      setRestoreOpen(false);
      onToast("Đã khôi phục quy tắc mặc định IU CLUB.");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Khôi phục thất bại.");
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-card bg-accent/10 shadow-inset-sm" aria-busy />
    );
  }

  return (
    <>
      <ConfirmDialog
        open={restoreOpen}
        title="Khôi phục mặc định?"
        message="Toàn bộ quy tắc gửi tự động sẽ về seed IU CLUB (ghi đè cấu hình hiện tại)."
        confirmLabel="Khôi phục"
        tone="danger"
        loading={restoring}
        onConfirm={() => void confirmRestore()}
        onClose={() => setRestoreOpen(false)}
      />

      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
                <Icon icon={Settings2} size={18} />
              </span>
              Quy tắc gửi tự động
            </h2>
            <p className="text-sm text-muted pl-11 max-w-2xl">
              Bật/tắt, chọn template và thời điểm gửi theo sự kiện. P0 lưu cấu
              hình; P1 jobs sẽ đọc các quy tắc này (không còn hardcode số ngày).
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon icon={RotateCcw} size={15} />}
            onClick={() => setRestoreOpen(true)}
          >
            Khôi phục mặc định
          </Button>
        </div>

        <div className="overflow-x-auto rounded-card shadow-extruded ring-1 ring-black/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Sự kiện</th>
                <th className="px-4 py-3">Bật</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Thời điểm</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{rule.name}</p>
                    <p className="text-xs text-muted font-mono">{rule.eventKey}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={rule.enabled}
                      onChange={(v) => void toggleEnabled(rule, v)}
                      aria-label={`Bật ${rule.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded-lg bg-black/5 px-2 py-1 text-xs">
                      {rule.templateSlug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted">{timingLabel(rule)}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="icon"
                      size="sm"
                      aria-label={`Sửa ${rule.name}`}
                      onClick={() => setEditing({ ...rule, params: { ...rule.params } })}
                    >
                      <Icon icon={Pencil} size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing ? `Sửa: ${editing.name}` : "Sửa quy tắc"}
        description={
          editing
            ? `eventKey: ${editing.eventKey} · ruleKey: ${editing.ruleKey}`
            : undefined
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" disabled={saving} onClick={() => setEditing(null)}>
              Huỷ
            </Button>
            <Button variant="primary" disabled={saving} onClick={() => void saveEdit()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase text-muted">Tên hiển thị</span>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
              <span className="text-sm font-medium">Bật gửi tự động</span>
              <Toggle
                checked={editing.enabled}
                onChange={(enabled) => setEditing({ ...editing, enabled })}
                aria-label="Bật quy tắc"
              />
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase text-muted">Template</span>
              <Select
                value={editing.templateSlug}
                onChange={(templateSlug) => setEditing({ ...editing, templateSlug })}
                options={
                  templateOpts.length
                    ? templateOpts
                    : [{ value: editing.templateSlug, label: editing.templateSlug }]
                }
                width="full"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase text-muted">Thời điểm</span>
              <Select
                value={editing.timing}
                onChange={(timing) =>
                  setEditing({
                    ...editing,
                    timing: timing as AutomationTiming,
                    timingValue:
                      timing === "immediate" ? 0 : Math.max(1, editing.timingValue || 1),
                  })
                }
                options={TIMING_OPTS}
                width="full"
              />
            </label>
            {editing.timing !== "immediate" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase text-muted">Giá trị</span>
                  <Input
                    type="number"
                    min={1}
                    value={String(editing.timingValue)}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        timingValue: Number(e.target.value) || 0,
                      })
                    }
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase text-muted">Đơn vị</span>
                  <Select
                    value={editing.timingUnit}
                    onChange={(timingUnit) =>
                      setEditing({
                        ...editing,
                        timingUnit: timingUnit as AutomationTimingUnit,
                      })
                    }
                    options={UNIT_OPTS}
                    width="full"
                  />
                </label>
              </div>
            )}
            {editing.eventKey === "book_slot_remind" && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase text-muted">
                  Hạn đăng ký lịch (ngày sau Pass)
                </span>
                <Input
                  type="number"
                  min={1}
                  value={String(
                    Number(editing.params?.bookingWindowDays ?? 7),
                  )}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      params: {
                        ...editing.params,
                        bookingWindowDays: Number(e.target.value) || 7,
                      },
                    })
                  }
                />
                <span className="text-xs text-muted">
                  Phải ≥ số ngày nhắc (timing delay).
                </span>
              </label>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function SmtpInfoPanel() {
  return (
    <section className="neu-card !p-6 space-y-4 max-w-2xl">
      <h2 className="font-display text-lg font-bold">Cấu hình SMTP (server)</h2>
      <p className="text-sm text-muted">
        Gửi email thật dùng SMTP/SendGrid cấu hình trên Backend (
        <code className="text-accent">.env</code>
        ). Không còn lưu SMTP giả trên trình duyệt.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        <li>
          Biến môi trường BE: <code>SMTP_HOST</code>, <code>SMTP_PORT</code>,{" "}
          <code>SMTP_USER</code>, <code>SMTP_PASS</code> (hoặc SendGrid API key)
        </li>
        <li>
          Templates và quy tắc tự động ở các tab còn lại đã nối API{" "}
          <code>/admin/email-*</code>
        </li>
        <li>Nút gửi thư trong tuyển dụng / training gọi API gửi thật</li>
      </ul>
      <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
        Lịch sử gửi chi tiết sẽ bổ sung khi BE có endpoint lịch sử — hiện có thể
        theo dõi qua log server / nhà cung cấp mail.
      </p>
    </section>
  );
}

function TemplatesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<EmailTemplate[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<null | { mode: "create" | "edit"; draft: typeof EMPTY_TPL; id?: string }>(null);
  const [preview, setPreview] = useState<{ subject: string; bodyHtml: string } | null>(null);
  const [filterCat, setFilterCat] = useState("");

  // Đổi bộ lọc danh mục → bật lại skeleton (adjust state during render)
  const [prevFilterCat, setPrevFilterCat] = useState(filterCat);
  if (filterCat !== prevFilterCat) {
    setPrevFilterCat(filterCat);
    setLoading(true);
  }

  const load = useCallback(async () => {
    try {
      setList(await getEmailTemplates(filterCat as EmailTemplateCategory | ""));
    } finally {
      setLoading(false);
    }
  }, [filterCat]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => setEditor({ mode: "create", draft: { ...EMPTY_TPL } });
  const openEdit = (t: EmailTemplate) =>
    setEditor({
      mode: "edit",
      id: t.id,
      draft: {
        name: t.name,
        category: t.category,
        subject: t.subject,
        body: t.body,
        status: t.status,
      },
    });

  const saveEditor = async () => {
    if (!editor) return;
    const d = editor.draft;
    if (!d.name.trim() || !d.subject.trim() || !d.body.trim()) {
      onToast("Điền đủ tên, subject và nội dung.");
      return;
    }
    if (editor.mode === "create") {
      await createEmailTemplate(d);
      onToast("Đã tạo template.");
    } else if (editor.id) {
      await updateEmailTemplate(editor.id, d);
      onToast("Đã cập nhật template.");
    }
    setEditor(null);
    void load();
  };

  return (
    <section className="space-y-5">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa template"
        message={
          deleteTarget ? (
            <>
              Xóa template <b>"{deleteTarget.name}"</b>? Hành động này không thể hoàn tác.
            </>
          ) : undefined
        }
        confirmLabel="Xóa template"
        tone="danger"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteEmailTemplate(deleteTarget.id);
          onToast("Đã xóa template.");
          setDeleteTarget(null);
          void load();
        }}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={filterCat}
          options={[{ value: "", label: "Tất cả loại" }, ...CATEGORY_OPTS]}
          onChange={setFilterCat}
          className="min-w-[180px]"
        />
        <Button variant="primary" leftIcon={<Icon icon={Plus} size={16} />} onClick={openCreate}>
          Thêm template
        </Button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-card bg-accent/10" aria-busy />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((t) => (
            <article
              key={t.id}
              className="group flex flex-col rounded-card bg-gradient-to-br from-background to-accent/[0.07] p-5 shadow-extruded ring-1 ring-accent/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-extruded-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-inset-sm">
                  <Icon icon={Mail} size={20} />
                </span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  <Badge tone={t.status === "active" ? "success" : "muted"}>{t.status}</Badge>
                  <Badge tone={CAT_TONE[t.category] ?? "accent"}>{t.category}</Badge>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{t.name}</h3>
              <p className="mt-1 text-sm text-muted line-clamp-2">{t.subject}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                <Button
                  variant="icon"
                  size="sm"
                  aria-label="Preview"
                  onClick={async () => {
                    const res = await previewEmail({ subject: t.subject, body: t.body });
                    setPreview(res);
                  }}
                >
                  <Icon icon={Eye} size={16} />
                </Button>
                <Button variant="icon" size="sm" aria-label="Sửa" onClick={() => openEdit(t)}>
                  <Icon icon={Pencil} size={16} />
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  aria-label="Duplicate"
                  onClick={async () => {
                    await duplicateEmailTemplate(t.id);
                    onToast("Đã nhân bản template.");
                    void load();
                  }}
                >
                  <Icon icon={Copy} size={16} />
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  className="!h-9"
                  onClick={async () => {
                    await updateEmailTemplate(t.id, {
                      status: t.status === "active" ? "inactive" : "active",
                    });
                    void load();
                  }}
                >
                  {t.status === "active" ? "Tắt" : "Bật"}
                </Button>
                <Button
                  variant="danger-icon"
                  size="sm"
                  aria-label="Xóa"
                  onClick={() => setDeleteTarget(t)}
                >
                  <Icon icon={Trash2} size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        title={editor?.mode === "create" ? "Thêm Email Template" : "Sửa Email Template"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={() => void saveEditor()}>
              Lưu
            </Button>
          </>
        }
      >
        {editor && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="neu-field-label">Tên Template</span>
                <input
                  className="neu-input !h-11"
                  value={editor.draft.name}
                  onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft, name: e.target.value } })}
                />
              </label>
              <div>
                <span className="neu-field-label">Loại</span>
                <Select
                  width="full"
                  value={editor.draft.category}
                  options={CATEGORY_OPTS}
                  onChange={(category) =>
                    setEditor({
                      ...editor,
                      draft: { ...editor.draft, category: category as EmailTemplateCategory },
                    })
                  }
                />
              </div>
              <label className="block space-y-1.5">
                <span className="neu-field-label">Subject</span>
                <input
                  className="neu-input !h-11"
                  value={editor.draft.subject}
                  onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft, subject: e.target.value } })}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="neu-field-label">Nội dung</span>
                <textarea
                  className="neu-input !h-auto min-h-[200px] py-3 font-mono text-sm"
                  value={editor.draft.body}
                  onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft, body: e.target.value } })}
                />
              </label>
            </div>
            <PlaceholderInsertList
              category={editor.draft.category}
              onInsert={(token) =>
                setEditor({
                  ...editor,
                  draft: { ...editor.draft, body: `${editor.draft.body}${token}` },
                })
              }
            />
          </div>
        )}
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Preview template" size="md">
        {preview && (
          <div className="space-y-3">
            <p className="font-semibold">{preview.subject}</p>
            <div
              className="rounded-2xl bg-background p-4 shadow-inset-sm text-sm"
              dangerouslySetInnerHTML={{ __html: preview.bodyHtml }}
            />
          </div>
        )}
      </Modal>
    </section>
  );
}

function PlaceholderInsertList({
  category,
  onInsert,
}: {
  category: EmailTemplateCategory;
  onInsert: (token: string) => void;
}) {
  const [items, setItems] = useState<EmailPlaceholder[]>([]);
  useEffect(() => {
    void getEmailPlaceholders(category).then(setItems);
  }, [category]);
  return (
    <aside className="space-y-2">
      <p className="neu-field-label">Placeholder</p>
      <ul className="max-h-80 space-y-1 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
        {items.map((p) => (
          <li key={p.key}>
            <button
              type="button"
              className="w-full rounded-xl px-2 py-2 text-left text-xs transition-colors hover:bg-accent/10"
              onClick={() => onInsert(`{{${p.key}}}`)}
            >
              <span className="font-mono text-accent">{`{{${p.key}}}`}</span>
              <span className="block text-muted">{p.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PlaceholdersPanel() {
  const [items, setItems] = useState<EmailPlaceholder[]>([]);
  useEffect(() => {
    void getEmailPlaceholders().then(setItems);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, EmailPlaceholder[]>();
    for (const p of items) {
      for (const c of p.categories) {
        if (!map.has(c)) map.set(c, []);
        map.get(c)!.push(p);
      }
    }
    return map;
  }, [items]);

  return (
    <section className="space-y-5">
      <p className="text-center text-sm text-muted max-w-lg mx-auto">
        Thư viện biến động. Chèn token vào nội dung khi chỉnh sửa template.
      </p>
      {[...grouped.entries()].map(([cat, list]) => (
        <div
          key={cat}
          className="rounded-card bg-gradient-to-br from-background to-violet-500/[0.07] p-5 sm:p-6 shadow-extruded ring-1 ring-violet-500/15 space-y-4"
        >
          <h3 className="font-display text-lg font-bold capitalize flex items-center gap-2">
            <Badge tone={CAT_TONE[cat] ?? "accent"}>{cat}</Badge>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <div
                key={`${cat}-${p.key}`}
                className="rounded-2xl bg-background/90 px-4 py-3.5 shadow-extruded-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
              >
                <p className="font-mono text-sm font-semibold text-accent">{`{{${p.key}}}`}</p>
                <p className="text-sm font-medium mt-1">{p.label}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{p.description}</p>
                <p className="text-[11px] text-muted/80 mt-2 rounded-full bg-accent/8 px-2.5 py-0.5 inline-block">
                  VD: {p.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default EmailConfigurationPage;
