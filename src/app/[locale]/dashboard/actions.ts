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
  
  // Amazon SES is currently in Sandbox mode, so we cannot reliably send emails to iCloud/Gmail.
  // Using direct text confirmation for all providers for now.
  return { requiresConfirmation: true, message: `Please confirm to disconnect ${provider}.` };
}

export async function confirmDisconnect(provider: string, code?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, session.user.id));
  if (userAccounts.length <= 1) return { error: "Minimum 1 account required." };
  
  // All providers use text confirmation for now
  await db.delete(accounts).where(
    and(eq(accounts.userId, session.user.id), eq(accounts.provider, provider))
  );
  
  return { success: true };
}
