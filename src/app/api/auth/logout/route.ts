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

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200, headers: SECURITY_HEADERS }
    );

    const supabase = createApiSupabaseClient(request, response);
    await supabase.auth.signOut();

    response.cookies.set({
      name: 'junin-auth-token',
      value: '',
      maxAge: 0,
      path: '/',
    });

    const cookiesToClear = ['sb-access-token', 'sb-refresh-token'];
    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        maxAge: 0,
        path: '/',
      });
    });

    return response;

  } catch (error) {
    console.error('[Logout API] Error:', error);

    const response = NextResponse.json(
      { success: true, message: 'Session cleared' },
      { status: 200, headers: SECURITY_HEADERS }
    );

    response.cookies.set({
      name: 'junin-auth-token',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));

    const supabase = createApiSupabaseClient(request, response);
    await supabase.auth.signOut();

    response.cookies.set({
      name: 'junin-auth-token',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set({
      name: 'junin-auth-token',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
