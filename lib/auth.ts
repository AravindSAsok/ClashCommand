import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { db } = await import("./db");
        const { users } = await import("../db/schema");
        const { eq } = await import("drizzle-orm");

        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        // Bootstrap the first admin only when the submitted credentials exactly
        // match the private values configured in the server environment.
        if (
          !user &&
          process.env.ADMIN_EMAIL &&
          process.env.ADMIN_PASSWORD &&
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          const passwordHash = await bcrypt.hash(credentials.password, 12);
          await db
            .insert(users)
            .values({
              email: credentials.email,
              name: "Administrator",
              passwordHash,
            })
            .onConflictDoNothing();

          [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);
        }

        if (!user?.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
