import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults, users, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, 
  Code, Zap, Lock, Globe, FileCode2, Share2, Image as ImageIcon
} from "lucide-react";
import { UpgradeButton } from "@/components/stripe/upgrade-button";

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id || session.user.email || "";

  // Verify the scan belongs to a project owned by this user
  const scan = await db.select().from(scanResults).where(eq(scanResults.id, resolvedParams.id)).limit(1);
  
  if (scan.length === 0) {
    redirect("/dashboard");
  }
  
  const scanData = scan[0];
  const project = await db.select().from(projects).where(eq(projects.id, scanData.projectId)).limit(1);
  
  if (project.length === 0 || project[0].userId !== userId) {
    redirect("/dashboard");
  }

  const userDb = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
  const userPlan = userDb[0]?.plan || 'free';

  let results: any = {};
  let basicSeo: any = {};
  try {
    results = JSON.parse(scanData.canonicalRiskJson);
    basicSeo = JSON.parse(scanData.basicSeoJson);
  } catch (e) {
    console.error("Error parsing scan JSON", e);
  }

  const date = new Date(scanData.createdAt).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const getStatusColor = (status: string) => {
    if (status === "pass") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (status === "warning") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="w-5 h-5" />;
    if (status === "warning") return <AlertTriangle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  // Generate Proxy Script logic
  const proxyScript = `
// Cloudflare Worker: Auto-Fix SEO Script for ${scanData.url}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await fetch(request);
    
    // Only modify HTML responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      let html = await response.text();
      
      // Auto-Fix Rules based on scan results
      ${results.actionPlan?.filter((p: any) => p.errorKey === "missingCanonical").length > 0 ? 
      `// Fix: Inject Canonical Tag
      if (!html.includes('rel="canonical"')) {
        html = html.replace('<head>', '<head>\\n    <link rel="canonical" href="' + request.url + '" />');
      }` : '// Canonical tag already present.'}
      
      ${results.actionPlan?.filter((p: any) => p.errorKey === "missingTitle").length > 0 ? 
      `// Fix: Inject Fallback Title
      if (!html.includes('<title>')) {
        html = html.replace('<head>', '<head>\\n    <title>Fixed by SEO Compass Premium</title>');
      }` : '// Title tag already present.'}

      return new Response(html, {
        status: response.status,
        headers: response.headers
      });
    }
    
    return response;
  }
};
  `.trim();

  return (
    <main className="min-h-full bg-background p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold truncate max-w-2xl" title={scanData.url}>
            Scan Report: {new URL(scanData.url).hostname}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span>{date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
            <span className="font-semibold px-2 py-0.5 rounded-md bg-muted text-xs">Score: {results.score}/100</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic SEO */}
        <SectionCard title="Basic SEO" icon={<Globe className="w-5 h-5" />} status={basicSeo.status}>
          <Metric label="Title" value={basicSeo.title} />
          <Metric label="Description" value={basicSeo.description} isLong />
          <Metric label="H1 Tag" value={basicSeo.h1} />
          <Metric label="Canonical" value={basicSeo.canonicalUrl || "Missing"} />
        </SectionCard>

        {/* Technical SEO */}
        <SectionCard title="Technical SEO" icon={<FileCode2 className="w-5 h-5" />} status={results.technicalSeo?.status}>
          <Metric label="robots.txt" value={results.technicalSeo?.robotsTxt} />
          <Metric label="sitemap.xml" value={results.technicalSeo?.sitemapXml} />
          <Metric label="Indexability" value={results.indexability} />
        </SectionCard>

        {/* Social SEO */}
        <SectionCard title="Social SEO" icon={<Share2 className="w-5 h-5" />} status={results.socialSeo?.status}>
          <Metric label="OG Tags" value={results.socialSeo?.ogTags} />
          <Metric label="Twitter Card" value={results.socialSeo?.twitterCard} />
        </SectionCard>

        {/* Content SEO */}
        <SectionCard title="Content SEO" icon={<ImageIcon className="w-5 h-5" />} status={results.contentSeo?.status}>
          <Metric label="Images" value={results.contentSeo?.images} />
          <Metric label="Duplication Risk" value={results.duplicationRisk} />
        </SectionCard>
      </div>

      {/* Action Plan */}
      {results.actionPlan && results.actionPlan.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Action Plan
          </h2>
          <div className="grid gap-3">
            {results.actionPlan.map((action: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card flex gap-4 items-start">
                <div className={`mt-0.5 p-1.5 rounded-full ${action.priority === 'fatal' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {action.priority === 'fatal' ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{action.current}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Feature: Auto-Fix Proxy */}
      <div className="mt-12 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent overflow-hidden">
        <div className="p-6 md:p-8 border-b border-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
              <Zap className="w-5 h-5" /> Auto-Fix Proxy Script
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Don't have time to fix these issues manually? Generate a Cloudflare Worker script that fixes these SEO errors on-the-fly without touching your server code.
            </p>
          </div>
          <div className="shrink-0">
            {userPlan === 'premium' ? (
              <div className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-500 font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Premium Active
              </div>
            ) : (
              <UpgradeButton userEmail={session.user.email || ""} />
            )}
          </div>
        </div>
        
        <div className="p-6 md:p-8 relative">
          {userPlan !== 'premium' ? (
            <>
              <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unlock Auto-Fix Scripts</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Upgrade to Premium to access dynamically generated worker scripts tailored specifically to fix the errors found on your website.
                </p>
                <UpgradeButton userEmail={session.user.email || ""} />
              </div>
              <div className="opacity-30 pointer-events-none select-none blur-[2px]">
                <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-300 text-xs sm:text-sm overflow-x-auto font-mono">
                  <code>{proxyScript}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Code className="w-4 h-4" /> worker.js
              </p>
              <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-300 text-xs sm:text-sm overflow-x-auto font-mono border border-zinc-800 shadow-xl">
                <code>{proxyScript}</code>
              </pre>
              <p className="text-xs text-muted-foreground mt-4">
                * Instructions: Create a new Cloudflare Worker, paste this code, and route your domain traffic through it.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SectionCard({ title, icon, status, children }: { title: string, icon: React.ReactNode, status: string, children: React.ReactNode }) {
  const statusColors = {
    pass: "text-emerald-500",
    warning: "text-yellow-500",
    fatal: "text-red-500",
  } as Record<string, string>;
  
  const StatusIcon = status === "pass" ? CheckCircle2 : status === "warning" ? AlertTriangle : XCircle;
  const colorClass = statusColors[status] || statusColors.warning;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
          {icon} {title}
        </h3>
        {status && <StatusIcon className={`w-5 h-5 ${colorClass}`} />}
      </div>
      <div className="grid gap-3">
        {children}
      </div>
    </div>
  );
}

function Metric({ label, value, isLong }: { label: string, value: string, isLong?: boolean }) {
  return (
    <div className={`flex ${isLong ? 'flex-col gap-1.5' : 'items-center justify-between gap-4'} text-sm`}>
      <span className="text-muted-foreground font-medium shrink-0">{label}</span>
      <span className={`font-semibold text-foreground ${isLong ? 'line-clamp-2' : 'truncate text-right'}`} title={value}>
        {value}
      </span>
    </div>
  );
}
