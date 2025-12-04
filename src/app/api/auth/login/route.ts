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
  let response = NextResponse.json({ success: false }, { status: 500 });

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Contrasena es requerida' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email invalido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    response = NextResponse.json({ success: true }, { status: 200, headers: SECURITY_HEADERS });

    const supabase = createApiSupabaseClient(request, response);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Credenciales invalidas' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { success: false, error: 'No se pudo crear la sesion' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const finalResponse = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role || 'user',
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );

    response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie);
    });

    return finalResponse;

  } catch (error) {
    console.error('[Login API] Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Formato de solicitud invalido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { ...SECURITY_HEADERS, Allow: 'POST' } }
  );
}
