import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // Allow auth routes
      if (pathname.startsWith("/api/auth") || pathname.startsWith("/(auth)")) {
        return true;
      }

      // Require valid token for all other routes
      return !!token;
    },
  },
  pages: {
    signIn: "/(auth)/login",
  },
});

export const config = {
  matcher: ["/((?!api/_next|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};