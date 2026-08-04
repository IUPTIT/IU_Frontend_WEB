import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  History,
  Mail,
  Pencil,
  Plus,
  Server,
  Trash2,
  Variable,
  Wifi,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import Icon from "../../../../components/ui/Icon";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  duplicateEmailTemplate,
  getEmailHistory,
  getEmailPlaceholders,
  getEmailTemplates,
  getSmtpConfig,
  previewEmail,
  resendEmailHistory,
  saveSmtpConfig,
  testSmtpConnection,
  updateEmailTemplate,
} from "../../../../services/emailService";
import type {
  EmailHistoryItem,
  EmailPlaceholder,
  EmailTemplate,
  EmailTemplateCategory,
  SmtpConfig,
  SmtpEncryption,
} from "../../../../types/email";
import type { BadgeTone } from "../../../../components/ui/Badge";
import { formatDate } from "../../../../utils/formatDate";

type TabId = "smtp" | "templates" | "placeholders" | "history";

const TABS: { id: TabId; label: string; icon: typeof Server; hint: string }[] = [
  { id: "smtp", label: "SMTP", icon: Server, hint: "Máy chủ gửi" },
  { id: "templates", label: "Templates", icon: Mail, hint: "Mẫu thư" },
  { id: "placeholders", label: "Placeholders", icon: Variable, hint: "Biến động" },
  { id: "history", label: "Lịch sử", icon: History, hint: "Đã gửi" },
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
  const [tab, setTab] = useState<TabId>("smtp");
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
              Cấu hình SMTP, mẫu email, placeholder và lịch sử gửi — không cần sửa mã nguồn.
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
        {tab === "smtp" && <SmtpPanel onToast={showToast} />}
        {tab === "templates" && <TemplatesPanel onToast={showToast} />}
        {tab === "placeholders" && <PlaceholdersPanel />}
        {tab === "history" && <HistoryPanel onToast={showToast} />}
      </div>
    </div>
  );
}

function SmtpPanel({ onToast }: { onToast: (m: string) => void }) {
  const [cfg, setCfg] = useState<SmtpConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getSmtpConfig().then(setCfg);
  }, []);

  if (!cfg) {
    return <div className="h-64 animate-pulse rounded-card bg-accent/10 shadow-inset-sm" aria-busy />;
  }

  const save = async () => {
    setSaving(true);
    try {
      await saveSmtpConfig(cfg);
      onToast("Đã lưu cấu hình SMTP.");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setSaving(true);
    try {
      await saveSmtpConfig(cfg);
      const res = await testSmtpConnection();
      onToast(res.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-card bg-gradient-to-br from-background via-background to-accent/[0.06] p-6 sm:p-8 shadow-extruded ring-1 ring-accent/10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <Icon icon={Server} size={18} />
              </span>
              SMTP Configuration
            </h2>
            <p className="text-sm text-muted pl-11">Server gửi mail toàn hệ thống.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-background px-4 py-2.5 shadow-inset-sm">
            <span className="text-sm font-medium text-muted">Bật SMTP</span>
            <Toggle
              checked={cfg.enabled}
              onChange={(enabled) => setCfg({ ...cfg, enabled })}
              aria-label="Bật SMTP"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="neu-field-label">SMTP Host</span>
            <input
              className="neu-input !h-12"
              value={cfg.host}
              onChange={(e) => setCfg({ ...cfg, host: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">SMTP Port</span>
            <input
              type="number"
              className="neu-input !h-12"
              value={cfg.port}
              onChange={(e) => setCfg({ ...cfg, port: Number(e.target.value) || 0 })}
            />
          </label>
          <div>
            <span className="neu-field-label">Encryption</span>
            <Select
              width="full"
              value={cfg.encryption}
              options={[
                { value: "none", label: "None" },
                { value: "ssl", label: "SSL" },
                { value: "tls", label: "TLS" },
              ]}
              onChange={(encryption) => setCfg({ ...cfg, encryption: encryption as SmtpEncryption })}
              triggerClassName="!h-12"
            />
          </div>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Username</span>
            <input
              className="neu-input !h-12"
              value={cfg.username}
              onChange={(e) => setCfg({ ...cfg, username: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Password</span>
            <input
              type="password"
              className="neu-input !h-12"
              value={cfg.password}
              onChange={(e) => setCfg({ ...cfg, password: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Sender Name</span>
            <input
              className="neu-input !h-12"
              value={cfg.senderName}
              onChange={(e) => setCfg({ ...cfg, senderName: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="neu-field-label">Sender Email</span>
            <input
              type="email"
              className="neu-input !h-12"
              value={cfg.senderEmail}
              onChange={(e) => setCfg({ ...cfg, senderEmail: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="neu-field-label">Reply To</span>
            <input
              type="email"
              className="neu-input !h-12"
              value={cfg.replyTo}
              onChange={(e) => setCfg({ ...cfg, replyTo: e.target.value })}
            />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button variant="secondary" disabled={saving} onClick={() => void test()} leftIcon={<Icon icon={Wifi} size={16} />}>
            Test Connection
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void save()} leftIcon={<Icon icon={CheckCircle2} size={16} />}>
            Lưu cấu hình
          </Button>
        </div>
      </section>

      <aside className="space-y-4">
        <div
          className={`rounded-card p-5 shadow-extruded ring-1 transition-colors ${
            cfg.enabled
              ? "bg-gradient-to-br from-emerald-500/20 to-background ring-emerald-500/25"
              : "bg-gradient-to-br from-rose-500/15 to-background ring-rose-500/20"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trạng thái</p>
          <p className={`mt-2 font-display text-2xl font-extrabold ${cfg.enabled ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500"}`}>
            {cfg.enabled ? "Đang bật" : "Đang tắt"}
          </p>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            {cfg.enabled
              ? "Hệ thống sẵn sàng gửi thư qua SMTP đã cấu hình."
              : "Bật SMTP để các nút gửi email hoạt động."}
          </p>
        </div>
        <div className="rounded-card bg-background p-5 shadow-extruded ring-1 ring-black/5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Khuyến nghị</p>
          <ul className="text-xs text-muted space-y-1.5 list-disc pl-4">
            <li>Port 587 + TLS cho Gmail và hầu hết nhà cung cấp</li>
            <li>Dùng App Password thay mật khẩu tài khoản</li>
            <li>Kiểm tra kết nối trước khi gửi hàng loạt</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function TemplatesPanel({ onToast }: { onToast: (m: string) => void }) {
  const [list, setList] = useState<EmailTemplate[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<null | { mode: "create" | "edit"; draft: typeof EMPTY_TPL; id?: string }>(null);
  const [preview, setPreview] = useState<{ subject: string; bodyHtml: string } | null>(null);
  const [filterCat, setFilterCat] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
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

function HistoryPanel({ onToast }: { onToast: (m: string) => void }) {
  const [rows, setRows] = useState<EmailHistoryItem[]>([]);
  const [detail, setDetail] = useState<EmailHistoryItem | null>(null);

  const load = useCallback(async () => {
    setRows(await getEmailHistory());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-card shadow-extruded ring-1 ring-accent/10">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th className="data-table-th px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide">
                  Người nhận
                </th>
                <th className="data-table-th px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide">
                  Subject
                </th>
                <th className="data-table-th px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Template
                </th>
                <th className="data-table-th px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Thời gian
                </th>
                <th className="data-table-th px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="data-table-th px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table-td px-4 py-16 text-center text-muted">
                    <span className="inline-flex flex-col items-center gap-2">
                      <Icon icon={Mail} size={28} className="text-accent/50" />
                      Chưa có lịch sử gửi.
                    </span>
                  </td>
                </tr>
              ) : (
                rows.map((h) => (
                  <tr key={h.id}>
                    <td className="data-table-td px-4 py-3 text-left">
                      <p className="font-medium">{h.recipientName}</p>
                      <p className="text-xs text-muted">{h.recipientEmail}</p>
                    </td>
                    <td className="data-table-td px-3 py-3 text-left max-w-[220px] truncate">{h.subject}</td>
                    <td className="data-table-td px-3 py-3 text-center text-muted">{h.templateName ?? "—"}</td>
                    <td className="data-table-td px-3 py-3 text-center text-muted">{formatDate(h.sentAt)}</td>
                    <td className="data-table-td px-3 py-3 text-center">
                      <Badge tone={h.status === "sent" ? "success" : h.status === "failed" ? "danger" : "warning"}>
                        {h.status}
                      </Badge>
                    </td>
                    <td className="data-table-td px-3 py-3">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="!h-9" onClick={() => setDetail(h)}>
                          Xem
                        </Button>
                        <Button
                          variant="soft"
                          size="sm"
                          className="!h-9"
                          onClick={async () => {
                            await resendEmailHistory(h.id);
                            onToast("Đã gửi lại email.");
                            void load();
                          }}
                        >
                          Gửi lại
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Nội dung đã gửi" size="md">
        {detail && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted">Tới:</span> {detail.recipientName} &lt;{detail.recipientEmail}&gt;
            </p>
            <p className="font-semibold">{detail.subject}</p>
            {detail.error && <p className="text-rose-500">{detail.error}</p>}
            <div
              className="rounded-2xl bg-background p-4 shadow-inset-sm"
              dangerouslySetInnerHTML={{ __html: detail.body }}
            />
          </div>
        )}
      </Modal>
    </section>
  );
}

export default EmailConfigurationPage;
