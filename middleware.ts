import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/api/auth/")
      ) return true;

      if (!token) return false;

      // Viewer accounts may read data but cannot call any write API.
      if (
        pathname.startsWith("/api/") &&
        !["GET", "HEAD", "OPTIONS"].includes(req.method)
      ) {
        return token.role === "admin";
      }

      return true;
    },
  },
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};