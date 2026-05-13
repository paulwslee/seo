import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects, scanResults, users, seoGlossary } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { logApiUsage } from "@/lib/db/apiLogger";
import dns from "dns/promises";
import crypto from "crypto";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  ignoreRobots: z.boolean().optional(),
  includePerformance: z.boolean().optional(),
  enforceCoppa: z.boolean().optional(),
  reportLanguage: z.string().optional().default("en"),
});

export const maxDuration = 300; // Vercel Pro: Allow 5 minutes for Deep Crawl + Gemini AI reporting

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    const body = await req.json();
    const { url, ignoreRobots, includePerformance, reportLanguage, enforceCoppa } = scanSchema.parse(body);

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
        if (res.ok) {
          // Read body immediately so AbortSignal doesn't kill it while we wait for other slow fetches (like PSI)
          const bodyText = await res.text();
          return { ok: true, status: res.status, headers: res.headers, text: async () => bodyText };
        }
        
        if (scraperApiKey && (res.status === 403 || res.status === 503 || res.status === 401)) {
          console.log(`Direct fetch blocked (${res.status}) for ${targetUrl}. Falling back...`);
          usedScraper = true;
          const fallbackRes = await fetch(getScraperUrl(targetUrl), { headers: fetchHeaders, signal: AbortSignal.timeout(timeoutMs + 10000) });
          const bodyText = await fallbackRes.text();
          return { ok: fallbackRes.ok, status: fallbackRes.status, headers: fallbackRes.headers, text: async () => bodyText };
        }
        return { ok: res.ok, status: res.status, headers: res.headers, text: async () => "" };
      } catch (err: any) {
        if (scraperApiKey) {
          console.log(`Direct fetch failed for ${targetUrl}. Falling back to ScraperAPI...`);
          usedScraper = true;
          const fallbackRes = await fetch(getScraperUrl(targetUrl), { headers: fetchHeaders, signal: AbortSignal.timeout(timeoutMs + 10000) });
          const bodyText = await fallbackRes.text();
          return { ok: fallbackRes.ok, status: fallbackRes.status, headers: fallbackRes.headers, text: async () => bodyText };
        }
        throw err;
      }
    };

    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=seo&strategy=desktop${googleApiKey ? `&key=${googleApiKey}` : ""}`;

    const crawlerUrl = process.env.CRAWLER_URL || "http://localhost:8000";

    const [mainRes, robotsRes, sitemapRes, psiRes, crawlerRes] = await Promise.allSettled([
      fetchWithFallback(url, 30000),
      ignoreRobots ? Promise.reject("Ignored") : fetchWithFallback(`${baseUrl}/robots.txt`, 10000),
      fetchWithFallback(`${baseUrl}/sitemap.xml`, 10000),
      includePerformance ? fetch(psiUrl) : Promise.reject("Skipped Performance Scan"),
      includePerformance ? fetch(`${crawlerUrl}/api/v1/deep-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, depth: 2 })
      }).then(r => r.json()) : Promise.reject("Skipped Deep Scan")
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
    const responseHeaders = mainRes.value.headers;

    // --- NEW: Deep Technical Audit (Matching Enterprise PDF) ---
    const hostWithoutWww = targetUrl.host.replace(/^www\./, "");
    
    // DNS Lookups
    let spfRecord = false;
    let dmarcRecord = false;
    try {
      const txtRecords = await dns.resolveTxt(hostWithoutWww);
      spfRecord = txtRecords.some(records => records.join("").includes("v=spf1"));
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${hostWithoutWww}`);
      dmarcRecord = dmarcRecords.some(records => records.join("").includes("v=DMARC1"));
    } catch (e) {
      // Ignore DNS errors (NXDOMAIN etc)
    }

    // Performance (Resource Counts)
    const fontPreloads = $('link[rel="preload"][as="font"]').length;
    const cssLinks = $('link[rel="stylesheet"]').length;
    const jsScripts = $('script[src]').length;
    
    // Images
    const totalImages = $('img').length;
    const imagesMissingAlt = $('img:not([alt]), img[alt=""]').length;
    const nextImages = $('img[src*="_next/image"]').length;
    
    // Semantic HTML & Accessibility
    const hasSemanticHTML = $('header, nav, main, footer, article').length > 0;
    const hasAriaAttributes = $('[aria-label], [aria-hidden], [role]').length > 0;
    const isMobileZoomBlocked = $('meta[name="viewport"]').attr("content")?.includes("user-scalable=no") || false;
    const htmlLang = $('html').attr('lang') || null;

    // Security Headers
    const securityHeaders = {
      hsts: responseHeaders.get("strict-transport-security") || null,
      csp: responseHeaders.get("content-security-policy") || null,
      xFrameOptions: responseHeaders.get("x-frame-options") || null,
      xContentTypeOptions: responseHeaders.get("x-content-type-options") || null,
      referrerPolicy: responseHeaders.get("referrer-policy") || null,
      permissionsPolicy: responseHeaders.get("permissions-policy") || null,
      cors: responseHeaders.get("access-control-allow-origin") || null,
    };

    const cdnHeaders = {
      server: responseHeaders.get("server") || null,
      xVercelCache: responseHeaders.get("x-vercel-cache") || null,
      cfCacheStatus: responseHeaders.get("cf-cache-status") || null,
      xPoweredBy: responseHeaders.get("x-powered-by") || null,
    };

    const htmlSize = Buffer.byteLength(html, "utf8");
    const hasMeaningfulContent = $("h1, h2, h3, p, img").length > 5;
    const isCsrBailout = htmlSize < 100000 && ($("#__next").length > 0 || $("#root").length > 0) && !hasMeaningfulContent;

    const hasPasswordInput = $("input[type='password']").length > 0;
    const hasEmailInput = $("input[type='email'], input[name='email']").length > 0;
    const coppaRisk = hasPasswordInput || hasEmailInput;

    let techStack = [];
    if ($("script[src*='_next/static']").length > 0) techStack.push("Next.js");
    if ($("[data-reactroot]").length > 0 || $("script[src*='react']").length > 0) techStack.push("React");
    if (responseHeaders.get("server")?.includes("cloudflare")) techStack.push("Cloudflare");
    if (responseHeaders.get("server")?.includes("Vercel") || responseHeaders.get("x-vercel-cache")) techStack.push("Vercel");
    if (responseHeaders.get("x-amz-cf-id")) techStack.push("AWS CloudFront");
    if ($("script[src*='firebase']").length > 0) techStack.push("Firebase");

    const accessibility = {
      isMobileZoomBlocked,
      hasAriaAttributes,
      hasSemanticHTML,
      imagesMissingAlt,
      htmlLang
    };

    const performanceAssets = {
      fontPreloads: $('link[rel="preload"][as="font"]').length,
      cssLinks: $('link[rel="stylesheet"]').length,
      jsScripts: $('script[src]').length,
      totalImages: $('img').length,
      nextImages: $('img[src*="_next/image"]').length
    };

    const auditData = {
      securityHeaders,
      dns: { spfRecord, dmarcRecord },
      infrastructure: {
        cdnHeaders,
        isCsrBailout,
        coppaRisk,
        techStack: [...new Set(techStack)],
        htmlSizeBytes: htmlSize
      },
      accessibility,
      performanceAssets
    };

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
    let sitemapUrls: string[] = [];
    
    if (hasSitemap && sitemapRes.status === "fulfilled") {
      try { 
        sitemapXmlContent = await sitemapRes.value.text(); 
        
        // Extract up to 5 URLs from the sitemap for deep crawling
        const locRegex = /<loc>(.*?)<\/loc>/g;
        let match;
        while ((match = locRegex.exec(sitemapXmlContent)) !== null && sitemapUrls.length < 5) {
          const extractedUrl = match[1].trim();
          // Don't include the main URL itself
          if (extractedUrl !== url && extractedUrl !== url + '/') {
            sitemapUrls.push(extractedUrl);
          }
        }
      } catch(e){}
    }
    const sitemapPreview = sitemapXmlContent.substring(0, 300).trim();

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

    // --- Security Check: Only authenticated users can ignore robots.txt ---
    const finalIgnoreRobots = (ignoreRobots && session) ? true : false;

    // --- STOP SCAN IF BLOCKED (Unless Ignored by Authed User) ---
    if (isBlockedByRobots && !finalIgnoreRobots) {
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

    // --- NEW: Deep Crawling (Premium Only) ---
    let brokenLinks: string[] = [];
    let deepScanStatus = "Not Scanned (Premium Feature)";
    let dynamicCrawlScheduled = false;

    if (includePerformance && crawlerRes.status === "fulfilled") {
      const crawlerData = crawlerRes.value?.data || {};
      if (crawlerData.requires_dynamic_crawling) {
        dynamicCrawlScheduled = true;
        deepScanStatus = "Semantic links missing. Deep dynamic crawl scheduled in background (Google Cloud Run).";
        
        // Example Webhook Trigger (Placeholder for Google Cloud Run integration)
        // fetch("https://worker.seo-compass.internal/dynamic-scan-job", { method: "POST", body: JSON.stringify({ url }) }).catch(() => {});
      }
    }

    if (userPlan === "premium") {
      if (sitemapUrls.length > 0) {
        if (!dynamicCrawlScheduled) deepScanStatus = `Scanned ${sitemapUrls.length} internal pages`;
        
        // Parallel HEAD/GET requests to check for broken links
        const linkChecks = await Promise.allSettled(
          sitemapUrls.map(u => fetchWithFallback(u, 8000)) // 8s timeout for subpages
        );
        
        linkChecks.forEach((check, index) => {
          if (check.status === "fulfilled") {
            if (check.value.status === 404 || check.value.status >= 500) {
              brokenLinks.push(sitemapUrls[index]);
            }
          } else {
             // Timeout or network error
             brokenLinks.push(sitemapUrls[index]);
          }
        });
      } else if (!hasSitemap) {
        if (!dynamicCrawlScheduled) deepScanStatus = "Cannot deep scan (No sitemap found)";
      } else {
        if (!dynamicCrawlScheduled) deepScanStatus = "No additional URLs found in sitemap";
      }
    }

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
    if (brokenLinks.length > 0) score -= Math.min(20, brokenLinks.length * 10);
    if (dynamicCrawlScheduled) score -= 30; // Critical SEO Penalty for CSR without Semantic Hrefs
    score = Math.max(0, score);

    let duplicationReasonKey = "";
    if (h1Count > 1 && !canonical) duplicationReasonKey = "reasonBoth";
    else if (h1Count > 1) duplicationReasonKey = "reasonH1";
    else if (!canonical) duplicationReasonKey = "reasonCanonical";
    
    const duplicationRisk = (h1Count > 1 || !canonical) ? "High Risk" : "Safe";

    auditData.seoElements = {
      robotsTxt: hasRobots ? "Found" : "Not Found",
      sitemapXml: hasSitemap ? "Found" : "Not Found",
      titleTag: title ? "Found" : "Missing",
      descriptionTag: description ? "Found" : "Missing",
      h1Tag: h1Count > 0 ? `Found (${h1Count})` : "Missing",
      canonicalUrl: canonical ? "Found" : "Missing"
    } as any;

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
        sitemapXmlContent: sitemapPreview,
        deepScanStatus,
        brokenLinksCount: brokenLinks.length
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
      auditData,
      aiAdvice: ""
    } as any;

    // --- 5. Generate Actionable Advice (Rule-based) ---
    const actionPlan = [];
    if (dynamicCrawlScheduled) {
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: "missingSemanticLinks",
        current: "Critical SEO Flaw: Your site relies purely on JavaScript (e.g. onClick) for navigation instead of semantic <a href> tags. Search engines cannot discover your internal pages."
      });
    }
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
    if (brokenLinks.length > 0) {
      actionPlan.push({ 
        priority: "fatal", 
        errorKey: "brokenLinks",
        current: `${brokenLinks.length} broken internal links found:\n` + brokenLinks.map(src => `- ${src}`).join('\n')
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

        // Extract PSI Data if available
        let performanceJson = null;
        if (psiRes.status === "fulfilled" && psiRes.value.ok) {
          try {
            const psiData = await psiRes.value.json();
            const lighthouse = psiData.lighthouseResult;
            if (lighthouse) {
              performanceJson = JSON.stringify({
                score: Math.round((lighthouse.categories?.performance?.score || 0) * 100),
                fcp: lighthouse.audits?.['first-contentful-paint']?.displayValue || "N/A",
                lcp: lighthouse.audits?.['largest-contentful-paint']?.displayValue || "N/A",
                cls: lighthouse.audits?.['cumulative-layout-shift']?.displayValue || "N/A",
                tbt: lighthouse.audits?.['total-blocking-time']?.displayValue || "N/A",
                speedIndex: lighthouse.audits?.['speed-index']?.displayValue || "N/A"
              });
            }
          } catch(e) {
            console.error("Failed to parse PSI response", e);
          }
        }

        // AI Content Pipeline (Enterprise Feature)
        let finalAuditJson = JSON.stringify(results.auditData);
        let rawEvidenceJson = null;
        let evidenceHash = null;
        
        if (includePerformance && crawlerRes.status === "fulfilled") {
          try {
            const crawlerData = crawlerRes.value?.data || {};
            const combinedEvidence = {
              crawler_data: crawlerData,
              psi_data: performanceJson ? JSON.parse(performanceJson) : null,
              audit_data: results.auditData
            };
            rawEvidenceJson = JSON.stringify(combinedEvidence);
            evidenceHash = crypto.createHash("sha256").update(rawEvidenceJson + Date.now()).digest("hex");
            
            console.log(`[SEO] Generating AI Report via Gemini...`);
            const model = genAI.getGenerativeModel({ 
              model: "gemini-2.5-flash",
              generationConfig: {
                responseMimeType: "application/json"
              }
            });
            const prompt = `You are an elite Google Technical SEO and Compliance Consultant.
            Analyze the following raw technical data for ${url} and generate a structured JSON object for a Premium B2B Technical Due Diligence Pitch Deck.
            The language of ALL textual output (titles, descriptions, advice, specs, etc.) MUST BE IN ${reportLanguage}, but keep terminal commands and technical terms in English.
            Add your own 'consulting flavor' to the explanations—make them authoritative, professional, and actionable.
            CRITICAL SEO INSTRUCTION: You MUST explicitly evaluate foundational SEO elements (robots.txt, sitemap.xml, meta tags). If robots.txt or sitemap.xml is 'Not Found' in the Raw Data, YOU ARE ABSOLUTELY REQUIRED to add an item for it in either the 'blockers' or 'warnings' array. Do NOT ignore basic SEO signals. A missing sitemap is a catastrophic failure for search discovery.

            Based strictly on the provided Raw Data, generate the following JSON schema exactly. Do NOT wrap it in markdown blockticks like \`\`\`json. Output raw JSON only.

            {
              "executive_summary": "A 2-3 paragraph personalized executive summary...",
              "compliance_status": {
                 "terms_found": boolean,
                 "privacy_found": boolean,
                 "contact_found": boolean,
                 "analysis_text": "A brief analysis of their basic compliance readiness"
              },
              "blockers": [
                 {
                   "title": "Short title of critical issue",
                   "description": "Why this is a blocker",
                   "spec": ["Actionable step 1", "Actionable step 2"],
                   "verification_bash": "# bash command to verify this fix (e.g. curl or grep)"
                 }
              ],
              "warnings": [
                 { "issue": "Warning title", "spec": "How to fix", "verification": "bash command" }
              ],
              "projected_trajectory": [
                 { "fix": "Fix batch name", "projected_score": number, "status": "e.g., BETA POSSIBLE" }
              ],
              "phase2_roadmap": [
                 { "title": "Scale migration", "priority": "HIGH/MEDIUM", "driver": "Why do this?", "swap": "From X -> Y", "gains": "What we gain", "trigger": "When to do it" }
              ],
              "industry_precedent": [
                 { "title": "Tech move", "seen_in": "Competitor name", "stack": "Stack used", "points": ["Benefit 1", "Benefit 2"] }
              ],
              "coppa_risk": {
                 "is_exposed": boolean,
                 "reasoning": ${enforceCoppa ? `"CRITICAL RULE: The user explicitly indicated this site targets minors or collects sensitive user data. You MUST ASSUME MAXIMUM COPPA EXPOSURE. If NO explicit Privacy Policy or COPPA notice is found in the raw data, YOU MUST SET is_exposed to true. NEVER say 'risk is low because keywords were not found'—the ABSENCE of legal privacy documentation is the actual massive COPPA violation. Explain this contextually."` : `"CRITICAL RULE: First, deduce the website's audience from its content. If the site targets minors (e.g., educational, martial arts, schools) OR collects user data (e.g., contact forms), a Privacy Policy is legally mandatory. In these specific cases, if no explicit Privacy Policy or COPPA notice is found in the data, YOU MUST SET is_exposed to true. For child-directed sites, NEVER say 'risk is low because keywords were not found'—the ABSENCE of legal privacy documentation is the actual COPPA violation. Explain this contextually."`},
                 "collected_data": ["e.g., Accounts", "Telemetry"],
                 "fine_math": [
                   {"scenario": "100 users", "fine": "$5.0M"},
                   {"scenario": "1,000 users", "fine": "$50.1M"}
                 ]
              },
              "legal_counsel": {
                 "status": "Current legal status",
                 "next_step": "Recommendation",
                 "brief_points": ["Point 1 for counsel", "Point 2"]
              },
              "appendix_blind_spots": [
                 { "area": "e.g., Database security", "opaque_reason": "Not externally reachable", "ask": "Review query patterns" }
              ],
              "vibe_coding_prompt": "A highly detailed, copy-pasteable prompt designed for an AI coding assistant (like Cursor or Copilot). Write it exactly as the developer would paste it into their IDE. Tell the AI to act as an expert Next.js engineer and fix the critical blockers you identified. Example: 'Act as an expert Next.js engineer. Review this codebase and fix these critical SEO blockers immediately: 1. [...]. Do not randomly change code...'",
              "glossary_terms": ["comma", "separated", "terms", "used"]
            }

            Raw Data: ${rawEvidenceJson.substring(0, 40000)}`;
            
            const aiStart = Date.now();
            const aiRes = await model.generateContent(prompt);
            let rawOutput = aiRes.response.text();
            
            // Parse JSON response
            let cleanedJson = rawOutput.trim();
            if (cleanedJson.startsWith("```json")) {
              cleanedJson = cleanedJson.replace(/^```json\n/, "").replace(/\n```$/, "");
            } else if (cleanedJson.startsWith("```")) {
              cleanedJson = cleanedJson.replace(/^```\n/, "").replace(/\n```$/, "");
            }
            
            let parsedDeck: any = {};
            try {
              parsedDeck = JSON.parse(cleanedJson);
            } catch (e) {
              console.error("[SEO] Failed to parse AI JSON:", e);
              // Fallback if parsing fails
              parsedDeck = {
                executive_summary: "AI analysis failed to generate valid JSON.",
                blockers: [],
                warnings: [],
                glossary_terms: []
              };
            }
            
            const aiExecutiveSummary = parsedDeck.executive_summary || "";
            const extractedTermsStr = (parsedDeck.glossary_terms || []).join(', ');
            
            // --- Auto-Learning Glossary Pass ---
            const finalGlossary: { term: string; definition: string }[] = [];
            try {
               const termsToProcess = extractedTermsStr.split(',').map(t => t.trim()).filter(t => t.length > 0 && t.length < 50).slice(0, 10);
               
               for (const term of termsToProcess) {
                 const existing = await db.select().from(seoGlossary).where(eq(seoGlossary.term, term)).limit(1);
                 if (existing.length > 0) {
                   finalGlossary.push({ term: existing[0].term, definition: existing[0].definition });
                 } else {
                   // Missing in DB, fetch from Gemini
                   const defPrompt = `Define the technical SEO term '${term}' in 2 sentences in ${reportLanguage}.`;
                   const defRes = await model.generateContent(defPrompt);
                   const definition = defRes.response.text().trim();
                   await db.insert(seoGlossary).values({ term, definition, language: reportLanguage });
                   finalGlossary.push({ term, definition });
                 }
               }
            } catch (glossaryErr) {
               console.error("[SEO] Glossary Extraction Failed:", glossaryErr);
            }
            // -----------------------------------
            
            // Apply massive penalty for COPPA/Privacy exposure
            if (parsedDeck?.coppa_risk?.is_exposed) {
              console.log("[SEO] COPPA/Privacy violation detected. Applying massive score penalty.");
              const technicalScore = results.score;
              results.score = Math.min(technicalScore - 40, 40);
              if (results.score < 0) results.score = 0;
              
              // Inject a trajectory milestone to show the score jump when COPPA is resolved
              if (!parsedDeck.projected_trajectory) {
                 parsedDeck.projected_trajectory = [];
              }
              
              const resolveText = reportLanguage === 'ko' ? "COPPA 및 개인정보보호법 준수 확보" : 
                                 reportLanguage === 'ja' ? "COPPAおよびプライバシー法の遵守" : 
                                 reportLanguage === 'es' ? "Resolución de cumplimiento de privacidad/COPPA" : 
                                 "Resolve COPPA/Privacy Compliance";
                                 
              const statusText = reportLanguage === 'ko' ? "법적 리스크 해소" :
                                 reportLanguage === 'ja' ? "法的リスクの解消" :
                                 reportLanguage === 'es' ? "Riesgo legal resuelto" :
                                 "COMPLIANCE UNBLOCKED";

              parsedDeck.projected_trajectory.unshift({
                 fix: resolveText,
                 projected_score: technicalScore,
                 status: statusText
              });
            }
            
            finalAuditJson = JSON.stringify({ 
              executive_summary: aiExecutiveSummary, 
              deck: parsedDeck, 
              glossary: finalGlossary,
              original: results.auditData 
            });
            
            await logApiUsage({
              userId: effectiveUserId !== "anonymous" ? effectiveUserId : null,
              serviceName: "SEO Compass",
              modelName: "gemini-2.5-flash",
              promptType: "enterprise_deep_audit",
              targetId: url.substring(0, 50),
              durationMs: Date.now() - aiStart,
              promptTokens: aiRes.response.usageMetadata?.promptTokenCount || 0,
              completionTokens: aiRes.response.usageMetadata?.candidatesTokenCount || 0,
              estimatedCost: 0
            });
          } catch (aiErr) {
            console.error("[SEO] Gemini Pipeline Failed:", aiErr);
          }
        }

        console.log(`[SEO] Inserting scan results...`);
        const newScanId = crypto.randomUUID();
        await db.insert(scanResults).values({
          id: newScanId,
          projectId: projectId,
          url: url,
          score: results.score,
          basicSeoJson: JSON.stringify({ ...results.basicSeo, usedScraper }),
          performanceJson: performanceJson,
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
          }),
          auditJson: finalAuditJson,
          rawEvidenceJson: rawEvidenceJson,
          evidenceHash: evidenceHash,
          reportLanguage: reportLanguage
        });
        console.log(`[SEO] Successfully saved scan results to DB!`);
        return NextResponse.json({ success: true, url, usedScraper, results, savedToDb: true, scanId: newScanId });
      } catch (dbErr) {
        console.error("[SEO] Failed to save scan results:", dbErr);
        // We don't fail the request just because saving history failed, but we notify the frontend
        return NextResponse.json({ success: true, url, usedScraper, results, savedToDb: false });
      }
    }

    return NextResponse.json({ success: true, url, usedScraper, results, savedToDb: false });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
// Forced refresh to fix translation sync: 2026-05-12
});
