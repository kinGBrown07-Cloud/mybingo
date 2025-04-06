import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;

    // Redirection vers le dashboard admin pour les administrateurs
    if (token?.role === "ADMIN" && req.nextUrl.pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/games/:path*",
    "/api/protected/:path*",
    "/api/auth/me",
  ],
};
