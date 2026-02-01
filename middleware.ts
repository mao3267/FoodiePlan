import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/plan/:path*",
    "/cart/:path*",
    "/settings/:path*",
    "/api/recipes/:path*",
    "/api/meals/:path*",
    "/api/ingredients/:path*",
    "/api/ai/:path*",
    "/api/user/:path*",
  ],
};
