import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { apiUsageLogs, users } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const maxDuration = 30; // 30 seconds max

export async function POST(req: Request) {
  try {
    const session = await auth();
    console.log("[DEBUG seo-ai] session object:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.email && !session?.user?.id) {
      console.log("[DEBUG seo-ai] Unauthorized because session or user ID/email is missing.");
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { prompt, errorKey, current, expected, locale, url } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Freemium Logic
    let userId = session.user.id;
    let userPlan = "free";
    
    if (userId) {
      const userRecords = await db.select().from(users).where(eq(users.id, userId));
      userPlan = userRecords[0]?.plan || "free";
    } else if (session.user.email) {
      const userRecords = await db.select().from(users).where(eq(users.email, session.user.email));
      if (userRecords.length > 0) {
        userId = userRecords[0].id;
        userPlan = userRecords[0].plan || "free";
      }
    }

    if (!userId) {
      // Fallback if user doesn't exist in DB somehow
      userId = "anonymous_logged_in";
    }

    if (userPlan === "free") {
      // Check usage for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const usageResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(apiUsageLogs)
        .where(
          and(
            eq(apiUsageLogs.userId, userId),
            eq(apiUsageLogs.serviceName, "SEO Copywriter"),
            gte(apiUsageLogs.createdAt, startOfMonth)
          )
        );

      const monthlyUsage = usageResult[0]?.count || 0;
      
      // Limit to 3 free generations per month
      if (monthlyUsage >= 3) {
        return NextResponse.json(
          { 
            error: "Free limit reached. Upgrade to Premium for unlimited AI Copywriting.", 
            code: "LIMIT_REACHED" 
          },
          { status: 403 }
        );
      }
    }

    const startTime = Date.now();

    const systemPrompt = `You are a world-class, premium SEO expert and copywriter.
The user has an SEO error: "${errorKey}".
Current State: ${current || 'None'}
Expected State: ${expected || 'None'}
Target Website URL: ${url || 'Not provided'}
User Request: ${prompt}

Task: Provide the EXACT, copy-pasteable HTML tags or highly optimized text that fixes this issue. 
CRITICAL RULE 1: The user is asking for tailored examples. You MUST use the user's "Target Website URL" (${url || 'their domain'}) inside your code examples. 
DO NOT use generic placeholders like [Your Domain], [URL], or example.com unless strictly necessary. Provide the exact string they need to copy and paste.

CRITICAL RULE 2 (SEO SAFETY & EDUCATIONAL EXAMPLES): Many users are absolute beginners. 
- If the tag is PAGE-SPECIFIC (such as <link rel="canonical"> or specific <title> tags), you MUST add a very prominent WARNING stating that this specific code should ONLY be applied to this specific page, and applying it globally to all pages (e.g., in a common header) will ruin their SEO.
- If the error is related to "Canonical URL" (e.g., missing canonical, canonical mismatch, etc.), you MUST provide extremely beginner-friendly extra examples. Explain clearly that "each individual page must point to its own representative URL."
  -> Example 1 (Paths): Show that the product 1 page must point to \`/product_1\`, product 2 to \`/product_2\`, the help page to \`/help\`, etc.
  -> Example 2 (WWW vs Non-WWW): Explain that \`www.yourdomain.com\` and \`yourdomain.com\` are treated as different pages by search engines. Show an example that if both show the same content, they must both have a canonical tag pointing to the SAME representative domain (e.g., the one with www or without).

Keep your response extremely professional, concise, and directly actionable. 
Do not write long explanations unless it is the beginner-friendly examples requested in CRITICAL RULE 2. 
Respond in ${locale === 'ko' ? 'Korean' : 'English'}. Format using Markdown.`;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: "Fix my SEO issue with an optimized copy.",
      onFinish: async ({ usage }) => {
        try {
          await db.insert(apiUsageLogs).values({
            id: crypto.randomUUID(),
            userId: userId,
            serviceName: "SEO Copywriter",
            modelName: "gemini-2.5-flash",
            promptType: "seo_copywrite",
            targetId: errorKey,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            durationMs: Date.now() - startTime,
          });
        } catch (dbErr) {
          console.error("Failed to log AI Copywriter usage:", dbErr);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("[SEO AI] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
