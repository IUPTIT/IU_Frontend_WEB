// History vẫn mock cục bộ; template CRUD + gửi thật qua BE. SMTP cấu hình trên BE .env.
import { api } from "../api/client";
import { EMAIL_PLACEHOLDERS, historyStore } from "../mocks/email.mock";
import type {
  EmailHistoryItem,
  EmailPlaceholder,
  EmailPreviewRequest,
  EmailPreviewResult,
  EmailTemplate,
  EmailTemplateCategory,
  EmailAutomationRule,
  UpdateEmailAutomationRuleInput,
  SendEmailRequest,
  SendEmailResult,
  SendTestRequest,
} from "../types/email";
import { renderPlaceholders } from "../utils/emailRender";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_SAMPLE: Record<string, string> = Object.fromEntries(
  EMAIL_PLACEHOLDERS.map((p) => [p.key, p.sample]),
);

type BackendTemplate = EmailTemplate & { _id?: string };

function toTemplate(t: BackendTemplate): EmailTemplate {
  return {
    id: t.id || String(t._id),
    name: t.name,
    category: t.category,
    subject: t.subject,
    body: t.body,
    status: t.status,
    slug: t.slug ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

/** GET /admin/email-templates */
export async function getEmailTemplates(
  category?: EmailTemplateCategory | "",
): Promise<EmailTemplate[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  const { templates } = await api.get<{ templates: BackendTemplate[] }>(
    `/admin/email-templates${q}`,
  );
  return templates.map(toTemplate);
}

/** GET /admin/email-templates/:id — hoặc tìm theo slug (tpl-passed) */
export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  try {
    const { template } = await api.get<{ template: BackendTemplate }>(
      `/admin/email-templates/${id}`,
    );
    return toTemplate(template);
  } catch {
    const all = await getEmailTemplates();
    return all.find((t) => t.id === id || t.slug === id) ?? null;
  }
}

/** POST /admin/email-templates */
export async function createEmailTemplate(
  input: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<EmailTemplate> {
  const { template } = await api.post<{ template: BackendTemplate }>(
    "/admin/email-templates",
    {
      name: input.name,
      category: input.category,
      subject: input.subject,
      body: input.body,
      status: input.status,
      slug: input.slug ?? null,
    },
  );
  return toTemplate(template);
}

/** PATCH /admin/email-templates/:id */
export async function updateEmailTemplate(
  id: string,
  patch: Partial<Omit<EmailTemplate, "id" | "createdAt">>,
): Promise<EmailTemplate | null> {
  const { template } = await api.patch<{ template: BackendTemplate }>(
    `/admin/email-templates/${id}`,
    patch,
  );
  return toTemplate(template);
}

/** DELETE /admin/email-templates/:id */
export async function deleteEmailTemplate(id: string): Promise<boolean> {
  await api.delete(`/admin/email-templates/${id}`);
  return true;
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

/** Placeholder library (tĩnh FE) */
export async function getEmailPlaceholders(
  category?: EmailTemplateCategory | "",
): Promise<EmailPlaceholder[]> {
  await delay(150);
  if (!category) return [...EMAIL_PLACEHOLDERS];
  return EMAIL_PLACEHOLDERS.filter((p) => p.categories.includes(category));
}

/** POST /email/preview — render FE */
export async function previewEmail(req: EmailPreviewRequest): Promise<EmailPreviewResult> {
  await delay(250);
  const data = { ...DEFAULT_SAMPLE, ...req.sampleData };
  return {
    subject: renderPlaceholders(req.subject, data),
    bodyHtml: renderPlaceholders(req.body, data),
  };
}

/** POST /email/send-test → thật qua /admin/emails/send */
export async function sendTestEmail(req: SendTestRequest): Promise<{ ok: boolean; message: string }> {
  if (!req.to.trim()) {
    return { ok: false, message: "Nhập email nhận thử." };
  }
  if (!EMAIL_RE.test(req.to.trim())) {
    return { ok: false, message: `Email không hợp lệ: ${req.to.trim()}` };
  }
  const data = {
    ...DEFAULT_SAMPLE,
    ...req.sampleData,
    // Nếu sample có email người nhận thật thì ưu tiên (tránh sample BCN)
    ...(req.sampleData?.email ? { email: req.sampleData.email } : {}),
  };
  const subject = renderPlaceholders(req.subject, data);
  const body = renderPlaceholders(req.body, data);
  try {
    const result = await api.post<{
      sent: number;
      failed: number;
      logged?: number;
      errors?: { to: string; message: string }[];
    }>("/admin/emails/send", {
      messages: [
        {
          to: req.to.trim(),
          subject,
          html: body.includes("<")
            ? `<div style="margin:0;padding:16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;background:#ffffff">${body}</div>`
            : `<div style="margin:0;padding:16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;background:#ffffff;white-space:pre-wrap">${body}</div>`,
          text: body.replace(/<[^>]+>/g, " "),
        },
      ],
    });
    if ((result.logged ?? 0) > 0 && result.sent === 0) {
      return {
        ok: false,
        message: `SMTP/SendGrid tắt — chưa gửi thật tới ${req.to}.`,
      };
    }
    if (result.failed > 0 || result.sent === 0) {
      return {
        ok: false,
        message:
          result.errors?.[0]?.message ??
          `Gửi thử thất bại tới ${req.to}.`,
      };
    }
    return { ok: true, message: `Đã gửi thử tới ${req.to}.` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gửi thử thất bại.",
    };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /admin/emails/send — render placeholder phía FE, gửi SMTP phía BE.
 */
export async function sendEmails(req: SendEmailRequest): Promise<SendEmailResult> {
  if (req.recipients.length === 0) {
    throw new Error("Chưa chọn người nhận.");
  }
  if (!req.subject.trim() || !req.body.trim()) {
    throw new Error("Subject và nội dung không được trống.");
  }

  const tpl = req.templateId ? await getEmailTemplate(req.templateId) : null;
  const skipped: { to: string; message: string }[] = [];
  for (const r of req.recipients) {
    const raw = String(r.email || "").trim();
    if (!raw) {
      skipped.push({
        to: r.name || "(không email)",
        message: "Thiếu địa chỉ email",
      });
    } else if (!EMAIL_RE.test(raw)) {
      skipped.push({ to: raw, message: "Email không đúng định dạng" });
    }
  }

  const messages = req.recipients
    .filter((r) => r.email && EMAIL_RE.test(String(r.email).trim()))
    .map((r) => {
      const data = {
        ...DEFAULT_SAMPLE,
        ...r.data,
        candidate_name: r.data.candidate_name || r.name,
        // Luôn dùng email người nhận làm {{email}} (tài khoản portal) — không lấy sample BCN
        email: r.email,
      };
      const subject = renderPlaceholders(req.subject, data);
      const body = renderPlaceholders(req.body, data);
      return {
        to: String(r.email).trim(),
        subject,
        html: body.includes("<")
          ? `<div style="margin:0;padding:16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;background:#ffffff">${body}</div>`
          : `<div style="margin:0;padding:16px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;background:#ffffff;white-space:pre-wrap">${body}</div>`,
        text: body.replace(/<[^>]+>/g, " "),
        _meta: { r, subject, body },
      };
    });

  if (messages.length === 0) {
    const detail = skipped.map((s) => `${s.to}: ${s.message}`).join("; ");
    throw new Error(
      detail
        ? `Không có địa chỉ email hợp lệ để gửi. ${detail}`
        : "Không có địa chỉ email hợp lệ để gửi.",
    );
  }

  const result = await api.post<{
    sent: number;
    failed: number;
    logged?: number;
    errors?: { to: string; message: string }[];
  }>("/admin/emails/send", {
    messages: messages.map(({ to, subject, html, text }) => ({
      to,
      subject,
      html,
      text,
    })),
  });

  const logged = result.logged ?? 0;
  const apiErrors = result.errors ?? [];
  const historyIds: string[] = [];
  for (const msg of messages) {
    const failedErr = apiErrors.find(
      (e) => e.to?.toLowerCase() === msg.to.toLowerCase(),
    );
    const item: EmailHistoryItem = {
      id: uid("hist"),
      recipientId: msg._meta.r.id,
      recipientName: msg._meta.r.name,
      recipientEmail: msg.to,
      subject: msg._meta.subject,
      body: msg._meta.body,
      templateId: req.templateId,
      templateName: tpl?.name ?? null,
      module: req.module,
      status: failedErr ? "failed" : result.sent > 0 && !failedErr ? "sent" : "queued",
      error: failedErr?.message,
      sentAt: new Date().toISOString(),
      sentBy: "Admin",
    };
    historyStore.unshift(item);
    historyIds.push(item.id);
  }

  const errors = [
    ...apiErrors,
    ...skipped,
  ];
  const failed = (result.failed ?? 0) + skipped.length;

  if (result.sent === 0 && logged > 0 && failed === 0) {
    throw new Error(
      `SMTP/SendGrid đang tắt — đã ghi log ${logged} email, chưa gửi thật.`,
    );
  }

  return {
    sent: result.sent,
    failed,
    logged,
    historyIds,
    errors,
    skipped,
  };
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

/** GET /admin/email-automation-rules */
export async function getEmailAutomationRules(): Promise<EmailAutomationRule[]> {
  const { rules } = await api.get<{ rules: EmailAutomationRule[] }>(
    "/admin/email-automation-rules",
  );
  return rules;
}

/** PATCH /admin/email-automation-rules/:id */
export async function updateEmailAutomationRule(
  id: string,
  patch: UpdateEmailAutomationRuleInput,
): Promise<EmailAutomationRule> {
  const { rule } = await api.patch<{ rule: EmailAutomationRule }>(
    `/admin/email-automation-rules/${id}`,
    patch,
  );
  return rule;
}

/** POST /admin/email-automation-rules/restore-defaults */
export async function restoreEmailAutomationDefaults(): Promise<
  EmailAutomationRule[]
> {
  const { rules } = await api.post<{ rules: EmailAutomationRule[] }>(
    "/admin/email-automation-rules/restore-defaults",
    {},
  );
  return rules;
}
