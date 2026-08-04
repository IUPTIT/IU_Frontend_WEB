// TODO: MOCK — thay bằng fetch tới /email/* khi BE sẵn sàng.
import {
  EMAIL_PLACEHOLDERS,
  historyStore,
  smtpStore,
  templatesStore,
} from "../mocks/email.mock";
import type {
  EmailHistoryItem,
  EmailPlaceholder,
  EmailPreviewRequest,
  EmailPreviewResult,
  EmailTemplate,
  EmailTemplateCategory,
  SendEmailRequest,
  SendEmailResult,
  SendTestRequest,
  SmtpConfig,
} from "../types/email";
import { renderPlaceholders } from "../utils/emailRender";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_SAMPLE: Record<string, string> = Object.fromEntries(
  EMAIL_PLACEHOLDERS.map((p) => [p.key, p.sample]),
);

/** GET /email/config */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  await delay();
  return { ...smtpStore };
}

/** POST /email/config */
export async function saveSmtpConfig(config: SmtpConfig): Promise<SmtpConfig> {
  await delay(400);
  Object.assign(smtpStore, config);
  return { ...smtpStore };
}

/** POST /email/test — kiểm tra kết nối SMTP (mock) */
export async function testSmtpConnection(): Promise<{ ok: boolean; message: string }> {
  await delay(700);
  if (!smtpStore.enabled) {
    return { ok: false, message: "SMTP đang tắt. Bật cấu hình rồi thử lại." };
  }
  if (!smtpStore.host || !smtpStore.senderEmail) {
    return { ok: false, message: "Thiếu Host hoặc Sender Email." };
  }
  return { ok: true, message: `Kết nối tới ${smtpStore.host}:${smtpStore.port} thành công.` };
}

/** GET /email/templates */
export async function getEmailTemplates(category?: EmailTemplateCategory | ""): Promise<EmailTemplate[]> {
  await delay();
  const list = [...templatesStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (!category) return list;
  return list.filter((t) => t.category === category);
}

/** GET /email/templates/{id} */
export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  await delay(200);
  return templatesStore.find((t) => t.id === id) ?? null;
}

/** POST /email/templates */
export async function createEmailTemplate(
  input: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<EmailTemplate> {
  await delay(400);
  const now = new Date().toISOString();
  const row: EmailTemplate = { ...input, id: uid("tpl"), createdAt: now, updatedAt: now };
  templatesStore.unshift(row);
  return row;
}

/** PUT /email/templates/{id} */
export async function updateEmailTemplate(
  id: string,
  patch: Partial<Omit<EmailTemplate, "id" | "createdAt">>,
): Promise<EmailTemplate | null> {
  await delay(400);
  const idx = templatesStore.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const next = {
    ...templatesStore[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  templatesStore[idx] = next;
  return next;
}

/** DELETE /email/templates/{id} */
export async function deleteEmailTemplate(id: string): Promise<boolean> {
  await delay(300);
  const before = templatesStore.length;
  const idx = templatesStore.findIndex((t) => t.id === id);
  if (idx >= 0) templatesStore.splice(idx, 1);
  return templatesStore.length < before;
}

export async function duplicateEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const src = await getEmailTemplate(id);
  if (!src) return null;
  return createEmailTemplate({
    name: `${src.name} (copy)`,
    category: src.category,
    subject: src.subject,
    body: src.body,
    status: "inactive",
  });
}

/** Placeholder library */
export async function getEmailPlaceholders(
  category?: EmailTemplateCategory | "",
): Promise<EmailPlaceholder[]> {
  await delay(150);
  if (!category) return [...EMAIL_PLACEHOLDERS];
  return EMAIL_PLACEHOLDERS.filter((p) => p.categories.includes(category));
}

/** POST /email/preview — BE render; mock trên FE */
export async function previewEmail(req: EmailPreviewRequest): Promise<EmailPreviewResult> {
  await delay(250);
  const data = { ...DEFAULT_SAMPLE, ...req.sampleData };
  return {
    subject: renderPlaceholders(req.subject, data),
    bodyHtml: renderPlaceholders(req.body, data),
  };
}

/** POST /email/send-test */
export async function sendTestEmail(req: SendTestRequest): Promise<{ ok: boolean; message: string }> {
  await delay(600);
  if (!smtpStore.enabled) {
    return { ok: false, message: "SMTP đang tắt." };
  }
  if (!req.to.trim()) {
    return { ok: false, message: "Nhập email nhận thử." };
  }
  const data = { ...DEFAULT_SAMPLE, ...req.sampleData };
  const subject = renderPlaceholders(req.subject, data);
  const body = renderPlaceholders(req.body, data);
  const item: EmailHistoryItem = {
    id: uid("hist"),
    recipientId: "test",
    recipientName: "Test recipient",
    recipientEmail: req.to.trim(),
    subject,
    body,
    templateId: null,
    templateName: "Send Test",
    module: "test",
    status: "sent",
    sentAt: new Date().toISOString(),
    sentBy: "Admin",
  };
  historyStore.unshift(item);
  return { ok: true, message: `Đã gửi thử tới ${req.to}.` };
}

/**
 * POST /email/send
 * Dùng subject/body từ FE (không lấy lại từ DB template).
 */
export async function sendEmails(req: SendEmailRequest): Promise<SendEmailResult> {
  await delay(700);
  if (!smtpStore.enabled) {
    throw new Error("SMTP đang tắt. Bật cấu hình trong Email Configuration.");
  }
  const tpl = req.templateId ? templatesStore.find((t) => t.id === req.templateId) : null;
  let sent = 0;
  let failed = 0;
  const historyIds: string[] = [];

  for (const r of req.recipients) {
    try {
      if (!r.email) throw new Error("Thiếu email người nhận");
      const data = { ...DEFAULT_SAMPLE, ...r.data, candidate_name: r.data.candidate_name || r.name };
      const subject = renderPlaceholders(req.subject, data);
      const body = renderPlaceholders(req.body, data);
      const item: EmailHistoryItem = {
        id: uid("hist"),
        recipientId: r.id,
        recipientName: r.name,
        recipientEmail: r.email,
        subject,
        body,
        templateId: req.templateId,
        templateName: tpl?.name ?? null,
        module: req.module,
        status: "sent",
        sentAt: new Date().toISOString(),
        sentBy: "Admin",
      };
      historyStore.unshift(item);
      historyIds.push(item.id);
      sent += 1;
    } catch (e) {
      failed += 1;
      const item: EmailHistoryItem = {
        id: uid("hist"),
        recipientId: r.id,
        recipientName: r.name,
        recipientEmail: r.email || "—",
        subject: req.subject,
        body: req.body,
        templateId: req.templateId,
        templateName: tpl?.name ?? null,
        module: req.module,
        status: "failed",
        error: e instanceof Error ? e.message : "Gửi thất bại",
        sentAt: new Date().toISOString(),
        sentBy: "Admin",
      };
      historyStore.unshift(item);
      historyIds.push(item.id);
    }
  }

  return { sent, failed, historyIds };
}

/** GET /email/history */
export async function getEmailHistory(): Promise<EmailHistoryItem[]> {
  await delay();
  return [...historyStore];
}

/** Gửi lại từ lịch sử (mock) */
export async function resendEmailHistory(id: string): Promise<boolean> {
  await delay(500);
  const src = historyStore.find((h) => h.id === id);
  if (!src) return false;
  const copy: EmailHistoryItem = {
    ...src,
    id: uid("hist"),
    status: "sent",
    error: undefined,
    sentAt: new Date().toISOString(),
  };
  historyStore.unshift(copy);
  return true;
}
