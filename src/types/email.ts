// Tipos para el sistema de emails

export type EmailDirection = 'outbound' | 'inbound';

export type EmailStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'failed';

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'archived' | 'trash';

export interface Email {
  id: string;
  lead_id: number | null;
  admin_user_id: string | null;
  thread_id: string | null;
  email_account_id: string | null;
  resend_id: string | null;
  direction: EmailDirection;
  subject: string;
  body_html: string;
  body_text: string | null;
  from_email: string;
  from_name: string | null;
  to_email: string;
  to_name: string | null;
  reply_to: string | null;
  status: EmailStatus;
  is_archived: boolean;
  is_starred: boolean;
  is_read: boolean;
  folder: EmailFolder;
  opened_at: string | null;
  opened_count: number;
  clicked_at: string | null;
  clicked_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  raw_payload?: Record<string, unknown>;
  // Relaciones (cuando se hacen joins)
  lead?: {
    id: number;
    nombre: string;
    telefono: string;
    localidad: string;
  };
  email_account?: EmailAccount;
}

// Cuenta de email (kevin@, tomas@, info@)
export interface EmailAccount {
  id: string;
  email: string;
  name: string;
  type: 'personal' | 'shared';
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Permisos de usuario sobre una cuenta de email
export interface EmailAccountUser {
  id: string;
  email_account_id: string;
  admin_user_id: string;
  can_send: boolean;
  can_receive: boolean;
  is_owner: boolean;
  created_at: string;
  email_account?: EmailAccount;
}

export interface EmailThread {
  id: string;
  lead_id: number | null;
  subject: string;
  last_email_at: string | null;
  email_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  lead?: {
    id: number;
    nombre: string;
    telefono: string;
  };
  emails?: Email[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: TemplateVariable[];
  category: string;
  is_active: boolean;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
}

export interface EmailAttachment {
  id: string;
  email_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
}

export interface EmailWebhookLog {
  id: string;
  resend_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

// DTOs para crear/actualizar

export interface CreateEmailDTO {
  lead_id?: number;
  to_email: string;
  to_name?: string;
  subject: string;
  body_html: string;
  body_text?: string;
  reply_to?: string;
  scheduled_at?: string;
  save_as_draft?: boolean;
}

export interface UpdateEmailDTO {
  subject?: string;
  body_html?: string;
  body_text?: string;
  is_archived?: boolean;
  is_starred?: boolean;
  folder?: EmailFolder;
}

export interface SendEmailResponse {
  success: boolean;
  email_id?: string;
  resend_id?: string;
  error?: string;
}

// Filtros para listar emails

export interface EmailFilters {
  folder?: EmailFolder;
  status?: EmailStatus;
  lead_id?: number;
  is_starred?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Resend webhook events

export type ResendWebhookEvent =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

export interface ResendWebhookPayload {
  type: ResendWebhookEvent;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Campos adicionales según el evento
    click?: {
      link: string;
      timestamp: string;
    };
    bounce?: {
      message: string;
    };
  };
}
