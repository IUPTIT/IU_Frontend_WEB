/** Email động — SMTP, template, placeholder, lịch sử, gửi hàng loạt (FE types). */

export type SmtpEncryption = "none" | "ssl" | "tls";

export type EmailTemplateCategory = "recruitment" | "training" | "general" | "event";

export type EmailTemplateStatus = "active" | "inactive";

export type EmailSendStatus = "queued" | "sent" | "failed";

export type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  /** Mock — không lưu thật trên FE production */
  password: string;
  encryption: SmtpEncryption;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  enabled: boolean;
};

export type EmailPlaceholder = {
  key: string;
  label: string;
  description: string;
  sample: string;
  categories: EmailTemplateCategory[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  /** HTML / plain text với {{placeholders}} */
  body: string;
  status: EmailTemplateStatus;
  updatedAt: string;
  createdAt: string;
};

export type EmailRecipient = {
  id: string;
  name: string;
  email: string;
  /** Map key → value để BE/mock render (không chứa {{}}) */
  data: Record<string, string>;
};

export type EmailHistoryItem = {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  templateId: string | null;
  templateName: string | null;
  module: string;
  status: EmailSendStatus;
  error?: string;
  sentAt: string;
  sentBy: string;
};

export type EmailPreviewRequest = {
  subject: string;
  body: string;
  sampleData?: Record<string, string>;
};

export type EmailPreviewResult = {
  subject: string;
  bodyHtml: string;
};

export type SendTestRequest = {
  to: string;
  subject: string;
  body: string;
  sampleData?: Record<string, string>;
};

export type SendEmailRequest = {
  recipients: EmailRecipient[];
  templateId: string | null;
  subject: string;
  body: string;
  module: string;
};

export type SendEmailResult = {
  sent: number;
  failed: number;
  historyIds: string[];
};
