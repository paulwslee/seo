import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { translationsCache } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
    }

    // 1. Check D1 Database Cache (AppFactory Lazy Cache Standard)
    const cached = await db.select().from(translationsCache)
      .where(and(
        eq(translationsCache.originalText, text),
        eq(translationsCache.targetLang, targetLang)
      ))
      .limit(1);

    if (cached.length > 0) {
      return NextResponse.json({ translatedText: cached[0].translatedText, cached: true });
    }

    // 2. Not in Cache -> Call Gemini API with OpenAI Fallback
    let translatedText = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Translate the following SEO technical text into ${targetLang}. Only return the translated text. 
      Keep the tone professional but easy for beginners to understand. 
      CRITICAL: You MUST preserve all markdown formatting, including code blocks (\`\`\`), backticks, and HTML tags exactly as they appear in the original text. Do NOT strip or translate HTML tags or code blocks.
      
      Text: ${text}`;
      
      const result = await model.generateContent(prompt);
      translatedText = result.response.text().trim();
    } catch (geminiErr: any) {
      console.warn(`[Translation] Gemini failed, falling back to OpenAI...`, geminiErr.message);
      
      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        throw new Error("Gemini failed and OPENAI_API_KEY is not configured for fallback.");
      }

      const promptText = `Translate the following SEO technical text into ${targetLang}. Only return the translated text. Keep the tone professional but easy for beginners to understand. CRITICAL: You MUST preserve all markdown formatting, including code blocks (\`\`\`), backticks, and HTML tags exactly as they appear in the original text. Do NOT strip or translate HTML tags or code blocks.\n\nText: ${text}`;
      
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: promptText }]
        })
      });

      if (!openAiRes.ok) {
        throw new Error(`OpenAI API error: ${openAiRes.statusText}`);
      }

      const responseData = await openAiRes.json();
      translatedText = responseData.choices[0]?.message?.content?.trim() || "";
    }

    // 3. Save to D1 Database permanently
    await db.insert(translationsCache).values({
      originalText: text,
      targetLang,
      translatedText,
    });

    return NextResponse.json({ translatedText, cached: false });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message || "Failed to translate" }, { status: 500 });
  }
}
