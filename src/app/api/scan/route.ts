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
  ignoreRobots: z.boolean().optional(),
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    const body = await req.json();
    const { url, ignoreRobots } = scanSchema.parse(body);

    const authId = session?.user?.id;
    const authEmail = session?.user?.email;
    const startTime = Date.now();

    const targetUrl = new URL(url);
    const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;

    let dbUser = null;
    if (authId || authEmail) {
      const usersFound = await db.select().from(users)
        .where(authId ? eq(users.id, authId) : eq(users.email, authEmail!))
        .limit(1);
      dbUser = usersFound[0];
    }

    const userPlan = dbUser?.plan || "free";
    const effectiveUserId = dbUser?.id || authEmail || "anonymous";

    // --- Premium Feature Gating: 3 Projects Limit for Free Users ---
    if (userPlan === "free" && dbUser) {
      const userProjects = await db.select().from(projects).where(eq(projects.userId, dbUser.id));
      const projectExists = userProjects.some(p => p.domain === baseUrl);
      
      if (!projectExists && userProjects.length >= 3) {
        return NextResponse.json({ 
          error: "Free plan limit reached. You can only scan up to 3 different domains. Please upgrade to Premium for unlimited scans." 
        }, { status: 403 });
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
      ignoreRobots ? Promise.reject("Ignored") : fetchWithFallback(`${baseUrl}/robots.txt`, 5000),
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
    const h1s: string[] = [];
    $("h1").each((i, el) => {
      h1s.push($(el).text().trim().replace(/\s+/g, ' ').substring(0, 60));
    });
    const h1 = h1s[0] || "";
    const canonical = $("link[rel='canonical']").attr("href") || "";

    // --- NEW: Indexability ---
    const robotsMeta = $("meta[name='robots']").attr("content")?.toLowerCase() || "";
    const isNoIndex = robotsMeta.includes("noindex");

    // --- 2. Technical SEO (Robots/Sitemap) ---
    const hasRobots = robotsRes.status === "fulfilled" && robotsRes.value.ok;
    let robotsTxtContent = "";
    if (hasRobots && robotsRes.status === "fulfilled") {
      try { robotsTxtContent = await robotsRes.value.text(); } catch(e){}
    }
    robotsTxtContent = robotsTxtContent.substring(0, 300).trim();

    const hasSitemap = sitemapRes.status === "fulfilled" && sitemapRes.value.ok;
    let sitemapXmlContent = "";
    if (hasSitemap && sitemapRes.status === "fulfilled") {
      try { sitemapXmlContent = await sitemapRes.value.text(); } catch(e){}
    }
    sitemapXmlContent = sitemapXmlContent.substring(0, 300).trim();

    // --- NEW: robots.txt Rule Parsing ---
    let isBlockedByRobots = false;
    if (hasRobots) {
      const lines = robotsTxtContent.toLowerCase().split('\n');
      let isGlobalAgent = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('user-agent:')) {
          const agent = trimmed.split(':')[1]?.trim();
          isGlobalAgent = agent === '*' || agent === 'googlebot';
        } else if (isGlobalAgent && trimmed.startsWith('disallow:')) {
          const path = trimmed.split(':')[1]?.trim();
          if (path === '/' || (path === '' && trimmed.endsWith(':'))) {
            isBlockedByRobots = true;
            break;
          }
        }
      }
    }

    // --- STOP SCAN IF BLOCKED (Unless Ignored) ---
    if (isBlockedByRobots && !ignoreRobots) {
      return NextResponse.json({ 
        error: "robotsBlockError",
        isRobotsBlock: true
      }, { status: 403 });
    }

    // --- 3. Social SEO (OG & Twitter) ---
    const ogTitle = $("meta[property='og:title']").attr("content") || "";
    const ogImage = $("meta[property='og:image']").attr("content") || "";
    const twitterCard = $("meta[name='twitter:card']").attr("content") || "";

    // --- 4. Content SEO (Images & Headings) ---
    let missingAltCount = 0;
    const totalImages = $("img").length;
    const missingAltExamples: string[] = [];
    $("img").each((_, el) => {
      if (!$(el).attr("alt")) {
        missingAltCount++;
        const src = $(el).attr("src") || "unknown";
        if (missingAltExamples.length < 3) {
          missingAltExamples.push(src.length > 50 ? src.substring(0, 50) + "..." : src);
        }
      }
    });

    // --- SEO Score Calculation ---
    let score = 100;
    if (isNoIndex) score -= 50;
    if (isBlockedByRobots) score -= 50;
    if (!title) score -= 20;
    if (!description) score -= 10;
    if (h1Count !== 1) score -= 15;
    if (!canonical) score -= 10;
    if (!hasRobots && !ignoreRobots) score -= 5;
    if (!hasSitemap) score -= 5;
    if (!ogTitle || !ogImage) score -= 5;
    if (missingAltCount > 0) score -= Math.min(10, missingAltCount * 2);
    score = Math.max(0, score);

    let duplicationReasonKey = "";
    if (h1Count > 1 && !canonical) duplicationReasonKey = "reasonBoth";
    else if (h1Count > 1) duplicationReasonKey = "reasonH1";
    else if (!canonical) duplicationReasonKey = "reasonCanonical";
    
    const duplicationRisk = (h1Count > 1 || !canonical) ? "High Risk" : "Safe";

    // Structure Results
    const results = {
      score,
      indexability: (isNoIndex || isBlockedByRobots) 
        ? (isNoIndex ? "Blocked (Noindex)" : "Blocked by robots.txt") 
        : "Indexable",
      duplicationRisk,
      duplicationReasonKey,
      basicSeo: {
        status: (title && description && h1Count === 1) ? "pass" : "warning",
        title: title || "Missing",
        description: description || "Missing",
        h1: h1Count === 1 ? h1 : (h1Count === 0 ? "Missing" : `Found ${h1Count} H1 tags (Should be exactly 1)`),
        canonical: canonical ? "pass" : "fatal",
        canonicalUrl: canonical
      },
      technicalSeo: {
        status: (ignoreRobots || (hasRobots && hasSitemap)) ? "pass" : "warning",
        robotsTxt: ignoreRobots ? "Ignored" : (hasRobots ? "Found" : "Missing"),
        robotsTxtContent: ignoreRobots ? "User opted to ignore robots.txt" : robotsTxtContent,
        sitemapXml: hasSitemap ? "Found" : "Missing",
        sitemapXmlContent
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
    } as any;

    // --- 5. Generate Actionable Advice (Rule-based) ---
    const actionPlan = [];
    if (isBlockedByRobots) {
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: "blockedByRobots",
        current: "robots.txt contains 'Disallow: /' rules blocking search engines"
      });
    }
    if (!title) {
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: "missingTitle",
        current: "No <title> found in <head>"
      });
    }
    if (!description) {
      actionPlan.push({ 
        priority: "warning", 
        errorKey: "missingDescription",
        current: "No <meta name='description'> found"
      });
    }
    if (h1Count !== 1) {
      let currentText = `${h1Count} <h1> tags found`;
      if (h1Count > 1) {
        currentText += `:\n` + h1s.map((text, i) => `[${i + 1}] ${text || "(Empty Text)"}`).join('\n');
      }
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: h1Count === 0 ? "missingH1" : "multipleH1s",
        current: currentText
      });
    }
    if (!canonical) {
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: "missingCanonical",
        current: "No <link rel='canonical'> found"
      });
    }
    if ((!hasRobots && !ignoreRobots) || !hasSitemap) {
      actionPlan.push({ 
        priority: "warning", 
        errorKey: "missingRobotsSitemap",
        current: `robots.txt: ${ignoreRobots ? "Ignored" : (hasRobots ? "Found" : "Missing")}, sitemap.xml: ${hasSitemap ? "Found" : "Missing"}`
      });
    }
    if (!ogTitle || !ogImage) {
      actionPlan.push({ 
        priority: "opportunity", 
        errorKey: "missingOg",
        current: "Missing og:title or og:image"
      });
    }
    if (missingAltCount > 0) {
      let currentText = `${missingAltCount} images missing alt text`;
      if (missingAltExamples.length > 0) {
        currentText += `\n\nExamples:\n` + missingAltExamples.map(src => `- ${src}`).join('\n');
      }
      actionPlan.push({ 
        priority: "warning", 
        errorKey: "missingAlt",
        current: currentText
      });
    }

    results.actionPlan = actionPlan;
    results.aiAdvice = actionPlan.length === 0 ? "Perfect! Your website's SEO foundation is rock solid. Keep up the good work!" : "";

    // Record the scan in API logs (0 tokens, 0 cost) to track usage volume
    await logApiUsage({
      userId: effectiveUserId !== "anonymous" ? effectiveUserId : null,
      serviceName: "SEO Compass",
      modelName: "rule-based",
      promptType: "seo_analysis",
      targetId: url.substring(0, 50),
      durationMs: Date.now() - startTime, // Minimal duration for tracking
      promptTokens: 0,
      completionTokens: 0,
      estimatedCost: 0
    });

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
            score: results.score,
            indexability: results.indexability,
            duplicationRisk: results.duplicationRisk,
            duplicationReasonKey: results.duplicationReasonKey,
            technicalSeo: results.technicalSeo,
            socialSeo: results.socialSeo,
            contentSeo: results.contentSeo,
            actionPlan: results.actionPlan,
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
// Forced refresh to fix translation sync: 2026-05-12
});
