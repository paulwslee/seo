import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Kakao from "next-auth/providers/kakao";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, authenticators } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

import { SignJWT, importPKCS8 } from "jose";

let appleSecret = "";
let appleSecretGeneratedAt = 0;

async function getAppleClientSecret() {
  const now = Date.now();
  // Refresh if older than 30 days
  if (appleSecret && (now - appleSecretGeneratedAt < 30 * 24 * 60 * 60 * 1000)) {
    return appleSecret;
  }
  
  if (!process.env.APPLE_PRIVATE_KEY || !process.env.APPLE_TEAM_ID || !process.env.APPLE_CLIENT_ID || !process.env.APPLE_KEY_ID) {
    return process.env.APPLE_PRIVATE_KEY || "";
  }
  
  try {
    const privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const privateKeyObj = await importPKCS8(privateKey, 'ES256');

    appleSecret = await new SignJWT({})
      .setAudience('https://appleid.apple.com')
      .setIssuer(process.env.APPLE_TEAM_ID)
      .setSubject(process.env.APPLE_CLIENT_ID)
      .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })
      .setIssuedAt()
      .setExpirationTime('180d')
      .sign(privateKeyObj);
    appleSecretGeneratedAt = now;
  } catch (error) {
    console.error("Failed to generate Apple client secret:", error);
    return process.env.APPLE_PRIVATE_KEY || "";
  }
  
  return appleSecret;
}

const appleSecretForAuth = await getAppleClientSecret();

const useSecureCookies = process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
  Apple({
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: appleSecretForAuth,
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
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
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
