import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, Send, TestTube2 } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";
import Modal from "./Modal";
import Select from "./Select";
import {
  getEmailPlaceholders,
  getEmailTemplate,
  getEmailTemplates,
  previewEmail,
  sendEmails,
  sendTestEmail,
} from "../../services/emailService";
import type {
  EmailPlaceholder,
  EmailRecipient,
  EmailTemplate,
  EmailTemplateCategory,
} from "../../types/email";

type Props = {
  open: boolean;
  onClose: () => void;
  recipients: EmailRecipient[];
  module: string;
  /** Lọc template theo category */
  category?: EmailTemplateCategory | "";
  /** Prefill template id nếu biết */
  preferredTemplateId?: string;
  title?: string;
  onSent?: (sent: number) => void;
};

/**
 * Màn gửi email động — chọn template, sửa subject/body lần gửi, preview, test, send.
 * Không ghi đè template gốc.
 */
function SendEmailModal({
  open,
  onClose,
  recipients,
  module,
  category = "",
  preferredTemplateId,
  title = "Gửi email",
  onSent,
}: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [placeholders, setPlaceholders] = useState<EmailPlaceholder[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<{ subject: string; bodyHtml: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [showTest, setShowTest] = useState(false);

  const sampleData = useMemo(() => {
    const first = recipients[0];
    return first?.data ?? {};
  }, [recipients]);

  const loadMeta = useCallback(async () => {
    setLoading(true);
    try {
      const [tpls, ph] = await Promise.all([
        getEmailTemplates(category || undefined),
        getEmailPlaceholders(category || undefined),
      ]);
      const active = tpls.filter((t) => t.status === "active");
      setTemplates(active.length ? active : tpls);
      setPlaceholders(ph);
      const preferred =
        (preferredTemplateId && tpls.find((t) => t.id === preferredTemplateId)) ||
        active[0] ||
        tpls[0];
      if (preferred) {
        setTemplateId(preferred.id);
        setSubject(preferred.subject);
        setBody(preferred.body);
      } else {
        setTemplateId("");
        setSubject("");
        setBody("");
      }
    } finally {
      setLoading(false);
    }
  }, [category, preferredTemplateId]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setToast(null);
    setPreviewHtml(null);
    setShowTest(false);
    void loadMeta();
  }, [open, loadMeta]);

  const onPickTemplate = async (id: string) => {
    setTemplateId(id);
    if (!id) return;
    const tpl = await getEmailTemplate(id);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  const insertPlaceholder = (key: string) => {
    const token = `{{${key}}}`;
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => `${b}${token}`);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handlePreview = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await previewEmail({ subject, body, sampleData });
      setPreviewHtml(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await sendTestEmail({ to: testEmail, subject, body, sampleData });
      if (!res.ok) setError(res.message);
      else {
        setToast(res.message);
        setShowTest(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      setError("Chưa chọn người nhận.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError("Subject và nội dung không được trống.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await sendEmails({
        recipients,
        templateId: templateId || null,
        subject,
        body,
        module,
      });
      onSent?.(res.sent);
      setToast(`Đã gửi ${res.sent} email${res.failed ? `, thất bại ${res.failed}` : ""}.`);
      window.setTimeout(() => {
        onClose();
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gửi thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={`${recipients.length} người nhận · chỉnh sửa chỉ áp dụng lần gửi này`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button variant="secondary" onClick={() => void handlePreview()} disabled={busy || loading} leftIcon={<Icon icon={Eye} size={16} />}>
            Preview
          </Button>
          <Button
            variant="soft"
            onClick={() => setShowTest((v) => !v)}
            disabled={busy || loading}
            leftIcon={<Icon icon={TestTube2} size={16} />}
          >
            Gửi thử
          </Button>
          <Button variant="primary" onClick={() => void handleSend()} disabled={busy || loading} leftIcon={<Icon icon={Send} size={16} />}>
            Gửi email
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-background shadow-inset-sm" aria-busy />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4 min-w-0">
            <div>
              <span className="neu-field-label">Loại email (Template)</span>
              <Select
                width="full"
                value={templateId}
                options={templates.map((t) => ({ value: t.id, label: t.name }))}
                onChange={(id) => void onPickTemplate(id)}
                placeholder="Chọn template"
              />
            </div>

            <label className="block space-y-1.5">
              <span className="neu-field-label">Subject</span>
              <input
                className="neu-input !h-11"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tiêu đề email"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="neu-field-label">Nội dung</span>
              <textarea
                ref={bodyRef}
                className="neu-input !h-auto min-h-[220px] py-3 font-mono text-sm resize-y"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nội dung email..."
              />
            </label>

            {showTest && (
              <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-background p-3 shadow-inset-sm">
                <label className="block min-w-[200px] flex-1 space-y-1">
                  <span className="neu-field-label">Email nhận thử</span>
                  <input
                    type="email"
                    className="neu-input !h-10"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                  />
                </label>
                <Button variant="primary" size="sm" className="!h-10" disabled={busy} onClick={() => void handleTest()}>
                  Gửi test
                </Button>
              </div>
            )}

            {previewHtml && (
              <div className="rounded-2xl border border-accent/20 bg-background p-4 shadow-inset-sm space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Preview</p>
                <p className="font-semibold text-foreground">{previewHtml.subject}</p>
                <div
                  className="prose prose-sm max-w-none text-sm text-foreground [&_a]:text-accent"
                  dangerouslySetInnerHTML={{ __html: previewHtml.bodyHtml }}
                />
              </div>
            )}

            {error && <p className="text-sm text-rose-500">{error}</p>}
            {toast && (
              <p className="text-sm text-accent" role="status">
                {toast}
              </p>
            )}
          </div>

          <aside className="space-y-3">
            <p className="neu-field-label !mb-0">Placeholder</p>
            <p className="text-xs text-muted">Click để chèn vào nội dung</p>
            <ul className="max-h-[420px] space-y-1.5 overflow-y-auto rounded-2xl bg-background p-2 shadow-inset-sm">
              {placeholders.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder(p.key)}
                    className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent/10"
                    title={p.description}
                  >
                    <span className="block font-mono text-xs text-accent">{`{{${p.key}}}`}</span>
                    <span className="text-[11px] text-muted">{p.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-accent/8 p-3 text-xs text-muted">
              <p className="font-semibold text-foreground">Người nhận</p>
              <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">
                {recipients.slice(0, 8).map((r) => (
                  <li key={r.id} className="truncate">
                    {r.name} · {r.email}
                  </li>
                ))}
                {recipients.length > 8 && <li>+{recipients.length - 8} người nữa</li>}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </Modal>
  );
}

export default SendEmailModal;
