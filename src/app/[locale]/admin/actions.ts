"use server";

import { db } from "@/lib/db";
import { systemConfigs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }
}

export async function updateSystemConfig(key: string, value: string, description?: string) {
  await verifyAdmin();
  
  // Check if exists
  const existing = await db.select().from(systemConfigs).where(eq(systemConfigs.key, key));
  
  if (existing.length > 0) {
    await db.update(systemConfigs)
      .set({ value, description, updatedAt: new Date() })
      .where(eq(systemConfigs.key, key));
  } else {
    await db.insert(systemConfigs).values({ key, value, description });
  }
  
  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserPlan(userId: string, plan: string) {
  await verifyAdmin();
  
  await db.update(users).set({ plan }).where(eq(users.id, userId));
  
  revalidatePath("/admin");
  return { success: true };
}
