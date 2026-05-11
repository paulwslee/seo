import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Kakao from "next-auth/providers/kakao";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, authenticators } from "@/lib/db/schema";

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
  Apple({
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_PRIVATE_KEY, // Note: Apple setup in Auth.js may require specific formatting of the private key
    allowDangerousEmailAccountLinking: true,
  }),
  Kakao({
    clientId: process.env.NEXT_PUBLIC_KAKAO_API_KEY,
    clientSecret: process.env.NEXT_PUBLIC_KAKAO_SECRET_KEY,
    allowDangerousEmailAccountLinking: true,
  }),
];

if (process.env.EMAIL_SERVER) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      
      // Fallback for Apple/Kakao if email isn't in DB user but is in profile
      if (!token.email && profile?.email) {
        token.email = profile.email;
      }
      
      return token;
    },
    async session({ session, token }) {

      if (token.id && session.user) {
        session.user.id = token.id as string;
      } else if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.email && session.user) {
        session.user.email = token.email as string;
      }
      
      return session;
    },
  },
  debug: true,
});
