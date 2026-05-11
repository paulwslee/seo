"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";
import { TranslateBox } from "@/components/seo/translate-box";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const t = useTranslations('Dashboard');
  const searchParams = useSearchParams();
  const initUrl = searchParams.get('url') || "";
  
  const [url, setUrl] = useState(initUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [usedScraper, setUsedScraper] = useState(false);
  const [error, setError] = useState("");
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSeoUrls");
    if (saved) {
      try {
        setRecentUrls(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecentUrl = (newUrl: string) => {
    setRecentUrls((prev) => {
      const updated = [newUrl, ...prev.filter(u => u !== newUrl)].slice(0, 5);
      localStorage.setItem("recentSeoUrls", JSON.stringify(updated));
      return updated;
    });
  };

  const handleScan = async (scanUrlOrEvent?: string | React.MouseEvent) => {
    const scanUrl = typeof scanUrlOrEvent === 'string' ? scanUrlOrEvent : undefined;
    const target = scanUrl || url;
    if (!target) return;
    
    // If they clicked a recent URL pill, update the input visually
    if (scanUrl) setUrl(scanUrl);

    setIsLoading(true);
    setError("");
    setResults(null);
    setUsedScraper(false);

    try {
      // Basic URL validation
      let targetUrl = target.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      setUrl(targetUrl); // Update the input box visually

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan");
      
      setResults(data.results);
      setUsedScraper(!!data.usedScraper);
      saveRecentUrl(targetUrl); // Save to history on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
    if (status === "warning") return <AlertTriangle className="text-yellow-500 w-5 h-5 flex-shrink-0" />;
    return <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />;
  };

  return (
    <main className="min-h-full bg-background text-foreground flex flex-col items-center p-6 relative py-20 pb-40">
      
      {/* Header Section */}
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          SEO <span className="text-emerald-500">Compass</span>
        </h1>
        <p className="text-muted-foreground text-lg text-balance md:whitespace-nowrap">
          {t('subtitle')}
        </p>

        {/* Input Area */}
        <div className="flex w-full items-center space-x-2 bg-card p-2 rounded-xl border border-border focus-within:border-emerald-500 transition-colors shadow-sm cursor-text">
          <input
            type="url"
            placeholder={t('placeholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1 bg-transparent px-4 py-3 outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            size="lg" 
            onClick={() => handleScan()}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-8 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('scanButton')}
          </Button>
        </div>
        {error && <p className="text-red-500 font-medium">{error}</p>}

        {/* Recent URLs (localStorage) */}
        {recentUrls.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <History className="w-4 h-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground mr-2">Recent:</span>
            {recentUrls.map((recent, idx) => (
              <button
                key={idx}
                onClick={() => handleScan(recent)}
                className="text-xs bg-muted/50 hover:bg-emerald-500 hover:text-white text-muted-foreground px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-border"
              >
                {recent.replace(/^https?:\/\/(www\.)?/, '')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-16 w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Scan Protection Status Banner */}
          <div className="flex items-center justify-end w-full mb-[-1rem]">
            {usedScraper ? (
              <div className="group relative flex items-center gap-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-full text-xs font-medium cursor-help">
                <ShieldAlert className="w-4 h-4" />
                <span>Anti-bot Bypassed</span>
                <div className="absolute right-0 bottom-full mb-2 hidden w-64 p-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg group-hover:block z-50 text-xs font-normal">
                  This website is actively protected against bots (e.g. Cloudflare). Our Premium Scraper successfully bypassed the security to analyze the site.
                </div>
              </div>
            ) : (
              <div className="group relative flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-medium cursor-help">
                <ShieldCheck className="w-4 h-4" />
                <span>Direct Scan Successful</span>
                <div className="absolute right-0 bottom-full mb-2 hidden w-64 p-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg group-hover:block z-50 text-xs font-normal">
                  The scan was completed directly. No anti-bot protections blocked our analysis.
                </div>
              </div>
            )}
          </div>

          {/* AI Actionable Advice Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold text-foreground">AI SEO Action Plan</h2>
            </div>
            <div className="text-lg text-foreground/90 whitespace-pre-wrap leading-relaxed relative z-10">
              <TranslateBox originalText={results.aiAdvice} targetLang="Korean" />
            </div>
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic SEO */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.basicSeo.status)}
                <h3 className="font-bold text-lg">Basic SEO</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Title:</strong> {results.basicSeo.title}</li>
                <li><strong className="text-foreground">Description:</strong> {results.basicSeo.description}</li>
                <li><strong className="text-foreground">H1 Tag:</strong> {results.basicSeo.h1}</li>
                <li className="flex items-center space-x-2 mt-2 pt-2 border-t border-border">
                  <span className="font-medium text-foreground">Canonical Risk:</span>
                  {getStatusIcon(results.basicSeo.canonical)}
                </li>
              </ul>
            </div>

            {/* Technical SEO */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.technicalSeo.status)}
                <h3 className="font-bold text-lg">Technical SEO</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                  <strong className="text-foreground">Robots.txt</strong>
                  <span className={results.technicalSeo.robotsTxt === "Found" ? "text-emerald-500" : "text-red-500"}>
                    {results.technicalSeo.robotsTxt}
                  </span>
                </li>
                <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                  <strong className="text-foreground">Sitemap.xml</strong>
                  <span className={results.technicalSeo.sitemapXml === "Found" ? "text-emerald-500" : "text-red-500"}>
                    {results.technicalSeo.sitemapXml}
                  </span>
                </li>
              </ul>
            </div>

            {/* Social SEO */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.socialSeo.status)}
                <h3 className="font-bold text-lg">Social & Sharing</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                  <strong className="text-foreground">OpenGraph Tags</strong>
                  <span className={results.socialSeo.ogTags === "Found" ? "text-emerald-500" : "text-red-500"}>
                    {results.socialSeo.ogTags}
                  </span>
                </li>
                <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                  <strong className="text-foreground">Twitter Card</strong>
                  <span className={results.socialSeo.twitterCard === "Found" ? "text-emerald-500" : "text-red-500"}>
                    {results.socialSeo.twitterCard}
                  </span>
                </li>
              </ul>
            </div>

            {/* Content SEO */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.contentSeo.status)}
                <h3 className="font-bold text-lg">Content Health</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                  <strong className="text-foreground">Image Alt Tags</strong>
                  <span className={results.contentSeo.status === "pass" ? "text-emerald-500" : "text-yellow-500"}>
                    {results.contentSeo.images}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State Preview (Only shown before scanning) */}
      {!results && !isLoading && (
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full opacity-40 grayscale pointer-events-none select-none">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-medium text-foreground">Basic SEO (Pass)</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-foreground">Robots.txt (Warning)</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-foreground">Canonical Risk (Fatal)</span>
          </div>
        </div>
      )}
    </main>
  );
}
