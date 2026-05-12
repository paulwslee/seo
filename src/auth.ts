import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Kakao from "next-auth/providers/kakao";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, authenticators } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
    clientId: process.env.NEXT_PUBLIC_KAKAO_API_KEY as string,
    clientSecret: process.env.NEXT_PUBLIC_KAKAO_SECRET_KEY as string,
    allowDangerousEmailAccountLinking: true,
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname,
        email: profile.kakao_account?.email || `${profile.id}@kakao.com`,
        image: profile.kakao_account?.profile?.profile_image_url || profile.properties?.profile_image,
        plan: "free",
      };
    },
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
  adapter: {
    async createUser(user) {
      const id = user.id || crypto.randomUUID();
      await db.insert(users).values({
        id: id,
        name: user.name,
        email: user.email,
        image: user.image,
        plan: "free",
        createdAt: new Date() as any,
      });
      return { ...user, id, plan: "free" } as any;
    },
    async getUser(id) {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] as any;
    },
    async getUserByEmail(email) {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] as any;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const result = await db
        .select({ user: users })
        .from(accounts)
        .innerJoin(users, eq(accounts.userId, users.id))
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          )
        )
        .limit(1);
      
      return result[0]?.user as any;
    },
    async linkAccount(account) {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    },
  } as any,
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
      
      // Fallback for Kakao profile structure
      if (account?.provider === 'kakao' && profile) {
        const kakaoId = profile.id || (profile as any).sub;
        const email = (profile as any).kakao_account?.email || `${kakaoId}@kakao.com`;
        if (!token.email) token.email = email;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
