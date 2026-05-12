"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function updateContactEmail(newEmail: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Basic email validation
  if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return { error: "Invalid email address." };
  }

  try {
    // Check if email is already taken
    const existing = await db.select().from(users).where(eq(users.email, newEmail)).limit(1);
    if (existing.length > 0 && existing[0].id !== session.user.id) {
      return { error: "This email is already in use by another account." };
    }

    await db.update(users).set({ email: newEmail }).where(eq(users.id, session.user.id));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update email:", error);
    return { error: "Failed to update email. Please try again." };
  }
}
