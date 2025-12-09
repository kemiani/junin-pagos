import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { getResendClient } from '@/lib/resend';
import type { EmailStatus } from '@/types/email';

// Tipos para el webhook
interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
    }>;
    click?: {
      link: string;
      timestamp: string;
    };
    bounce?: {
      message: string;
    };
  };
}

// Webhook de Resend - no requiere autenticación de usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const payload: ResendWebhookPayload = await request.json();

    // Log del webhook para debugging
    await supabase.from('email_webhook_logs').insert({
      resend_id: payload.data?.email_id || null,
      event_type: payload.type,
      payload: payload as unknown as Record<string, unknown>,
      processed: false,
    });

    // Manejar email recibido (inbound)
    if (payload.type === 'email.received') {
      await handleInboundEmail(supabase, payload);
      return NextResponse.json({ received: true });
    }

    // Mapear evento a estado de email (outbound tracking)
    const eventToStatus: Record<string, EmailStatus> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
    };

    const newStatus = eventToStatus[payload.type];
    const resendId = payload.data?.email_id;

    if (newStatus && resendId) {
      // Actualizar estado del email
      const updateData: Record<string, unknown> = {
        status: newStatus,
      };

      // Agregar metadata según el evento
      if (payload.type === 'email.opened') {
        const { data: currentEmail } = await supabase
          .from('emails')
          .select('opened_count, opened_at')
          .eq('resend_id', resendId)
          .single();

        updateData.opened_count = (currentEmail?.opened_count || 0) + 1;
        if (!currentEmail?.opened_at) {
          updateData.opened_at = new Date().toISOString();
        }
      }

      if (payload.type === 'email.clicked') {
        const { data: currentEmail } = await supabase
          .from('emails')
          .select('clicked_count, clicked_at')
          .eq('resend_id', resendId)
          .single();

        updateData.clicked_count = (currentEmail?.clicked_count || 0) + 1;
        if (!currentEmail?.clicked_at) {
          updateData.clicked_at = new Date().toISOString();
        }
      }

      const { error: updateError } = await supabase
        .from('emails')
        .update(updateData)
        .eq('resend_id', resendId);

      if (updateError) {
        console.error('[Webhook] Error updating email:', updateError);
      }

      // Marcar webhook como procesado
      await supabase
        .from('email_webhook_logs')
        .update({ processed: true })
        .eq('resend_id', resendId)
        .eq('event_type', payload.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Función para manejar emails entrantes
async function handleInboundEmail(
  supabase: Awaited<ReturnType<typeof createSupabaseAdminClient>>,
  payload: ResendWebhookPayload
) {
  if (!supabase) return;

  try {
    const { data } = payload;
    const resendEmailId = data.email_id;

    // Obtener contenido completo del email usando la API de Resend (endpoint de receiving)
    let bodyHtml = '';
    let bodyText = '';

    try {
      const response = await fetch(`https://api.resend.com/emails/receiving/${resendEmailId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
      });

      if (response.ok) {
        const emailData = await response.json();
        bodyHtml = emailData.html || emailData.body || '';
        bodyText = emailData.text || '';
        console.log('[Webhook] Email content fetched from receiving endpoint');
      } else {
        console.error('[Webhook] Error fetching email:', response.status);
      }
    } catch (fetchError) {
      console.error('[Webhook] Error fetching email content:', fetchError);
    }

    // Extraer nombre y email del remitente
    // Soporta formatos: "Nombre <email@domain.com>" o "email@domain.com"
    let fromName: string | null = null;
    let fromEmail: string = data.from;

    console.log('[Webhook] Parsing from field:', data.from);

    const angleMatch = data.from.match(/^(.+?)\s*<([^<>]+)>$/);
    if (angleMatch) {
      // Formato: "Nombre <email@domain.com>"
      fromName = angleMatch[1].trim();
      fromEmail = angleMatch[2].trim();
      console.log('[Webhook] Parsed with angle brackets - Name:', fromName, 'Email:', fromEmail);
    } else {
      // Formato simple: "email@domain.com"
      fromEmail = data.from.trim();
      fromName = null;
      console.log('[Webhook] Parsed without angle brackets - Email:', fromEmail);
    }

    // Buscar a qué cuenta de email llegó
    const toEmail = data.to[0]; // Primer destinatario
    const { data: emailAccount } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('email', toEmail)
      .single();

    // Buscar si hay un lead asociado al email del remitente
    // (simplificado - podrías tener una tabla de contactos)
    let leadId: number | null = null;
    const { data: existingEmail } = await supabase
      .from('emails')
      .select('lead_id')
      .eq('to_email', fromEmail)
      .not('lead_id', 'is', null)
      .limit(1)
      .single();

    if (existingEmail?.lead_id) {
      leadId = existingEmail.lead_id;
    }

    // Buscar o crear thread
    let threadId: string | null = null;
    const cleanSubject = data.subject.replace(/^(Re:|Fwd:|RE:|FW:)\s*/gi, '').trim();

    const { data: existingThread } = await supabase
      .from('email_threads')
      .select('id')
      .ilike('subject', `%${cleanSubject}%`)
      .limit(1)
      .single();

    if (existingThread) {
      threadId = existingThread.id;
    } else {
      const { data: newThread } = await supabase
        .from('email_threads')
        .insert({
          lead_id: leadId,
          subject: data.subject,
        })
        .select('id')
        .single();

      if (newThread) {
        threadId = newThread.id;
      }
    }

    // Crear el email entrante
    const { error: insertError } = await supabase.from('emails').insert({
      resend_id: resendEmailId,
      direction: 'inbound',
      lead_id: leadId,
      thread_id: threadId,
      email_account_id: emailAccount?.id || null,
      subject: data.subject,
      body_html: bodyHtml || `<p>Email recibido de ${fromEmail}</p>`,
      body_text: bodyText || null,
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      to_name: null,
      status: 'delivered',
      folder: 'sent', // Los emails entrantes van al inbox general
      is_read: false,
      is_archived: false,
      is_starred: false,
      sent_at: payload.created_at,
      raw_payload: payload as unknown as Record<string, unknown>,
    });

    if (insertError) {
      console.error('[Webhook] Error inserting inbound email:', insertError);
    }

    // Marcar webhook como procesado
    await supabase
      .from('email_webhook_logs')
      .update({ processed: true })
      .eq('resend_id', resendEmailId)
      .eq('event_type', 'email.received');

    console.log(`[Webhook] Inbound email processed: ${resendEmailId}`);
  } catch (error) {
    console.error('[Webhook] Error handling inbound email:', error);
  }
}

// GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/admin/emails/webhook',
    events: [
      'email.sent',
      'email.delivered',
      'email.bounced',
      'email.complained',
      'email.opened',
      'email.clicked',
      'email.received',
    ],
  });
}
