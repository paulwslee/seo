"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email"; // Wait, do we have an email sender?
import crypto from "crypto";

export async function requestDisconnect(provider: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, session.user.id));
  
  if (userAccounts.length <= 1) {
    return { error: "You must have at least one connected account to log in." };
  }
  
  const targetAccount = userAccounts.find(a => a.provider === provider);
  if (!targetAccount) return { error: "Account not connected" };
  
  // For Kakao, just return confirmation required
  if (provider === "kakao") {
    return { requiresConfirmation: true, message: "Please confirm to disconnect Kakao." };
  }
  
  // For Apple/Google, extract email
  let accountEmail = null;
  if (targetAccount.id_token) {
    try {
      const payload = JSON.parse(Buffer.from(targetAccount.id_token.split('.')[1], 'base64').toString());
      accountEmail = payload.email;
    } catch (e) {
      console.error("Failed to parse id_token", e);
    }
  }
  
  if (!accountEmail) {
    // If no email could be extracted, just fallback to simple confirmation
    return { requiresConfirmation: true, message: "Could not find account email. Please confirm to disconnect." };
  }
  
  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  await db.insert(verificationTokens).values({
    identifier: `disconnect_${session.user.id}_${provider}`,
    token: code,
    expires: new Date(Date.now() + 10 * 60 * 1000) as any, // 10 minutes
  });
  
  // Send email
  // Let's implement a simple email sender using nodemailer since we have process.env.EMAIL_SERVER
  await sendDisconnectEmail(accountEmail, code, provider);
  
  return { 
    requiresCode: true, 
    message: `A 6-digit code has been sent to ${accountEmail}.` 
  };
}

export async function confirmDisconnect(provider: string, code?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, session.user.id));
  if (userAccounts.length <= 1) return { error: "Minimum 1 account required." };
  
  if (provider === "kakao" || !code) {
    // Simple deletion if code is not required (e.g. Kakao)
    // Actually if Apple/Google couldn't find email, code is not passed.
    await db.delete(accounts).where(
      and(eq(accounts.userId, session.user.id), eq(accounts.provider, provider))
    );
    return { success: true };
  }
  
  // Verify code
  const result = await db.select().from(verificationTokens).where(
    and(
      eq(verificationTokens.identifier, `disconnect_${session.user.id}_${provider}`),
      eq(verificationTokens.token, code)
    )
  ).limit(1);
  
  if (result.length === 0) {
    return { error: "Invalid or expired code." };
  }
  
  // Delete token
  await db.delete(verificationTokens).where(
    eq(verificationTokens.identifier, `disconnect_${session.user.id}_${provider}`)
  );
  
  // Disconnect
  await db.delete(accounts).where(
    and(eq(accounts.userId, session.user.id), eq(accounts.provider, provider))
  );
  
  return { success: true };
}

async function sendDisconnectEmail(to: string, code: string, provider: string) {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "help@appfactorys.com",
    to,
    subject: `Security Code to disconnect ${provider} - SEO Compass`,
    text: `Your security code to disconnect your ${provider} account is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Security Code</h2>
        <p>You requested to disconnect your <strong>${provider}</strong> account from SEO Compass.</p>
        <p>Your verification code is:</p>
        <h1 style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; letter-spacing: 4px;">${code}</h1>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  });
}
