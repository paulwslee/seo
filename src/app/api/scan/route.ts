import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = scanSchema.parse(body);

    const targetUrl = new URL(url);
    const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`;

    // Parallel fetching for main URL, robots.txt, and sitemap.xml
    const [mainRes, robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(url, { headers: { "User-Agent": "SEO Compass Scanner / 1.0" }, signal: AbortSignal.timeout(10000) }),
      fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
    ]);

    if (mainRes.status === "rejected" || !mainRes.value.ok) {
      return NextResponse.json({ error: "Failed to fetch the main URL." }, { status: 400 });
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
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
          The user is a beginner website owner. Their website (${url}) has the following SEO issues:
          ${issues.join("\n")}
          
          Write a concise, 3-sentence actionable advice explaining how to fix these issues. 
          Provide a generic HTML code snippet they can copy-paste to fix the meta tags or image alt tags.
          Format the output in clean Markdown.
        `;
        const aiResponse = await model.generateContent(prompt);
        results.aiAdvice = aiResponse.response.text();
      } catch (aiErr) {
        console.error("Gemini AI failed:", aiErr);
        results.aiAdvice = "AI Advice is currently unavailable.";
      }
    } else {
      results.aiAdvice = "Perfect! Your website's SEO foundation is rock solid. Keep up the good work!";
    }

    return NextResponse.json({ success: true, url, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
