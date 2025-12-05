import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import type { EmailFilters, EmailFolder, EmailStatus, UpdateEmailDTO } from '@/types/email';

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

// GET /api/admin/emails/list - Listar emails con filtros
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
    const filters: EmailFilters = {
      folder: searchParams.get('folder') as EmailFolder | undefined,
      status: searchParams.get('status') as EmailStatus | undefined,
      lead_id: searchParams.get('lead_id') ? parseInt(searchParams.get('lead_id')!) : undefined,
      is_starred: searchParams.get('is_starred') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      page: Math.max(parseInt(searchParams.get('page') || '1'), 1),
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100),
    };

    const offset = ((filters.page || 1) - 1) * (filters.limit || 50);

    // Construir query
    let query = supabase
      .from('emails')
      .select(`
        *,
        lead:leads(id, nombre, telefono, localidad)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.folder) {
      if (filters.folder === 'inbox') {
        // Inbox = emails entrantes (inbound)
        query = query.eq('direction', 'inbound');
      } else {
        query = query.eq('folder', filters.folder);
        // Para otros folders, solo mostrar outbound
        if (filters.folder === 'sent') {
          query = query.eq('direction', 'outbound');
        }
      }
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters.is_starred !== undefined) {
      query = query.eq('is_starred', filters.is_starred);
    }

    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,to_email.ilike.%${filters.search}%,body_text.ilike.%${filters.search}%`);
    }

    // Ordenar y paginar
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + (filters.limit || 50) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[GET /api/admin/emails/list] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener emails', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / (filters.limit || 50));

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        meta: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total,
          totalPages,
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[GET /api/admin/emails/list] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// PATCH /api/admin/emails/list - Actualizar email (archivar, destacar, mover)
export async function PATCH(request: NextRequest) {
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

    const body: { id: string } & UpdateEmailDTO = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de email requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validar folder si se proporciona
    const validFolders: EmailFolder[] = ['sent', 'drafts', 'archived', 'trash'];
    if (updateData.folder && !validFolders.includes(updateData.folder)) {
      return NextResponse.json(
        { success: false, error: 'Folder inválido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Filtrar solo campos permitidos
    const allowedFields: (keyof UpdateEmailDTO)[] = ['subject', 'body_html', 'body_text', 'is_archived', 'is_starred', 'folder'];
    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay datos para actualizar' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from('emails')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/admin/emails/list] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar email', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Email actualizado' },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/emails/list] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// DELETE /api/admin/emails/list - Eliminar email (mover a trash o eliminar permanentemente)
export async function DELETE(request: NextRequest) {
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
    const { id, permanent } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de email requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (permanent) {
      // Eliminar permanentemente
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[DELETE /api/admin/emails/list] Database error:', error);
        return NextResponse.json(
          { success: false, error: 'Error al eliminar email', details: error.message },
          { status: 500, headers: SECURITY_HEADERS }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Email eliminado permanentemente' },
        { headers: SECURITY_HEADERS }
      );
    } else {
      // Mover a trash
      const { data, error } = await supabase
        .from('emails')
        .update({ folder: 'trash' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[DELETE /api/admin/emails/list] Database error:', error);
        return NextResponse.json(
          { success: false, error: 'Error al mover email a papelera', details: error.message },
          { status: 500, headers: SECURITY_HEADERS }
        );
      }

      return NextResponse.json(
        { success: true, data, message: 'Email movido a papelera' },
        { headers: SECURITY_HEADERS }
      );
    }
  } catch (error) {
    console.error('[DELETE /api/admin/emails/list] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
