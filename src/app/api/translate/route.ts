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

    // 2. Not in Cache -> Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Translate the following SEO technical text into ${targetLang}. Only return the translated text. Do not add quotes, markdown, or any conversational text. Keep the tone professional but easy for beginners to understand. Do not translate any HTML tags or code blocks.\n\nText: ${text}`;
    
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

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
