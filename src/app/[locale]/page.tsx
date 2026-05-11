"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TranslateBox } from "@/components/seo/translate-box";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('Dashboard');
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!url) return;
    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan");
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-full bg-background text-foreground flex flex-col items-center justify-center p-6 relative py-20">
      
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
            onClick={handleScan}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-8 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('scanButton')}
          </Button>
        </div>
        {error && <p className="text-red-500 font-medium">{error}</p>}
      </div>

      {/* Traffic Light Preview / Results */}
      {results && (
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-start space-x-4 shadow-sm">
            <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${
              results.basicSeo.status === "pass" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            }`} />
            <div>
              <span className="font-medium text-foreground text-lg">Basic SEO ({results.basicSeo.status})</span>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p>Title: {results.basicSeo.title}</p>
                <p>Description: {results.basicSeo.description}</p>
                <p>H1: {results.basicSeo.h1}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 flex items-start space-x-4 shadow-sm">
            <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${
              results.canonicalRisk.status === "pass" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            }`} />
            <div>
              <span className="font-medium text-foreground text-lg">Duplicate URL Risk ({results.canonicalRisk.status})</span>
              <div className="mt-2">
                <TranslateBox originalText={results.canonicalRisk.message} targetLang="Korean" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!results && !isLoading && (
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full opacity-50 grayscale pointer-events-none">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span className="font-medium text-foreground">Basic SEO (Pass)</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="font-medium text-foreground">Robots.txt (Warning)</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="font-medium text-foreground">Duplicate URL Risk (Fatal)</span>
          </div>
        </div>
      )}
    </main>
  );
}
