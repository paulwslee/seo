"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, ShieldCheck, ShieldAlert, Compass, Zap, Search, SearchX, Lock, Rocket, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { TranslateBox } from "@/components/seo/translate-box";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Suspense } from "react";
import { AuthBenefitModal } from "@/components/seo/auth-benefit-modal";

export default function Home() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initUrl = searchParams.get('url') || "";
  
  const [url, setUrl] = useState(initUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [usedScraper, setUsedScraper] = useState(false);
  const [error, setError] = useState("");
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [selectedErrorIdx, setSelectedErrorIdx] = useState<number | null>(null);
  const [ignoreRobots, setIgnoreRobots] = useState(false);
  const [includePerformance, setIncludePerformance] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session } = useSession();

  const { completion, complete, isLoading: isAiLoading, error: aiError, setCompletion } = useCompletion({
    api: "/api/seo-ai",
    streamProtocol: "text",
    fetch: async (url, options) => {
      return fetch(url, { ...options, credentials: 'include' });
    }
  });

  const getPriorityInfo = (priority: string) => {
    if (priority === "fatal") return { icon: <AlertTriangle className="w-4 h-4" />, color: "text-rose-600 bg-rose-500/20 border-rose-500/40", label: t('priorityFatal') };
    if (priority === "warning") return { icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-600 bg-amber-500/20 border-amber-500/40", label: t('priorityWarning') };
    return { icon: <Sparkles className="w-4 h-4" />, color: "text-blue-600 bg-blue-500/20 border-blue-500/40", label: t('priorityOpportunity') };
  };

  const enrichError = (item: any) => {
    if (!item) return null;
    const priorityInfo = getPriorityInfo(item.priority);
    const title = item.errorKey ? t(`errors.${item.errorKey}.title`) : (item.title || "Unknown Error");
    const whyItMatters = item.errorKey ? t(`errors.${item.errorKey}.whyItMatters`) : (item.message || "");
    const expected = item.errorKey ? t(`errors.${item.errorKey}.expected`) : (item.expected || "");
    return { ...item, localizedTitle: title, localizedWhy: whyItMatters, localizedExpected: expected, priorityInfo };
  };

  const selectedError = selectedErrorIdx !== null && results?.actionPlan ? enrichError(results.actionPlan[selectedErrorIdx]) : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedErrorIdx === null || !results?.actionPlan) return;
      if (e.key === 'ArrowLeft' && selectedErrorIdx > 0) {
        setSelectedErrorIdx(selectedErrorIdx - 1);
      } else if (e.key === 'ArrowRight' && selectedErrorIdx < results.actionPlan.length - 1) {
        setSelectedErrorIdx(selectedErrorIdx + 1);
      } else if (e.key === 'Escape') {
        setSelectedErrorIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedErrorIdx, results?.actionPlan]);

  // Reset AI completion when error selection changes
  useEffect(() => {
    setCompletion('');
  }, [selectedErrorIdx, setCompletion]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSeoUrls");
    if (saved) {
      try {
        setRecentUrls(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Load/Save ignoreRobots preference (only if session exists)
  // Also reset sensitive states on logout
  useEffect(() => {
    if (session) {
      const saved = localStorage.getItem("seoIgnoreRobots");
      if (saved === "true") setIgnoreRobots(true);
      const savedPerf = localStorage.getItem("seoIncludePerformance");
      if (savedPerf === "true") setIncludePerformance(true);
    } else {
      // RESET ALL SENSITIVE STATE ON LOGOUT
      setIgnoreRobots(false);
      setIncludePerformance(false);
      setResults(null);
      setCompletion('');
      setError("");
    }
  }, [session, setCompletion]);

  const handleToggleRobots = () => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    const newVal = !ignoreRobots;
    setIgnoreRobots(newVal);
    localStorage.setItem("seoIgnoreRobots", String(newVal));
  };

  const handleTogglePerformance = () => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    const newVal = !includePerformance;
    setIncludePerformance(newVal);
    localStorage.setItem("seoIncludePerformance", String(newVal));
  };

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
        body: JSON.stringify({ url: targetUrl, ignoreRobots, includePerformance }),
      });

      const data = await res.json();
      if (!res.ok) {
        let msg = data.error;
        // Only attempt translation if the error code is a short key (no spaces)
        if (data.error && !data.error.includes(" ")) {
          try {
            msg = t(data.error);
          } catch (e) {}
        }
        throw new Error(msg || "Failed to scan");
      }
      
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

        {/* Scan Options */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <div 
            onClick={handleToggleRobots}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
              ignoreRobots 
                ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold" 
                : "bg-muted/30 border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${ignoreRobots ? "animate-pulse" : ""}`} />
            <span className="text-xs">Ignore Robots.txt</span>
            <div className={`w-6 h-3 rounded-full relative transition-colors ${ignoreRobots ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"}`}>
              <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${ignoreRobots ? "left-3.5" : "left-0.5"}`} />
            </div>
          </div>

          <div 
            onClick={handleTogglePerformance}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
              includePerformance 
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-bold" 
                : "bg-muted/30 border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${includePerformance ? "animate-pulse" : ""}`} />
            <span className="text-xs">Technical Audit (45s)</span>
            <div className={`w-6 h-3 rounded-full relative transition-colors ${includePerformance ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`}>
              <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${includePerformance ? "left-3.5" : "left-0.5"}`} />
            </div>
          </div>
        </div>

        {/* Recent URLs (localStorage) */}
        {recentUrls.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <History className="w-4 h-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground mr-2">{t('recent')}</span>
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
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                {includePerformance ? "Running Deep Technical Audit..." : t('analyzingTitle')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground, #64748b)', maxWidth: '24rem', margin: '0 auto', lineHeight: '1.5' }}>
                {t('analyzingDescPart1')} <span style={{ fontWeight: '600', color: '#10b981' }}>{url}</span> {t('analyzingDescPart2')}
              </p>
              {includePerformance && (
                <p style={{ fontSize: '0.875rem', color: '#10b981', maxWidth: '24rem', margin: '0.5rem auto 0', lineHeight: '1.5', fontWeight: 'bold' }}>
                  Analyzing Infrastructure, Security & Core Web Vitals...
                </p>
              )}
            </div>

            <div style={{ width: '100%', maxWidth: '24rem', margin: '0 auto' }}>
              <div style={{ width: '100%', backgroundColor: 'var(--muted, #f1f5f9)', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div className="pulse-force" style={{ backgroundColor: '#10b981', height: '100%', width: '100%', borderRadius: '9999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--muted-foreground, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('scanning')}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>
                  {includePerformance ? "Estimated: 30-45s" : "Estimated: 1-3s"}
                </p>
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

          {/* SEO Health Score & CEO Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ExecutiveSummaryContent results={results} t={t} setSelectedErrorIdx={setSelectedErrorIdx} />
          </div>

          {/* Action Plan (Rule-based) with Premium Bridges */}
          <ActionPlanContent results={results} t={t} setSelectedErrorIdx={setSelectedErrorIdx} getPriorityInfo={getPriorityInfo} />

          {/* Grid Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic SEO */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.basicSeo.status)}
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-100">{t('basicSeo')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
                <li><strong className="text-emerald-800 dark:text-emerald-100">Title:</strong> {results.basicSeo.title}</li>
                <li><strong className="text-emerald-800 dark:text-emerald-100">Description:</strong> {results.basicSeo.description}</li>
                <li><strong className="text-emerald-800 dark:text-emerald-100">H1 Tag:</strong> {results.basicSeo.h1}</li>
                <li className="flex items-center space-x-2 mt-2 pt-2 border-t border-emerald-500/20">
                  <span className="font-bold text-emerald-800 dark:text-emerald-100">{t('canonicalRisk')}</span>
                  {getStatusIcon(results.basicSeo.canonical)}
                </li>
              </ul>
            </div>

            {/* Technical SEO */}
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.technicalSeo.status)}
                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-100">{t('technicalSeo')}</h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-900/80 dark:text-blue-100/80">
                <li className="flex justify-between items-center bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <strong className="text-blue-800 dark:text-blue-100">Robots.txt</strong>
                  <span className={results.technicalSeo.robotsTxt === "Found" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {results.technicalSeo.robotsTxt}
                  </span>
                </li>
                <li className="flex justify-between items-center bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <strong className="text-blue-800 dark:text-blue-100">Sitemap.xml</strong>
                  <span className={results.technicalSeo.sitemapXml === "Found" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {results.technicalSeo.sitemapXml}
                  </span>
                </li>
              </ul>
            </div>

            {/* Social SEO */}
            <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-pink-500/50 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.socialSeo.status)}
                <h3 className="font-bold text-lg text-pink-800 dark:text-pink-100">{t('socialSeo')}</h3>
              </div>
              <ul className="space-y-3 text-sm text-pink-900/80 dark:text-pink-100/80">
                <li className="flex justify-between items-center bg-pink-500/10 p-2 rounded-lg border border-pink-500/20">
                  <strong className="text-pink-800 dark:text-pink-100">{t('openGraphTags')}</strong>
                  <span className={results.socialSeo.ogTags === "Found" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {results.socialSeo.ogTags}
                  </span>
                </li>
                <li className="flex justify-between items-center bg-pink-500/10 p-2 rounded-lg border border-pink-500/20">
                  <strong className="text-pink-800 dark:text-pink-100">{t('twitterCard')}</strong>
                  <span className={results.socialSeo.twitterCard === "Found" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {results.socialSeo.twitterCard}
                  </span>
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(results.contentSeo.status)}
                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-100">{t('contentHealth')}</h3>
              </div>
              <ul className="space-y-3 text-sm text-amber-900/80 dark:text-amber-100/80">
                <li className="flex justify-between items-center bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <strong className="text-amber-800 dark:text-amber-100">{t('imageAltTags')}</strong>
                  <span className={results.contentSeo.status === "pass" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {results.contentSeo.images}
                  </span>
                </li>
              </ul>
            </div>

            {/* NEW: Deep Scan Insights (Shown only if Performance Scan was run) */}
            {results.auditData?.performanceAssets && (
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="text-indigo-500 w-5 h-5 flex-shrink-0 animate-pulse" />
                  <h3 className="font-bold text-lg text-indigo-800 dark:text-indigo-100">Deep Scan Insights (Verified)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-900/80 dark:text-indigo-100/80">
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">Font Preloads</strong>
                      <span className={results.auditData.performanceAssets.fontPreloads > 10 ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>
                        {results.auditData.performanceAssets.fontPreloads} files
                      </span>
                    </li>
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">CSS / JS Assets</strong>
                      <span className="text-indigo-900 font-bold">
                        {results.auditData.performanceAssets.cssLinks} / {results.auditData.performanceAssets.jsScripts}
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">HSTS & CSP Headers</strong>
                      <span className={results.auditData.securityHeaders.hsts && results.auditData.securityHeaders.csp ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {results.auditData.securityHeaders.hsts && results.auditData.securityHeaders.csp ? "Enabled" : "Missing"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">Semantic HTML</strong>
                      <span className={results.auditData.accessibility.hasSemanticHTML ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {results.auditData.accessibility.hasSemanticHTML ? "Detected" : "Not Detected"}
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">Tech Stack</strong>
                      <span className="text-indigo-900 font-bold truncate max-w-[120px] text-right">
                        {results.auditData.infrastructure?.techStack?.join(", ") || "Unknown"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <strong className="text-indigo-800 dark:text-indigo-100">Client Rendering (CSR)</strong>
                      <span className={results.auditData.infrastructure?.isCsrBailout ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>
                        {results.auditData.infrastructure?.isCsrBailout ? "Bailout Detected" : "SSR / SSG"}
                      </span>
                    </li>
                  </ul>
                </div>
                
                {/* CTA to Dashboard for PDF */}
                <div className="mt-6 pt-4 border-t border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-indigo-900/60 dark:text-indigo-100/60">
                    This is a brief summary. Our system generated a 10+ page Enterprise Technical Audit Report.
                  </p>
                  <a href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-full transition-colors shrink-0">
                    View Full PDF Report <Zap className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* File Structure Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </span>
                  <span className="text-slate-400 text-xs font-mono ml-2">/robots.txt</span>
                </div>
                {results.technicalSeo.robotsTxt === "Found" ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">200 OK</span>
                ) : (
                  <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">404 Missing</span>
                )}
              </div>
              <div className="p-4">
                <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[150px] scrollbar-thin scrollbar-thumb-slate-700">
                  {results.technicalSeo.robotsTxt === "Found" && results.technicalSeo.robotsTxtContent 
                    ? results.technicalSeo.robotsTxtContent + (results.technicalSeo.robotsTxtContent.length >= 300 ? "\n..." : "")
                    : "No robots.txt file found at the root of your domain. Search engines might have trouble knowing which pages to crawl."}
                </pre>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </span>
                  <span className="text-slate-400 text-xs font-mono ml-2">/sitemap.xml</span>
                </div>
                {results.technicalSeo.sitemapXml === "Found" ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">200 OK</span>
                ) : (
                  <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">404 Missing</span>
                )}
              </div>
              <div className="p-4">
                <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[150px] scrollbar-thin scrollbar-thumb-slate-700">
                  {results.technicalSeo.sitemapXml === "Found" && results.technicalSeo.sitemapXmlContent 
                    ? results.technicalSeo.sitemapXmlContent + (results.technicalSeo.sitemapXmlContent.length >= 300 ? "\n..." : "")
                    : "No sitemap.xml file found at the root of your domain. A sitemap is crucial for helping Google discover all your pages."}
                </pre>
              </div>
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
      
      {/* Full-Screen Educational Modal (Global) */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl max-h-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 border border-white/20 dark:border-white/10">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-4 sm:gap-0 relative">
              
              {/* Close Button on Mobile (Absolute Top Right) */}
              <button 
                onClick={() => setSelectedErrorIdx(null)}
                className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all sm:hidden"
              >
                <XCircle className="w-7 h-7" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-10 sm:pr-4">
                <div className={`w-fit shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider shadow-sm ${selectedError.priorityInfo?.color || ''}`}>
                  {selectedError.priorityInfo?.icon}
                  {selectedError.priorityInfo?.label}
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                  {selectedError.localizedTitle}
                </h3>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => selectedErrorIdx !== null && selectedErrorIdx > 0 && setSelectedErrorIdx(selectedErrorIdx - 1)}
                    disabled={selectedErrorIdx === 0}
                    className="flex items-center gap-1.5 px-4 py-2 sm:p-2 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 sm:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-200/70 sm:bg-transparent dark:bg-slate-800/70 sm:dark:bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" /> <span className="sm:hidden">이전</span>
                  </button>
                  <button 
                    onClick={() => selectedErrorIdx !== null && results?.actionPlan && selectedErrorIdx < results.actionPlan.length - 1 && setSelectedErrorIdx(selectedErrorIdx + 1)}
                    disabled={selectedErrorIdx !== null && results?.actionPlan && selectedErrorIdx >= results.actionPlan.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 sm:p-2 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 sm:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-200/70 sm:bg-transparent dark:bg-slate-800/70 sm:dark:bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <span className="sm:hidden">다음</span> <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedErrorIdx(null)}
                  className="hidden sm:block p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all ml-2"
                >
                  <XCircle className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-10 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
              
              {/* Why it matters */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl p-8 border border-blue-100/50 dark:border-blue-800/30 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-10">
                  <Sparkles className="w-40 h-40 text-blue-500" />
                </div>
                <h4 className="text-xl font-extrabold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  이게 왜 문제인가요? (Why it matters)
                </h4>
                <p className="text-lg text-blue-800/90 dark:text-blue-100/80 leading-relaxed font-medium relative z-10">
                  {selectedError.localizedWhy}
                </p>
              </div>

              {/* Deep AI Copywriter Result */}
              {(completion || isAiLoading || aiError) && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-2xl p-8 border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-10">
                    <Sparkles className="w-40 h-40 text-indigo-500" />
                  </div>
                  <h4 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2 relative z-10">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    Deep AI Copywriter
                  </h4>
                  {aiError && (
                    <div className="text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl font-medium border border-rose-200 dark:border-rose-800/30 relative z-10 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        {aiError.message.includes("401") || aiError.message.includes("Unauthorized") 
                          ? "AI 기능을 사용하려면 로그인이 필요합니다." 
                          : aiError.message.includes("403") || aiError.message.includes("limit") || aiError.message.includes("Free limit")
                            ? "무료 횟수(3회)를 모두 소진하셨습니다. 무제한 사용을 위해 프리미엄으로 업그레이드하세요!"
                            : "AI 생성 중 오류가 발생했습니다. 다시 시도해주세요."}
                      </div>
                    </div>
                  )}
                  {completion && (
                    <div className="prose prose-indigo dark:prose-invert max-w-none relative z-10">
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-950 dark:text-indigo-50 shadow-sm font-medium">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            pre({node, ...props}) {
                              return <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono leading-relaxed shadow-inner border border-slate-700" {...props} />
                            },
                            code({node, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              // If it has a language match or contains newlines, it's likely a block (handled by pre), 
                              // but we still just render the code tag normally here so 'pre' can wrap it.
                              // Otherwise, it's inline code.
                              return match ? (
                                <code className={className} {...props}>{children}</code>
                              ) : (
                                <code className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            a({node, ...props}) {
                              return <a className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
                            },
                            ul({node, ...props}) {
                              return <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
                            },
                            h1({node, ...props}) { return <h1 className="text-2xl font-bold mt-6 mb-4 text-indigo-900 dark:text-indigo-200" {...props} /> },
                            h2({node, ...props}) { return <h2 className="text-xl font-bold mt-5 mb-3 text-indigo-800 dark:text-indigo-300" {...props} /> },
                            h3({node, ...props}) { return <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-700 dark:text-indigo-400" {...props} /> },
                            p({node, ...props}) { return <p className="my-3 leading-relaxed" {...props} /> }
                          }}
                        >
                          {completion}
                        </ReactMarkdown>
                        {isAiLoading && <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse mt-2" />}
                      </div>
                    </div>
                  )}
                  {!completion && isAiLoading && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" /> AI가 최적의 카피라이팅을 작성 중입니다...
                    </div>
                  )}
                </div>
              )}

              {/* Code comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Current State Mac OS Terminal */}
                <div className="space-y-4 flex flex-col">
                  <h4 className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2 text-lg">
                    <XCircle className="w-6 h-6" /> 내 웹사이트의 현실 (Current State)
                  </h4>
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl h-full min-h-[200px] flex flex-col">
                    <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-black/30">
                      <div className="flex gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-sm"></div>
                      </div>
                      <div className="ml-4 text-[11px] text-slate-400 font-mono tracking-widest uppercase">current_state.html</div>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                      <code className="text-[15px] font-mono text-rose-300 break-all whitespace-pre-wrap leading-relaxed">
                        {selectedError.current || "데이터 없음"}
                      </code>
                    </div>
                  </div>
                </div>
                
                {/* Expected State Mac OS Terminal */}
                <div className="space-y-4 flex flex-col">
                  <h4 className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-6 h-6" /> 해결 방법 (How to Fix)
                  </h4>
                  <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl h-full min-h-[200px] flex flex-col">
                    <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-black/30">
                      <div className="flex gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-sm"></div>
                      </div>
                      <div className="ml-4 text-[11px] text-slate-400 font-mono tracking-widest uppercase">solution_fix.html</div>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                      <code className="text-[15px] font-mono text-emerald-300 break-all whitespace-pre-wrap leading-relaxed">
                        {selectedError.localizedExpected || "데이터 없음"}
                      </code>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Modal Footer (Premium Bridge & AI Copywriter) */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                  문제를 해결할 카피라이팅이 필요하신가요?
                </span>
                <button 
                  onClick={() => {
                    if (isAiLoading || !selectedError) return;
                    complete("Fix my SEO issue", {
                      body: {
                        errorKey: selectedError.errorKey,
                        current: selectedError.current,
                        expected: selectedError.expected,
                        locale: locale,
                        url: url
                      }
                    });
                  }}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  Deep AI Copywriter
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    alert('Premium Feature: 스크립트 발급 로직 연동 예정');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  자동 수정 스크립트 (Premium)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Benefit Modal */}
      <AuthBenefitModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </main>
  );
}

function ExecutiveSummaryContent({ results, t, setSelectedErrorIdx }: { results: any, t: any, setSelectedErrorIdx: any }) {
  const text1 = results.indexability === "Blocked (Noindex)" 
    ? t('indexabilityFail')
    : t('indexabilityPass');

  const text2 = results.duplicationRisk === "Safe" 
    ? t('duplicationPass')
    : t('duplicationFail', { reason: results.duplicationReasonKey ? t(results.duplicationReasonKey) : 'Multiple H1s or Missing Canonical' });

  const handleWarningClick = () => {
    if (results.duplicationRisk !== "Safe" && results.actionPlan) {
      const targetIdx = results.actionPlan.findIndex((item: any) => 
        item.errorKey === "missingCanonical" || 
        item.errorKey === "multipleH1s" || 
        item.errorKey === "missingH1" ||
        (item.title && item.title.includes("Canonical")) ||
        (item.title && item.title.includes("H1"))
      );
      
      if (targetIdx !== -1) {
        setSelectedErrorIdx(targetIdx);
      } else {
        alert("이전 스캔 데이터이거나 알 수 없는 오류입니다. 정확한 분석을 위해 Scan Now를 눌러 URL을 다시 스캔해주세요.");
      }
    }
  };

  return (
    <>
      <div className="col-span-1 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
        <h3 className="font-bold text-lg text-foreground mb-6">{t('overallSeoHealth')}</h3>
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className="text-muted stroke-current" strokeWidth="12" fill="transparent" />
            <circle 
              cx="50" cy="50" r="40" 
              className={`${results.score >= 80 ? 'text-emerald-500' : results.score >= 50 ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-1000 ease-out`} 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - (results.score || 0) / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold">{results.score || 0}</span>
            <span className="text-xs text-muted-foreground font-semibold uppercase mt-1">/ 100</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-2xl p-6 md:p-8 shadow-md text-white flex flex-col justify-center border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="font-bold text-xl text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> {t('executiveSummary')}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-700/50">
            <div className={`p-2 rounded-lg shrink-0 ${results.indexability === "Indexable" ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {results.indexability === "Indexable" ? <Search className="w-6 h-6" /> : <SearchX className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-lg">{t('googleIndexability')}</h4>
              <div className={`text-sm mt-1 font-medium transition-all duration-500 ease-in-out ${results.indexability === "Indexable" ? 'text-emerald-300' : 'text-rose-300'}`}>
                {text1}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${results.duplicationRisk === "Safe" ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {results.duplicationRisk === "Safe" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-lg">{t('duplicationPenalty')}</h4>
              <div 
                className={`text-sm mt-1 font-medium transition-all duration-500 ease-in-out ${results.duplicationRisk === "Safe" ? 'text-emerald-300' : 'text-amber-300'} ${results.duplicationRisk !== "Safe" ? 'cursor-pointer hover:text-amber-200 group' : ''}`}
                onClick={handleWarningClick}
              >
                {text2}
                {results.duplicationRisk !== "Safe" && (
                  <span className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/40 group-hover:text-amber-100 transition-colors shadow-sm">
                    {t('viewDetails')} <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ActionPlanContent({ results, t, setSelectedErrorIdx, getPriorityInfo }: { results: any, t: any, setSelectedErrorIdx: any, getPriorityInfo: any }) {
  const actionPlan = results.actionPlan || [];
  
  if (actionPlan.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-emerald-500/30 bg-emerald-500/10 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-100">{t('perfectSeo')}</h2>
        </div>
      </div>
    );
  }



  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/10">
      <div className="bg-indigo-500/15 dark:bg-indigo-500/20 border-b border-indigo-500/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center p-2 bg-indigo-500 text-white rounded-lg shadow-md border border-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-100 tracking-tight">{t('actionPlan')}</h2>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-0.5">{t('actionPlanDesc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full w-fit shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase">{t('actionPlanRuleBased')}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-500/5 dark:bg-indigo-900/10">
        <ul className="space-y-4">
          {actionPlan.map((item: any, idx: number) => {
            const priorityInfo = getPriorityInfo(item.priority);
            
            // Native i18n using errorKey
            const title = item.errorKey ? t(`errors.${item.errorKey}.title`) : (item.title || "Unknown Error");
            const whyItMatters = item.errorKey ? t(`errors.${item.errorKey}.whyItMatters`) : (item.message || "");
            const expected = item.errorKey ? t(`errors.${item.errorKey}.expected`) : (item.expected || "");

            return (
              <li 
                key={idx} 
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-500/20 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all"
                onClick={() => setSelectedErrorIdx(idx)}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${item.priority === 'fatal' ? 'bg-rose-500' : item.priority === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pl-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5 ${priorityInfo.color}`}>
                      {priorityInfo.icon}
                      {priorityInfo.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-100 break-words">{title}</h4>
                      <p className="text-xs sm:text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1 font-medium line-clamp-2">{whyItMatters}</p>
                    </div>
                  </div>
                  
                  <button className="text-indigo-500/70 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-colors whitespace-nowrap self-end sm:self-auto shrink-0 mt-1 sm:mt-0">
                    {t('viewDetails')} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Premium Bridge */}
      <div className="bg-indigo-900/5 dark:bg-indigo-950/30 border-t border-indigo-500/30 p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div 
          onClick={() => alert('자세한 수정을 원하시는 에러 항목을 클릭하여 팝업을 연 뒤, 하단의 [✨ Deep AI Copywriter] 버튼을 실행해 보세요!')}
          className="flex-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all border border-indigo-400/30 group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('deepAiAnalysis')}</h4>
              <p className="text-xs text-blue-100/80">{t('deepAiAnalysisDesc')}</p>
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>

        <div 
          onClick={() => alert('프리미엄 구독 시, 전체 에러를 한 번에 수정할 수 있는 자동 스크립트를 발급해 드립니다. (준비 중)')}
          className="flex-1 w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-xl p-4 shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all border border-slate-700 group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                {t('autoFixScript')} <Lock className="w-3 h-3 text-emerald-500" />
              </h4>
              <p className="text-xs text-slate-400">{t('autoFixScriptDesc')}</p>
            </div>
          </div>
          <div className="bg-slate-700/50 p-2 rounded-full group-hover:bg-emerald-500/20 transition-colors">
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
