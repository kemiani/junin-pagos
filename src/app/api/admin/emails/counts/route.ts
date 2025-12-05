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

// GET /api/admin/emails/counts - Obtener todos los counts en una sola llamada
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

    // Ejecutar todas las queries en paralelo (una sola verificación de auth)
    const [
      inboxResult,
      sentResult,
      draftsResult,
      archivedResult,
      trashResult,
      starredResult,
      unreadResult,
    ] = await Promise.all([
      // Inbox (inbound emails)
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('direction', 'inbound'),

      // Sent (outbound, folder = sent)
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('direction', 'outbound')
        .eq('folder', 'sent'),

      // Drafts
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('folder', 'drafts'),

      // Archived
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('folder', 'archived'),

      // Trash
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('folder', 'trash'),

      // Starred
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('is_starred', true),

      // Unread (inbound + not read)
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('direction', 'inbound')
        .eq('is_read', false),
    ]);

    const counts = {
      inbox: inboxResult.count || 0,
      sent: sentResult.count || 0,
      drafts: draftsResult.count || 0,
      archived: archivedResult.count || 0,
      trash: trashResult.count || 0,
      starred: starredResult.count || 0,
      unread: unreadResult.count || 0,
    };

    return NextResponse.json(
      { success: true, data: counts },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[GET /api/admin/emails/counts] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
