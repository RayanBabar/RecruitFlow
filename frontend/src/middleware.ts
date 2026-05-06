import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect admin routes — only ADMIN role allowed
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check employer routes
    if (path.startsWith("/employer") && token?.role !== "EMPLOYER") {
      if (token?.role === "ADMIN") return NextResponse.redirect(new URL("/admin/employers", req.url));
      return NextResponse.redirect(new URL("/seeker/dashboard", req.url));
    }

    // Check seeker routes
    if (path.startsWith("/seeker") && token?.role !== "SEEKER") {
      if (token?.role === "ADMIN") return NextResponse.redirect(new URL("/admin/employers", req.url));
      return NextResponse.redirect(new URL("/employer/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/employer/:path*", "/seeker/:path*"],
};
