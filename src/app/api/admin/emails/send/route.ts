import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { getResendClient, getFromAddress, emailConfig, replaceTemplateVariables } from '@/lib/resend';
import type { CreateEmailDTO, Email } from '@/types/email';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

function createAuthClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}

async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
  const response = NextResponse.json({});
  const supabase = createAuthClient(request, response);

  if (!supabase) {
    return { authenticated: false, error: 'Auth not configured' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { authenticated: false, error: 'No valid session' };
    }

    return { authenticated: true, userId: user.id };
  } catch {
    return { authenticated: false, error: 'Auth verification failed' };
  }
}

function unauthorizedResponse(message = 'No autorizado') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401, headers: SECURITY_HEADERS }
  );
}

// POST /api/admin/emails/send - Enviar o guardar borrador de email
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const supabase = await createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    const body: CreateEmailDTO & {
      template_id?: string;
      variables?: Record<string, string>;
      from_email?: string;
      from_name?: string;
      from_account_id?: string;
    } = await request.json();
    const {
      to_email,
      to_name,
      subject,
      body_html,
      body_text,
      lead_id,
      reply_to,
      scheduled_at,
      save_as_draft,
      template_id,
      variables,
      from_email,
      from_name,
      from_account_id,
    } = body;

    // Validaciones básicas
    if (!to_email || !subject) {
      return NextResponse.json(
        { success: false, error: 'Email y asunto son requeridos' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to_email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    let finalHtml = body_html;
    let finalText = body_text;
    let finalSubject = subject;

    // Si se usa un template, obtenerlo y reemplazar variables
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { success: false, error: 'Template no encontrado' },
          { status: 404, headers: SECURITY_HEADERS }
        );
      }

      finalSubject = replaceTemplateVariables(template.subject, variables || {});
      finalHtml = replaceTemplateVariables(template.body_html, variables || {});
      finalText = template.body_text ? replaceTemplateVariables(template.body_text, variables || {}) : undefined;

      // Incrementar uso del template
      await supabase
        .from('email_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template_id);
    }

    if (!finalHtml) {
      return NextResponse.json(
        { success: false, error: 'Contenido del email es requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Buscar o crear thread para este lead
    let threadId: string | null = null;
    if (lead_id) {
      // Buscar thread existente con el mismo subject (simplificado)
      const { data: existingThread } = await supabase
        .from('email_threads')
        .select('id')
        .eq('lead_id', lead_id)
        .eq('subject', finalSubject)
        .single();

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Crear nuevo thread
        const { data: newThread, error: threadError } = await supabase
          .from('email_threads')
          .insert({
            lead_id,
            subject: finalSubject,
          })
          .select('id')
          .single();

        if (!threadError && newThread) {
          threadId = newThread.id;
        }
      }
    }

    // Determinar email de origen
    const senderEmail = from_email || emailConfig.fromEmail;
    const senderName = from_name || emailConfig.fromName;

    // Preparar datos del email
    const emailData: Partial<Email> = {
      lead_id: lead_id || null,
      admin_user_id: auth.userId,
      thread_id: threadId,
      email_account_id: from_account_id || null,
      direction: 'outbound',
      subject: finalSubject,
      body_html: finalHtml,
      body_text: finalText || null,
      from_email: senderEmail,
      from_name: senderName,
      to_email,
      to_name: to_name || null,
      reply_to: reply_to || senderEmail, // Reply-to al mismo email que envía
      status: save_as_draft ? 'draft' : 'queued',
      folder: save_as_draft ? 'drafts' : 'sent',
      scheduled_at: scheduled_at || null,
      is_read: true, // Emails salientes se marcan como leídos
    };

    // Si es borrador, solo guardar en DB
    if (save_as_draft) {
      const { data: savedEmail, error: saveError } = await supabase
        .from('emails')
        .insert(emailData)
        .select()
        .single();

      if (saveError) {
        console.error('[POST /api/admin/emails/send] Save draft error:', saveError);
        return NextResponse.json(
          { success: false, error: 'Error al guardar borrador', details: saveError.message },
          { status: 500, headers: SECURITY_HEADERS }
        );
      }

      return NextResponse.json(
        { success: true, data: savedEmail, message: 'Borrador guardado' },
        { headers: SECURITY_HEADERS }
      );
    }

    // Enviar email con Resend
    const resend = getResendClient();
    const fromAddress = `${senderName} <${senderEmail}>`;

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: fromAddress,
      to: [to_email],
      subject: finalSubject,
      html: finalHtml,
      text: finalText || undefined,
      replyTo: reply_to || senderEmail,
    });

    if (resendError) {
      console.error('[POST /api/admin/emails/send] Resend error:', resendError);

      // Guardar email con estado failed
      emailData.status = 'failed';
      await supabase.from('emails').insert(emailData);

      return NextResponse.json(
        { success: false, error: 'Error al enviar email', details: resendError.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Guardar email exitoso en DB
    emailData.resend_id = resendData?.id || null;
    emailData.status = 'sent';
    emailData.sent_at = new Date().toISOString();

    const { data: savedEmail, error: saveError } = await supabase
      .from('emails')
      .insert(emailData)
      .select()
      .single();

    if (saveError) {
      console.error('[POST /api/admin/emails/send] Save sent email error:', saveError);
      // El email fue enviado pero no se pudo guardar - log pero no fallar
    }

    return NextResponse.json(
      {
        success: true,
        data: savedEmail,
        resend_id: resendData?.id,
        message: 'Email enviado correctamente',
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[POST /api/admin/emails/send] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
