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
    clientSecret: process.env.APPLE_PRIVATE_KEY, // Auth.js can handle the raw private key in v5 if formatted properly, or we rely on the internal generation
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
      sendVerificationRequest: async (params) => {
        const { identifier, url, provider, theme } = params;
        const { host } = new URL(url);
        // Using dynamic import so we don't need to add it to the top of the file
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(provider.server);
        
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to SEO Compass`,
          text: `Sign in to SEO Compass\n${url}\n\n`,
          html: `
<body style="background: #f9fafb; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; background: linear-gradient(135deg, #2563eb, #1d4ed8);">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">SEO Compass</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">Welcome to SEO Compass</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">Click the button below to sign in to your account. This magic link is secure and will expire in 15 minutes.</p>
              
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 6px;" bgcolor="#2563eb">
                    <a href="${url}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 14px 32px; border: 1px solid #2563eb; display: inline-block; font-weight: 600;">Sign In Securely</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; margin: 30px 0 10px 0; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; word-break: break-all; text-align: left;">
                <a href="${url}" style="color: #2563eb; font-size: 13px; text-decoration: underline;">${url}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 40px 40px 40px;">
              <p style="color: #9ca3af; margin: 0; font-size: 13px; line-height: 1.5;">If you did not request this email, you can safely ignore it.</p>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 13px;">&copy; ${new Date().getFullYear()} SEO Compass by AppFactorys. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>`
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      }
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
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    state: {
      name: `${cookiePrefix}authjs.state`,
      options: {
        httpOnly: true,
        sameSite: useSecureCookies ? "none" : "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
    nonce: {
      name: `${cookiePrefix}authjs.nonce`,
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
    async updateUser(user) {
      if (!user.id) throw new Error("User id is required");
      const updateData: any = {};
      if (user.emailVerified !== undefined) updateData.emailVerified = user.emailVerified;
      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.image !== undefined) updateData.image = user.image;
      
      await db.update(users).set(updateData).where(eq(users.id, user.id));
      const result = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
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
    async createVerificationToken(verificationToken) {
      await db.insert(verificationTokens).values({
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires as any,
      });
      return verificationToken as any;
    },
    async useVerificationToken({ identifier, token }) {
      const result = await db.select().from(verificationTokens).where(
        and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token))
      ).limit(1);
      
      if (result.length > 0) {
        await db.delete(verificationTokens).where(
          and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token))
        );
        return result[0] as any;
      }
      return null;
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
