import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { authConfig } from "./auth.config";

/**
 * Separate MongoClient for Auth.js adapter.
 * Uses mongodb@6 (matching @auth/mongodb-adapter's bson version)
 * instead of mongoose's mongodb@7 client to avoid BSON version conflicts.
 */
let client: MongoClient | null = null;

function getMongoClient(): MongoClient {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
  }
  return client;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(getMongoClient()),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
