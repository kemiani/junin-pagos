import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Duración de sesión en milisegundos (3 horas)
const SESSION_DURATION_MS = 3 * 60 * 60 * 1000;
const SESSION_COOKIE_NAME = 'admin_session_timestamp';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar a rutas de admin (excepto login)
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  // También aplicar a APIs de admin
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!pathname.startsWith('/admin') && !isAdminApi) {
    return NextResponse.next();
  }

  // Obtener timestamp de última actividad
  const sessionTimestamp = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const now = Date.now();

  // Si no hay cookie de sesión o expiró
  if (!sessionTimestamp) {
    // Si es una página de admin, redirigir a login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login?reason=no_session', request.url));
    }
    // Si es API, devolver 401
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada' },
        { status: 401 }
      );
    }
  }

  const lastActivity = parseInt(sessionTimestamp || '0', 10);
  const elapsed = now - lastActivity;

  // Si la sesión expiró (más de 3 horas)
  if (elapsed > SESSION_DURATION_MS) {
    const response = pathname.startsWith('/admin') && !isAdminApi
      ? NextResponse.redirect(new URL('/admin/login?reason=session_expired', request.url))
      : NextResponse.json(
          { success: false, error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' },
          { status: 401 }
        );

    // Eliminar la cookie de sesión
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;
  }

  // Sesión válida - actualizar timestamp de última actividad
  const response = NextResponse.next();
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: now.toString(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Cookie expira en 3 horas (el navegador la elimina automáticamente)
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return response;
}

export const config = {
  matcher: [
    // Rutas de admin
    '/admin/:path*',
    // APIs de admin
    '/api/admin/:path*',
  ],
};
