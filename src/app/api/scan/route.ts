import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects, scanResults, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logApiUsage } from "@/lib/db/apiLogger";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    
    const userId = session?.user?.id || session?.user?.email;
    const effectiveUserId = userId || "anonymous";

    // Since we wrapped in auth(), req.json() works slightly differently. Use standard Request.
    // However, req is NextAuthRequest which extends Request.
    const body = await req.json();
    const { url } = scanSchema.parse(body);

    const targetUrl = new URL(url);
    const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;

    // --- Premium Feature Gating: 3 Projects Limit for Free Users ---
    if (userId) {
      const userDb = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
      const userPlan = userDb[0]?.plan || "free";

      if (userPlan === "free") {
        const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
        const projectExists = userProjects.some(p => p.domain === baseUrl);
        
        if (!projectExists && userProjects.length >= 3) {
          return NextResponse.json({ 
            error: "Free plan limit reached. You can only scan up to 3 different domains. Please upgrade to Premium for unlimited scans." 
          }, { status: 403 });
        }
      }
    }

    // Parallel fetching for main URL, robots.txt, and sitemap.xml
    const fetchHeaders = { 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    };

    const scraperApiKey = process.env.SCRAPER_API_KEY;
    const getScraperUrl = (targetUrl: string) => {
      if (scraperApiKey) {
        return `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}`;
      }
      return targetUrl;
    };

    let usedScraper = false;

    const fetchWithFallback = async (targetUrl: string, timeoutMs: number) => {
      try {
        const res = await fetch(targetUrl, { headers: fetchHeaders, signal: AbortSignal.timeout(timeoutMs) });
        if (res.ok) return res;
        
        // If forbidden/blocked, fallback to ScraperAPI
        if (scraperApiKey && (res.status === 403 || res.status === 503 || res.status === 401)) {
          console.log(`Direct fetch blocked (${res.status}) for ${targetUrl}. Falling back to ScraperAPI...`);
          usedScraper = true;
          return await fetch(getScraperUrl(targetUrl), { headers: fetchHeaders, signal: AbortSignal.timeout(timeoutMs + 10000) });
        }
        return res;
      } catch (err: any) {
        // On network error or timeout, fallback to ScraperAPI
        if (scraperApiKey) {
          console.log(`Direct fetch failed for ${targetUrl}. Falling back to ScraperAPI...`);
          usedScraper = true;
          return await fetch(getScraperUrl(targetUrl), { headers: fetchHeaders, signal: AbortSignal.timeout(timeoutMs + 10000) });
        }
        throw err;
      }
    };

    const [mainRes, robotsRes, sitemapRes] = await Promise.allSettled([
      fetchWithFallback(url, 10000),
      fetchWithFallback(`${baseUrl}/robots.txt`, 5000),
      fetchWithFallback(`${baseUrl}/sitemap.xml`, 5000)
    ]);

    if (mainRes.status === "rejected") {
      return NextResponse.json({ error: "Connection timeout. The website is too slow or blocking requests." }, { status: 400 });
    }
    
    if (!mainRes.value.ok) {
      const status = mainRes.value.status;
      let errMsg = `Failed to fetch the URL (HTTP ${status}). `;
      if (status === 403) errMsg += "The website is actively blocking our SEO scanner (Anti-Bot Protection).";
      else if (status === 404) errMsg += "The page could not be found.";
      
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const html = await mainRes.value.text();
    const $ = cheerio.load(html);

    // --- 1. Basic SEO ---
    const title = $("title").text().trim();
    const description = $("meta[name='description']").attr("content") || "";
    const h1Count = $("h1").length;
    const h1 = $("h1").first().text().trim();
    const canonical = $("link[rel='canonical']").attr("href") || "";

    // --- 2. Technical SEO (Robots/Sitemap) ---
    const hasRobots = robotsRes.status === "fulfilled" && robotsRes.value.ok;
    const hasSitemap = sitemapRes.status === "fulfilled" && sitemapRes.value.ok;

    // --- 3. Social SEO (OG & Twitter) ---
    const ogTitle = $("meta[property='og:title']").attr("content") || "";
    const ogImage = $("meta[property='og:image']").attr("content") || "";
    const twitterCard = $("meta[name='twitter:card']").attr("content") || "";

    // --- 4. Content SEO (Images & Headings) ---
    let missingAltCount = 0;
    const totalImages = $("img").length;
    $("img").each((_, el) => {
      if (!$(el).attr("alt")) missingAltCount++;
    });

    // Structure Results
    const results = {
      basicSeo: {
        status: (title && description && h1Count === 1) ? "pass" : "warning",
        title: title || "Missing",
        description: description || "Missing",
        h1: h1Count === 1 ? h1 : `Found ${h1Count} H1 tags (Should be exactly 1)`,
        canonical: canonical ? "pass" : "fatal"
      },
      technicalSeo: {
        status: (hasRobots && hasSitemap) ? "pass" : "warning",
        robotsTxt: hasRobots ? "Found" : "Missing",
        sitemapXml: hasSitemap ? "Found" : "Missing"
      },
      socialSeo: {
        status: (ogTitle && ogImage) ? "pass" : "warning",
        ogTags: (ogTitle && ogImage) ? "Found" : "Missing OG Title or Image",
        twitterCard: twitterCard ? "Found" : "Missing"
      },
      contentSeo: {
        status: missingAltCount === 0 ? "pass" : "warning",
        images: `Total: ${totalImages}, Missing Alt: ${missingAltCount}`
      },
      aiAdvice: ""
    };

    // --- 5. Generate AI Actionable Advice ---
    // Collect errors
    const issues = [];
    if (results.basicSeo.status !== "pass") issues.push(`Title/Desc/H1 issue.`);
    if (results.basicSeo.canonical === "fatal") issues.push(`Missing canonical tag.`);
    if (results.technicalSeo.status !== "pass") issues.push(`Missing robots.txt or sitemap.xml.`);
    if (results.socialSeo.status !== "pass") issues.push(`Missing OpenGraph or Twitter Card tags.`);
    if (results.contentSeo.status !== "pass") issues.push(`${missingAltCount} images missing alt tags.`);

    if (issues.length > 0) {
      const startTime = Date.now();
      let usedModel = "gemini-2.5-flash";
      try {
        const prompt = `
          The user is a beginner website owner. Their website (${url}) has the following SEO issues:
          ${issues.join("\n")}
          
          Write a concise, 3-sentence actionable advice explaining how to fix these issues. 
          Provide a generic HTML code snippet they can copy-paste to fix the meta tags or image alt tags.
          Format the output in clean Markdown.
        `;
        
        let aiResponseText = "";
        let pTokens = 0;
        let cTokens = 0;
        
        try {
          const model = genAI.getGenerativeModel({ model: usedModel });
          const aiResponse = await model.generateContent(prompt);
          aiResponseText = aiResponse.response.text();
          pTokens = aiResponse.response.usageMetadata?.promptTokenCount || 0;
          cTokens = aiResponse.response.usageMetadata?.candidatesTokenCount || 0;
        } catch (firstErr: any) {
          console.warn(`[SEO] ${usedModel} failed, trying fallback to OpenAI (gpt-4o-mini)...`, firstErr.message);
          usedModel = "gpt-4o-mini"; // For tracking

          const openAiKey = process.env.OPENAI_API_KEY;
          if (!openAiKey) {
            throw new Error("Gemini failed and OPENAI_API_KEY is not configured for fallback.");
          }

          const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are an expert SEO assistant." },
                { role: "user", content: prompt }
              ],
              max_tokens: 300,
              temperature: 0.7
            })
          });

          if (!openAiRes.ok) {
            const errData = await openAiRes.text();
            throw new Error(`OpenAI Fallback failed: ${openAiRes.status} ${errData}`);
          }

          const openAiData = await openAiRes.json();
          aiResponseText = openAiData.choices[0].message.content;
          pTokens = openAiData.usage?.prompt_tokens || 0;
          cTokens = openAiData.usage?.completion_tokens || 0;
        }

        results.aiAdvice = aiResponseText;
        
        const durationMs = Date.now() - startTime;
        await logApiUsage({
          userId: effectiveUserId !== "anonymous" ? effectiveUserId : null,
          serviceName: "SEO Compass",
          modelName: usedModel,
          promptType: "seo_analysis",
          targetId: url.substring(0, 50),
          durationMs,
          promptTokens: pTokens,
          completionTokens: cTokens
        });
      } catch (aiErr: any) {
        console.error("Gemini AI failed completely:", aiErr);
        results.aiAdvice = `AI Advice is currently unavailable. (Error: ${aiErr.message || "Unknown error"})`;
        
        const durationMs = Date.now() - startTime;
        await logApiUsage({
          userId: effectiveUserId !== "anonymous" ? effectiveUserId : null,
          serviceName: "SEO Compass",
          modelName: usedModel,
          promptType: "seo_analysis_error",
          targetId: url.substring(0, 50),
          durationMs,
          estimatedCost: 0
        });
      }
    } else {
      results.aiAdvice = "Perfect! Your website's SEO foundation is rock solid. Keep up the good work!";
    }

    // --- 6. Save Scan Results for Logged-In Users ---
    console.log(`[SEO] effectiveUserId: ${effectiveUserId}`);
    if (effectiveUserId !== "anonymous") {
      try {
        console.log(`[SEO] Searching for project...`);
        // Check if project exists
        const projectList = await db.select().from(projects).where(and(eq(projects.userId, effectiveUserId), eq(projects.domain, baseUrl)));
        let projectId = projectList.length > 0 ? projectList[0].id : crypto.randomUUID();

        if (projectList.length === 0) {
          console.log(`[SEO] Inserting new project for user ${effectiveUserId}...`);
          await db.insert(projects).values({
            id: projectId,
            userId: effectiveUserId,
            domain: baseUrl
          });
        }

        console.log(`[SEO] Inserting scan results...`);
        await db.insert(scanResults).values({
          id: crypto.randomUUID(),
          projectId: projectId,
          url: url,
          basicSeoJson: JSON.stringify({ ...results.basicSeo, usedScraper }),
          canonicalRiskJson: JSON.stringify({
            technicalSeo: results.technicalSeo,
            socialSeo: results.socialSeo,
            contentSeo: results.contentSeo,
            aiAdvice: results.aiAdvice
          })
        });
        console.log(`[SEO] Successfully saved scan results to DB!`);
      } catch (dbErr) {
        console.error("[SEO] Failed to save scan results:", dbErr);
        // We don't fail the request just because saving history failed
      }
    }

    return NextResponse.json({ success: true, url, usedScraper, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
});
