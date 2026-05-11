import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = scanSchema.parse(body);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SEO Compass Scanner / 1.0",
      },
      // Timeout is important to prevent hanging
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL. Status: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Meta Tag Analysis
    const title = $("title").text().trim();
    const description = $("meta[name='description']").attr("content") || "";
    const h1 = $("h1").first().text().trim();
    const canonical = $("link[rel='canonical']").attr("href") || "";

    // Calculate dynamic scores/risks based on PM logic
    const results = {
      basicSeo: {
        status: title && description && h1 ? "pass" : "warning",
        title: title || "Missing Title",
        description: description || "Missing Description",
        h1: h1 || "Missing H1",
      },
      canonicalRisk: {
        status: canonical ? "pass" : "fatal",
        message: canonical 
          ? "Canonical tag found. Safe from duplicate penalties." 
          : "Missing Canonical! Search engines might penalize this page if dynamic parameters are used.",
      },
      // We will add robots/sitemap parsing in the next ticket
    };

    return NextResponse.json({ success: true, url, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
