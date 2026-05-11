"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, ShieldCheck, ShieldAlert, Compass, Zap } from "lucide-react";
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
                disabled={isLoading}
                className="text-xs bg-muted/50 hover:bg-emerald-500 hover:text-white text-muted-foreground px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recent.replace(/^https?:\/\/(www\.)?/, '')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State (Inline) */}
      {isLoading && (
        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '42rem', marginInline: 'auto' }}>
          <div style={{ 
            backgroundColor: 'var(--card, #ffffff)', 
            border: '1px solid var(--border, #e2e8f0)', 
            borderRadius: '1.5rem', 
            padding: '2.5rem', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'visible'
          }}>
            
            <div style={{ position: 'relative', width: '5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(16, 185, 129, 0.2)', borderRadius: '9999px' }}></div>
              <div 
                className="spinner-force"
                style={{ position: 'absolute', inset: 0, border: '4px solid #10b981', borderRadius: '9999px', borderTopColor: 'transparent' }}
              ></div>
              <Compass style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Analyzing Website Architecture...</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground, #64748b)', maxWidth: '24rem', margin: '0 auto', lineHeight: '1.5' }}>
                Our AI is currently scanning <span style={{ fontWeight: '600', color: '#10b981' }}>{url}</span> for SEO vulnerabilities and metadata issues.
              </p>
            </div>

            <div style={{ width: '100%', maxWidth: '24rem', margin: '0 auto' }}>
              <div style={{ width: '100%', backgroundColor: 'var(--muted, #f1f5f9)', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div className="pulse-force" style={{ backgroundColor: '#10b981', height: '100%', width: '100%', borderRadius: '9999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--muted-foreground, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scanning</p>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>Estimated: 5-10s</p>
              </div>
            </div>
            
            <style jsx>{`
              @keyframes forceSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes forcePulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              .spinner-force {
                animation: forceSpin 1s linear infinite !important;
              }
              .pulse-force {
                animation: forcePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="mt-16 w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Scan Protection Status Banner */}
          <div className="w-full mb-6">
            {usedScraper ? (
              <div className="flex items-start sm:items-center gap-4 p-4 bg-yellow-50/80 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-500/20">
                  <ShieldAlert className="w-5 h-5" style={{ color: '#ca8a04' }} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-300 tracking-tight">{t('shieldBypass')}</h4>
                  <p className="text-xs text-yellow-700/80 dark:text-yellow-400/80 mt-0.5 leading-relaxed">{t('shieldBypassDesc')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start sm:items-center gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" style={{ color: '#059669' }} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 tracking-tight">{t('shieldDirect')}</h4>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">{t('shieldDirectDesc')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Instant Actionable Advice Box (Rule-based) */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/60 bg-card">
            {/* Header Area */}
            <div className="bg-muted/30 border-b border-border/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shadow-inner border border-indigo-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Instant Action Plan</h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase">Rule-Based (Free)</span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 relative">
              <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.03] pointer-events-none">
                <Zap className="w-40 h-40 text-foreground" />
              </div>
              <div className="text-[1.05rem] text-foreground/80 whitespace-pre-wrap leading-loose relative z-10 font-medium">
                <TranslateBox originalText={results.aiAdvice} targetLang="Korean" />
              </div>
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
