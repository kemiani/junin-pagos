import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import type { EmailTemplate } from '@/types/email';

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

// GET /api/admin/emails/templates - Listar templates
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
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active_only') !== 'false';

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/admin/emails/templates] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener templates', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[GET /api/admin/emails/templates] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// POST /api/admin/emails/templates - Crear template
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

    const body: Partial<EmailTemplate> = await request.json();
    const { name, subject, body_html, body_text, variables, category } = body;

    if (!name || !subject || !body_html) {
      return NextResponse.json(
        { success: false, error: 'Nombre, asunto y contenido HTML son requeridos' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        body_html,
        body_text: body_text || null,
        variables: variables || [],
        category: category || 'general',
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/admin/emails/templates] Database error:', error);

      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Ya existe un template con ese nombre' },
          { status: 409, headers: SECURITY_HEADERS }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Error al crear template', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Template creado correctamente' },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[POST /api/admin/emails/templates] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// PATCH /api/admin/emails/templates - Actualizar template
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

    const body: Partial<EmailTemplate> & { id: string } = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de template requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Filtrar solo campos permitidos
    const allowedFields = ['name', 'subject', 'body_html', 'body_text', 'variables', 'category', 'is_active'];
    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        filteredData[key] = updateData[key as keyof typeof updateData];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay datos para actualizar' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/admin/emails/templates] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar template', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Template actualizado' },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/emails/templates] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

// DELETE /api/admin/emails/templates - Eliminar template
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de template requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/admin/emails/templates] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al eliminar template', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Template eliminado' },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/emails/templates] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
