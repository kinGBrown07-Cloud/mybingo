import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Créer un client Supabase pour le middleware
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Rafraîchir la session si nécessaire
  const { data: { session } } = await supabase.auth.getSession();
  
  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!session && isProtectedRoute(req.nextUrl.pathname)) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Si l'utilisateur est connecté et a un rôle admin, rediriger vers le dashboard admin
  if ((session?.user?.user_metadata?.role === 'ADMIN' || session?.user?.role === 'ADMIN') && req.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }
  
  return res;
}

// Fonction pour vérifier si une route est protégée
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/profile',
    '/games',
    '/api/protected',
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/games/:path*',
    '/api/protected/:path*',
  ],
};
