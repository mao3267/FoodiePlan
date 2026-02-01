import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe auth config (no Mongoose imports).
 * Used by middleware.ts which runs in the Edge Runtime.
 */
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith("/plan") ||
        nextUrl.pathname.startsWith("/cart") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/api/recipes") ||
        nextUrl.pathname.startsWith("/api/meals") ||
        nextUrl.pathname.startsWith("/api/ingredients") ||
        nextUrl.pathname.startsWith("/api/ai") ||
        nextUrl.pathname.startsWith("/api/user");

      if (isOnProtectedRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
};
