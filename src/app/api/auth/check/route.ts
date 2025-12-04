import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
};

function createApiSupabaseClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        });
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401, headers: SECURITY_HEADERS }
    );

    const supabase = createApiSupabaseClient(request, response);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false, error: 'Not authenticated' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
          role: user.user_metadata?.role || 'user',
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );

  } catch (error) {
    console.error('[Auth Check API] Error:', error);

    return NextResponse.json(
      { authenticated: false, error: 'Authentication check failed' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }
}
