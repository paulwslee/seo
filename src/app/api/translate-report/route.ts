import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logApiUsage } from "@/lib/db/apiLogger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const maxDuration = 60; // 1 minute is plenty for just translation

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    const body = await req.json();
    const { scanId, targetLang } = body;

    if (!scanId || !targetLang) {
      return NextResponse.json({ error: "Missing scanId or targetLang" }, { status: 400 });
    }

    const effectiveUserId = session?.user?.id || session?.user?.email || "anonymous";

    // 1. Fetch existing scan
    const scans = await db.select().from(scanResults).where(eq(scanResults.id, scanId)).limit(1);
    if (scans.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }
    const scan = scans[0];

    // 2. Parse auditJson
    let auditObj: any = {};
    try {
      auditObj = JSON.parse(scan.auditJson);
    } catch(e) {
      return NextResponse.json({ error: "Invalid audit JSON in database" }, { status: 500 });
    }

    // Support legacy flat format (pre-multi-language support)
    if (!auditObj["en"]) {
       const legacyData = { ...auditObj };
       auditObj = { "en": legacyData };
    }

    // 3. Check if translation already exists
    if (auditObj[targetLang]) {
      return NextResponse.json({ success: true, message: "Already translated", data: auditObj[targetLang] });
    }

    const englishMaster = auditObj["en"];
    if (!englishMaster || !englishMaster.deck) {
      return NextResponse.json({ error: "No English master deck found to translate" }, { status: 400 });
    }

    console.log(`[SEO-Translate] Translating report ${scanId} to ${targetLang}...`);

    // 4. Send to Gemini for structural translation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const startTime = Date.now();
    const prompt = `You are a professional technical translator.
    I will provide a complex JSON object containing an SEO Technical Audit Report.
    Your task is to translate ONLY the string values (descriptions, titles, advice, etc.) into ${targetLang}.
    
    CRITICAL RULES:
    1. Keep the exact same JSON schema, object keys, and array lengths. Do NOT change keys.
    2. Keep technical terms (like 'sitemap.xml', 'H1', 'CSR', bash commands, etc.) in English.
    3. Do not omit any properties.
    4. Return ONLY the translated JSON object.
    
    Source JSON:
    ${JSON.stringify(englishMaster.deck)}
    `;

    const aiRes = await model.generateContent(prompt);
    let rawOutput = aiRes.response.text();
    
    let cleanedJson = rawOutput.trim();
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    let translatedDeck: any = {};
    try {
      translatedDeck = JSON.parse(cleanedJson);
    } catch(e) {
      console.error("[SEO-Translate] Failed to parse translation:", e);
      return NextResponse.json({ error: "Translation produced invalid JSON format" }, { status: 500 });
    }

    // 5. Update Database
    auditObj[targetLang] = {
      ...englishMaster,
      deck: translatedDeck
    };

    await db.update(scanResults).set({
      auditJson: JSON.stringify(auditObj)
    }).where(eq(scanResults.id, scanId));

    // 6. Log usage
    await logApiUsage({
      userId: effectiveUserId !== "anonymous" ? effectiveUserId : null,
      serviceName: "SEO Compass",
      modelName: "gemini-2.5-flash",
      promptType: "structural_translation",
      targetId: scanId,
      durationMs: Date.now() - startTime,
      promptTokens: aiRes.response.usageMetadata?.promptTokenCount || 0,
      completionTokens: aiRes.response.usageMetadata?.candidatesTokenCount || 0,
      estimatedCost: 0
    });

    console.log(`[SEO-Translate] Success!`);
    return NextResponse.json({ success: true, data: auditObj[targetLang] });

  } catch (error: any) {
    console.error("[SEO-Translate] Error:", error);
    return NextResponse.json({ error: error.message || "Translation failed" }, { status: 500 });
  }
});
