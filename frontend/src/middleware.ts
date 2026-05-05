import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check employer routes
    if (path.startsWith("/employer") && token?.role !== "EMPLOYER") {
      return NextResponse.redirect(new URL("/seeker/dashboard", req.url));
    }

    // Check seeker routes
    if (path.startsWith("/seeker") && token?.role !== "SEEKER") {
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
  matcher: ["/employer/:path*", "/seeker/:path*"],
};
