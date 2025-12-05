import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

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

// GET /api/admin/emails/threads - Listar threads con emails agrupados
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || 'inbox';
    const search = searchParams.get('search') || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const offset = (page - 1) * limit;

    // Para inbox, queremos threads que tengan al menos un email inbound
    // Para sent, queremos threads que tengan emails outbound
    const isInbox = folder === 'inbox';

    // Query para obtener threads con sus emails
    let query = supabase
      .from('email_threads')
      .select(`
        *,
        lead:leads(id, nombre, telefono, localidad),
        emails(
          id,
          direction,
          subject,
          body_text,
          from_email,
          from_name,
          to_email,
          to_name,
          is_read,
          is_starred,
          status,
          created_at,
          sent_at
        )
      `, { count: 'exact' })
      .eq('is_archived', false)
      .order('last_email_at', { ascending: false });

    // Filtro de búsqueda
    if (search) {
      query = query.ilike('subject', `%${search}%`);
    }

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data: threads, error, count } = await query;

    if (error) {
      console.error('[GET /api/admin/emails/threads] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener threads', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Filtrar threads según el folder y procesar datos
    const processedThreads = (threads || [])
      .map(thread => {
        const emails = thread.emails || [];

        // Filtrar emails según el folder
        const relevantEmails = isInbox
          ? emails.filter((e: { direction: string }) => e.direction === 'inbound')
          : emails.filter((e: { direction: string }) => e.direction === 'outbound');

        if (relevantEmails.length === 0) return null;

        // Ordenar emails por fecha (más reciente primero para preview, más antiguo primero para conversación)
        const sortedEmails = [...emails].sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // El último email (para preview)
        const lastEmail = sortedEmails[0];

        // Contar emails no leídos (solo inbound)
        const unreadCount = emails.filter(
          (e: { direction: string; is_read: boolean }) => e.direction === 'inbound' && !e.is_read
        ).length;

        // Verificar si hay algún email destacado
        const hasStarred = emails.some((e: { is_starred: boolean }) => e.is_starred);

        return {
          ...thread,
          emails: sortedEmails,
          lastEmail,
          unreadCount,
          hasStarred,
          totalEmails: emails.length,
          hasInbound: emails.some((e: { direction: string }) => e.direction === 'inbound'),
          hasOutbound: emails.some((e: { direction: string }) => e.direction === 'outbound'),
        };
      })
      .filter(Boolean);

    // Filtrar por folder después del procesamiento
    const filteredThreads = processedThreads.filter(thread => {
      if (isInbox) {
        return thread.hasInbound;
      }
      return thread.hasOutbound;
    });

    const total = count || 0;
    const totalPages = Math.ceil(filteredThreads.length / limit);

    return NextResponse.json(
      {
        success: true,
        data: filteredThreads,
        meta: {
          page,
          limit,
          total: filteredThreads.length,
          totalPages,
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[GET /api/admin/emails/threads] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// GET /api/admin/emails/threads/[id] - Obtener un thread específico con todos sus emails
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

    const body = await request.json();
    const { thread_id, mark_as_read } = body;

    if (!thread_id) {
      return NextResponse.json(
        { success: false, error: 'thread_id requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Obtener el thread con todos sus emails
    const { data: thread, error } = await supabase
      .from('email_threads')
      .select(`
        *,
        lead:leads(id, nombre, telefono, localidad),
        emails(
          *
        )
      `)
      .eq('id', thread_id)
      .single();

    if (error) {
      console.error('[POST /api/admin/emails/threads] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener thread', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Ordenar emails cronológicamente (más antiguo primero para conversación)
    const sortedEmails = [...(thread.emails || [])].sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Si mark_as_read es true, marcar todos los emails inbound como leídos
    if (mark_as_read) {
      const unreadInboundIds = sortedEmails
        .filter((e: { direction: string; is_read: boolean }) => e.direction === 'inbound' && !e.is_read)
        .map((e: { id: string }) => e.id);

      if (unreadInboundIds.length > 0) {
        await supabase
          .from('emails')
          .update({ is_read: true })
          .in('id', unreadInboundIds);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...thread,
          emails: sortedEmails,
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[POST /api/admin/emails/threads] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
