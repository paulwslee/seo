"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts, verificationTokens, users, scanResults, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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

  // Promote a remaining account's details to the main User profile
  const remainingAccounts = userAccounts.filter(a => a.provider !== provider);
  
  let newEmail = null;
  let newName = null;
  let newImage = null;
  
  // Find the first remaining account that has a valid email in its id_token
  for (const account of remainingAccounts) {
    if (account.id_token) {
      try {
        const payload = JSON.parse(Buffer.from(account.id_token.split('.')[1], 'base64').toString());
        if (payload.email) {
          newEmail = payload.email;
          newName = payload.name;
          newImage = payload.picture;
          break; // Stop looking once we find a valid email
        }
      } catch (e) {
        console.error("Failed to parse remaining id_token", e);
      }
    }
  }
  
  // If no email was found in id_tokens (e.g. only Kakao is left), create a fallback fake email
  if (!newEmail && remainingAccounts.length > 0) {
    const firstAccount = remainingAccounts[0];
    newEmail = `${firstAccount.providerAccountId}@${firstAccount.provider}.com`;
    newName = `${firstAccount.provider} User`;
  }
  
  if (newEmail) {
    const updateData: any = { email: newEmail };
    // Fallback name to email if name is missing
    updateData.name = newName || newEmail;
    if (newImage) updateData.image = newImage;
    
    await db.update(users).set(updateData).where(eq(users.id, session.user.id));
  }
  
  return { success: true };
}

export async function deleteScan(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Verify the scan belongs to a project owned by the user
  const scan = await db.select().from(scanResults).where(eq(scanResults.id, scanId)).limit(1);
  if (!scan.length) return { error: "Scan not found" };

  const project = await db.select().from(projects).where(eq(projects.id, scan[0].projectId)).limit(1);
  if (!project.length || project[0].userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await db.delete(scanResults).where(eq(scanResults.id, scanId));
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDomain(domain: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const targetProjects = await db.select().from(projects).where(and(eq(projects.domain, domain), eq(projects.userId, session.user.id)));
  if (!targetProjects.length) return { error: "Domain not found or unauthorized" };

  const targetProjectIds = targetProjects.map(p => p.id);

  for (const pid of targetProjectIds) {
    await db.delete(scanResults).where(eq(scanResults.projectId, pid));
    await db.delete(projects).where(eq(projects.id, pid));
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}
