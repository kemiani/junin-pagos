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

// GET /api/admin/emails/accounts - Obtener cuentas de email del usuario
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

    // Obtener cuentas a las que el usuario tiene acceso
    const { data: accountUsers, error } = await supabase
      .from('email_account_users')
      .select(`
        *,
        email_account:email_accounts(*)
      `)
      .eq('admin_user_id', auth.userId);

    if (error) {
      console.error('[GET /api/admin/emails/accounts] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener cuentas', details: error.message },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Transformar a formato más limpio
    const accounts = (accountUsers || [])
      .filter((au: { email_account: unknown }) => au.email_account)
      .map((au: {
        email_account: {
          id: string;
          email: string;
          name: string;
          type: string;
          is_default: boolean;
          is_active: boolean;
        };
        can_send: boolean;
        can_receive: boolean;
        is_owner: boolean;
      }) => ({
        ...au.email_account,
        can_send: au.can_send,
        can_receive: au.can_receive,
        is_owner: au.is_owner,
      }));

    return NextResponse.json(
      { success: true, data: accounts },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[GET /api/admin/emails/accounts] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
