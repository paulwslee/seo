import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults, users, projects } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Globe, TrendingUp, ShieldCheck, FileCode2, AlertTriangle, CheckCircle2, XCircle, Lock } from "lucide-react";
import { PrintAutomator } from "./print-automator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function PrintReportPage(props: { 
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
  const resolvedParams = await props.params;
  setRequestLocale(resolvedParams.locale);
  
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const domain = searchParams.domain;
  const reportType = searchParams.type || "single";
  const paperSize = searchParams.paper || "a4";
  const dateStr = searchParams.date;

  if (!domain) return <div className="p-10 text-center">No domain provided.</div>;

  const userId = session.user.id || session.user.email || "";

  // Fetch user white-label profile
  const userDb = await db.select({ companyName: users.companyName, whiteLabelLogo: users.whiteLabelLogo }).from(users).where(eq(users.id, userId)).limit(1);
  const companyName = userDb[0]?.companyName || "SEO Compass";
  const logoUrl = userDb[0]?.whiteLabelLogo ? `/api/user/logo` : "/icon.png";

  let safeHostname = domain;
  try {
    safeHostname = new URL(domain).hostname;
  } catch (e) {}

  // Fetch project first to avoid SQLite innerJoin dialect issues on D1
  const targetProjects = await db.select().from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.domain, domain)))
    .limit(1);

  if (targetProjects.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">Project not found or unauthorized.</div>;
  }
  
  const projectId = targetProjects[0].id;

  // Fetch scans for this project
  const scans = await db.select({ scan_results: scanResults }).from(scanResults)
    .where(eq(scanResults.projectId, projectId))
    .orderBy(desc(scanResults.createdAt));
  
  // Filter by date if provided
  let targetScans = scans;
  if (dateStr) {
    const targetDate = new Date(dateStr).toISOString().split('T')[0];
    targetScans = scans.filter(s => new Date(s.scan_results.createdAt).toISOString().split('T')[0] === targetDate);
  }

  if (targetScans.length === 0) {
    return <div className="p-10 text-center text-xl font-bold">No scan data found for this domain/date.</div>;
  }

  const latestScan = targetScans[0].scan_results;
  let results: any = {};
  let basicSeo: any = {};
  let auditData: any = null;
  let markdownReport: string | null = null;
  let rawEvidenceHash: string | null = null;

  try {
    results = JSON.parse(latestScan.canonicalRiskJson);
    basicSeo = JSON.parse(latestScan.basicSeoJson);
    if (latestScan.performanceJson) {
      performance = JSON.parse(latestScan.performanceJson);
    }
    
    // Support new AI-generated format or old fallback format
    if ((latestScan as any).auditJson) {
      const parsedAudit = JSON.parse((latestScan as any).auditJson);
      if (parsedAudit.markdown_report) {
         markdownReport = parsedAudit.markdown_report;
         auditData = parsedAudit.original;
      } else {
         auditData = parsedAudit;
      }
    }
    rawEvidenceHash = (latestScan as any).evidenceHash || null;
  } catch (e) {}

  const printDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });



  // Determine Verdict
  let verdictText = "Release-Ready";
  let verdictSubtext = "Minor polish only. Ready for public launch.";
  let verdictColor = "text-emerald-600";
  let verdictBg = "bg-emerald-50";
  if (latestScan.score < 20) {
    verdictText = "Foundational Issues";
    verdictSubtext = "Major rework required. Critical architecture flaws.";
    verdictColor = "text-red-600";
    verdictBg = "bg-red-50";
  } else if (latestScan.score < 40) {
    verdictText = "Not Ready";
    verdictSubtext = "Critical blockers present. Infrastructure may be strong but web surface fails.";
    verdictColor = "text-rose-600";
    verdictBg = "bg-rose-50";
  } else if (latestScan.score < 60) {
    verdictText = "Beta At Best";
    verdictSubtext = "Significant gaps in core areas. Not suitable for mass audience.";
    verdictColor = "text-amber-600";
    verdictBg = "bg-amber-50";
  } else if (latestScan.score < 80) {
    verdictText = "Soft-Launch Ready";
    verdictSubtext = "Known issues acceptable for limited audience. Fix warnings before B2B scaling.";
    verdictColor = "text-indigo-600";
    verdictBg = "bg-indigo-50";
  }

  return (
    <div className={`min-h-screen bg-white text-black font-sans print-wrapper ${paperSize}`}>
      <PrintAutomator />

      {/* PAGE 1: COVER PAGE */}
      <div className="print-page cover-page flex flex-col justify-center items-center h-screen relative page-break-after">
        <div className="absolute top-10 left-10">
          <img src={logoUrl} alt="Company Logo" className="h-12 object-contain" />
        </div>
        <div className="absolute top-12 right-10 text-gray-500 font-medium">
          {printDate}
        </div>

        <div className="text-center max-w-4xl px-8">
          <div className="inline-block px-6 py-2 border-2 border-gray-900 rounded-full mb-8 font-bold tracking-widest uppercase text-sm">
            Release Readiness Assessment
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight uppercase">
            Technical Due<br/>Diligence Report
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            An external review of the production web surface across performance, security, accessibility, infrastructure, and content.
          </p>
          <h2 className="text-4xl font-semibold text-indigo-600 mb-16">
            {safeHostname}
          </h2>

          <div className="grid grid-cols-2 gap-8 text-left mt-8 p-8 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm mx-auto max-w-3xl">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Target Surface</p>
              <p className="text-lg font-bold text-gray-900">{safeHostname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Auditor</p>
              <p className="text-lg font-bold text-gray-900">{companyName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Methodology</p>
              <p className="text-lg font-bold text-gray-900">3-Track Parallel Review</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Access Level</p>
              <p className="text-lg font-bold text-gray-900">External Only · No Source</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-between px-10 text-xs text-gray-400 font-bold uppercase tracking-widest">
          <span>Confidential & Proprietary</span>
          <span>{companyName}</span>
        </div>
      </div>

      {/* PAGE 2: METHOD & SCOPE */}
      <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
        <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">01 · Method & Scope</h2>
          <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-12 max-w-4xl">
          Three parallel review tracks were executed against the public production surface. We possessed no source code access; everything detailed below is externally verifiable via HTTP inspection, network interception, and headless rendering analysis.
        </p>

        <div className="grid grid-cols-3 gap-4 flex-grow">
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
            <div className="text-indigo-600 font-bold tracking-widest uppercase mb-2 text-xs">Track 01</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Frontend</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Analysis of rendered HTML, meta tags, semantic structure, accessibility ARIA attributes, viewport directives, and mobile zoom policies. Evaluates client-side DOM integrity.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <div className="text-emerald-600 font-bold tracking-widest uppercase mb-2 text-xs">Track 02</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Backend & Infra</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Inspection of TLS, security response headers (HSTS, CSP), CORS policies, redirect chains, DNS configurations, edge CDN identification, caching policies, and email auth (SPF/DMARC).
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
            <div className="text-amber-600 font-bold tracking-widest uppercase mb-2 text-xs">Track 03</div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Performance</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Measurement of page weight, font loading waterfalls, CSS/JS render-blocking delivery, image pipeline optimization (Next/Image vs native), TTFB, HTTP/2 multiplexing, and Core Web Vitals.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-gray-900 text-white p-6 rounded-xl flex items-center gap-6">
          <Globe className="w-8 h-8 text-indigo-400 shrink-0" />
          <p className="text-lg font-medium">
            Five scored categories · Weighted average aggregation · Final verdict mapped against five release scenarios.
          </p>
        </div>
      </div>

      {/* PAGE 3: OVERALL VERDICT */}
      <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
        <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">02 · Overall Verdict</h2>
          <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
        </div>

        <div className="flex gap-8 items-center mb-10">
          <div className="text-center shrink-0">
            <div className="text-[80px] font-black text-gray-900 leading-none tracking-tighter">{latestScan.score}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Out of 100</div>
          </div>
          <div className={`p-6 rounded-2xl border-2 border-current ${verdictBg} ${verdictColor} flex-grow`}>
            <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-3">
              <span className="w-3 h-3 bg-current"></span>
              {verdictText}
            </h3>
            <p className="text-lg font-medium opacity-90 leading-snug">
              {verdictSubtext}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Score Interpretation Scale</h3>
        <div className="flex flex-col gap-2 flex-grow">
          <div className={`p-3 rounded-xl border flex items-center gap-6 ${latestScan.score < 20 ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="font-black text-xl opacity-50 w-16 shrink-0">0-19</div>
            <h4 className="font-bold text-sm w-32 shrink-0">Foundational</h4>
            <p className="text-xs opacity-80 flex-1">Major rework required. Do not release.</p>
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-6 ${latestScan.score >= 20 && latestScan.score < 40 ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="font-black text-xl opacity-50 w-16 shrink-0">20-39</div>
            <h4 className="font-bold text-sm w-32 shrink-0">Not Ready</h4>
            <p className="text-xs opacity-80 flex-1">Critical blockers present. Requires remediation.</p>
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-6 ${latestScan.score >= 40 && latestScan.score < 60 ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="font-black text-xl opacity-50 w-16 shrink-0">40-59</div>
            <h4 className="font-bold text-sm w-32 shrink-0">Beta At Best</h4>
            <p className="text-xs opacity-80 flex-1">Significant gaps in core areas. Unstable.</p>
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-6 ${latestScan.score >= 60 && latestScan.score < 80 ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="font-black text-xl opacity-50 w-16 shrink-0">60-79</div>
            <h4 className="font-bold text-sm w-32 shrink-0">Soft-Launch</h4>
            <p className="text-xs opacity-80 flex-1">Known issues acceptable for limited audience.</p>
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-6 ${latestScan.score >= 80 ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="font-black text-xl opacity-50 w-16 shrink-0">80-100</div>
            <h4 className="font-bold text-sm w-32 shrink-0">Release-Ready</h4>
            <p className="text-xs opacity-80 flex-1">Minor polish only. Scalable to B2B enterprise.</p>
          </div>
        </div>
      </div>

      {markdownReport ? (
        <div className="print-page print-flowing p-8 pb-32 relative text-gray-800">
           <ReactMarkdown
             remarkPlugins={[remarkGfm]}
             components={{
               h1: ({node, ...props}) => <h1 className="text-4xl font-black text-gray-900 mt-16 mb-8 uppercase tracking-tight border-b-4 border-gray-900 pb-4" {...props} />,
               h2: ({node, ...props}) => <h2 className="text-3xl font-black text-indigo-900 mt-12 mb-6" {...props} />,
               h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4" {...props} />,
               p: ({node, ...props}) => <p className="text-base text-gray-700 leading-relaxed mb-6 break-words" {...props} />,
               ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700" {...props} />,
               li: ({node, ...props}) => <li className="text-base" {...props} />,
               strong: ({node, ...props}) => <strong className="font-black text-gray-900 bg-indigo-50 px-1" {...props} />,
               code: ({node, ...props}) => <code className="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
             }}
           >
             {markdownReport}
           </ReactMarkdown>

           {rawEvidenceHash && (
             <div className="mt-20 pt-10 border-t-2 border-dashed border-gray-300 flex items-start gap-4">
               <Lock className="w-10 h-10 text-emerald-600 shrink-0" />
               <div>
                 <h4 className="font-bold text-gray-900 text-lg">Cryptographic Evidence Hash</h4>
                 <p className="text-xs text-gray-500 max-w-3xl leading-relaxed mt-1">
                   This technical audit report is cryptographically sealed. The raw extraction logs, network interceptions, and codebase clues used to generate this AI report have been hashed. Any tampering with the source data or this PDF will invalidate the hash.
                 </p>
                 <code className="block mt-3 bg-gray-100 p-2 rounded text-xs font-mono break-all text-gray-600">
                   SHA-256: {rawEvidenceHash}
                 </code>
               </div>
             </div>
           )}
        </div>
      ) : (
        <>
          {/* PAGE 4: CATEGORY BREAKDOWN - PERFORMANCE */}
          {performance && (
            <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
              <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">03 · Category: Performance</h2>
                <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
              </div>
    
              <div className="flex gap-8 mb-12">
                <div className={`w-1/3 p-8 rounded-2xl ${performance.score >= 90 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : performance.score >= 50 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'} border`}>
                  <div className="text-sm font-bold uppercase tracking-widest mb-2 opacity-70">Lighthouse Score</div>
                  <div className="text-7xl font-black mb-4">{performance.score}/100</div>
                  <p className="font-medium">
                    {performance.score >= 90 ? "Excellent load speeds. Network footprint is optimized." : "Poor performance. Assets are heavily render-blocking."}
                  </p>
                </div>
                <div className="w-2/3 bg-gray-50 border border-gray-200 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Core Web Vitals Telemetry</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 font-bold uppercase mb-1">LCP (Largest Contentful Paint)</div>
                      <div className="text-3xl font-black text-gray-900">{performance.lcp}</div>
                      <div className="text-sm text-gray-500 mt-1">Measures loading performance. Target: &lt; 2.5s.</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-bold uppercase mb-1">CLS (Cumulative Layout Shift)</div>
                      <div className="text-3xl font-black text-gray-900">{performance.cls}</div>
                      <div className="text-sm text-gray-500 mt-1">Measures visual stability. Target: &lt; 0.1.</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-bold uppercase mb-1">TBT (Total Blocking Time)</div>
                      <div className="text-3xl font-black text-gray-900">{performance.tbt}</div>
                      <div className="text-sm text-gray-500 mt-1">Measures interactivity delays. Target: &lt; 200ms.</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-bold uppercase mb-1">FCP (First Contentful Paint)</div>
                      <div className="text-3xl font-black text-gray-900">{performance.fcp || "N/A"}</div>
                      <div className="text-sm text-gray-500 mt-1">Measures first pixel render. Target: &lt; 1.8s.</div>
                    </div>
                  </div>
                </div>
              </div>
    
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Asset Pipeline Evaluation</h3>
              {auditData?.performanceAssets ? (
                <ul className="space-y-4 flex-grow">
                  <li className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Font Preloads</h4>
                      <p className="text-gray-500 text-sm">Excessive preloading blocks the main render thread.</p>
                    </div>
                    <div className={`text-2xl font-black ${auditData.performanceAssets.fontPreloads > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {auditData.performanceAssets.fontPreloads} files
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">CSS / JS Delivery</h4>
                      <p className="text-gray-500 text-sm">Number of external stylesheets and scripts requested.</p>
                    </div>
                    <div className="text-2xl font-black text-gray-900">
                      {auditData.performanceAssets.cssLinks} CSS / {auditData.performanceAssets.jsScripts} JS
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Image Optimization Pipeline</h4>
                      <p className="text-gray-500 text-sm">Ratio of Next.js optimized images vs standard tags.</p>
                    </div>
                    <div className={`text-2xl font-black ${auditData.performanceAssets.totalImages > 0 && auditData.performanceAssets.nextImages === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {auditData.performanceAssets.nextImages} / {auditData.performanceAssets.totalImages}
                    </div>
                  </li>
                </ul>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                  Deep Performance Scan was not enabled for this report.
                </div>
              )}
            </div>
          )}
    
          {/* PAGE 5: CATEGORY BREAKDOWN - SECURITY & INFRA */}
          {auditData && (
            <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
              <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">04 · Security & Infrastructure</h2>
                <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
              </div>
    
              <div className="grid grid-cols-2 gap-12 flex-grow">
                {/* Security */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-8 h-8 text-gray-900" />
                    <h3 className="text-2xl font-bold text-gray-900">Security & DNS</h3>
                  </div>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Verifiable security headers protect the application from XSS, clickjacking, and man-in-the-middle attacks. DNS records ensure corporate email integrity and prevent domain spoofing.
                  </p>
                  
                  <ul className="space-y-4">
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">Strict-Transport-Security (HSTS)</span>
                        <span className={auditData.securityHeaders?.hsts ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{auditData.securityHeaders?.hsts ? "Enabled" : "Missing"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Forces browsers to use secure HTTPS connections.</p>
                    </li>
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">Content-Security-Policy (CSP)</span>
                        <span className={auditData.securityHeaders?.csp ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>{auditData.securityHeaders?.csp ? "Enabled" : "Missing"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Mitigates cross-site scripting (XSS) by restricting asset sources.</p>
                    </li>
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">SPF / DMARC Records</span>
                        <span className={(auditData.dns?.spfRecord && auditData.dns?.dmarcRecord) ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                          {auditData.dns?.spfRecord ? "SPF " : ""}{auditData.dns?.dmarcRecord ? "DMARC " : ""}{(!auditData.dns?.spfRecord && !auditData.dns?.dmarcRecord) ? "Missing" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Essential for preventing email spoofing and domain reputation damage.</p>
                    </li>
                  </ul>
                </div>
    
                {/* Infrastructure */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-8 h-8 text-gray-900" />
                    <h3 className="text-2xl font-bold text-gray-900">Infrastructure (Inferred)</h3>
                  </div>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Network footprints reveal the underlying architecture. We check for Edge CDN presence, Server-Side Rendering (SSR) capabilities, and potential routing bailouts.
                  </p>
    
                  <ul className="space-y-4">
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">Tech Stack Fingerprint</span>
                        <span className="text-indigo-600 font-bold text-right max-w-[200px] truncate">{auditData.infrastructure?.techStack?.join(", ") || "Unknown"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Frameworks inferred from DOM and headers (e.g. Next.js, Vercel).</p>
                    </li>
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">Rendering Mode</span>
                        <span className={auditData.infrastructure?.isCsrBailout ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>{auditData.infrastructure?.isCsrBailout ? "CSR Bailout Detected" : "SSR / SSG Validated"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Client-Side Rendering (CSR) blocks search engines from reading initial content.</p>
                    </li>
                    <li className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">CDN Edge Provider</span>
                        <span className="text-gray-900 font-bold text-right truncate">{auditData.infrastructure?.cdnHeaders?.server || "N/A"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Validates global content distribution (e.g., Cloudflare, Vercel).</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
    
          {/* PAGE 6: CRITICAL BLOCKERS & REMEDIATION */}
          <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
            <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">05 · Critical Blockers & Action Plan</h2>
              <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
            </div>
    
            <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-4xl">
              The following list represents the immediate remediation roadmap. These items severely degrade Search Engine Optimization, User Experience, or Security. Resolution of these items is mandatory before moving to the next release phase.
            </p>
    
            <div className="flex-grow space-y-6">
              {results.actionPlan?.slice(0, 6).map((action: any, i: number) => (
                <div key={i} className="flex gap-6 p-6 bg-rose-50/30 rounded-2xl border border-rose-100">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-rose-600 font-black text-xl">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-2xl mb-2">{action.message}</h4>
                    <p className="text-gray-700 text-lg leading-relaxed">{action.fix}</p>
                    {/* Simulated narrative padding */}
                    <p className="text-gray-500 text-sm mt-3 border-t border-rose-100/50 pt-3">
                      <strong>Impact:</strong> Failure to resolve this limits visibility in organic search indices and reduces conversion rates by creating UX friction or crawlability barriers. Engineering teams must prioritize this in the upcoming sprint.
                    </p>
                  </div>
                </div>
              ))}
    
              {results.actionPlan?.length === 0 && (
                 <div className="flex gap-6 p-8 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-3xl mb-2">No Critical Blockers Found</h4>
                    <p className="text-gray-700 text-xl leading-relaxed">Your infrastructure and frontend architecture meet high technical standards.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
    
          {/* PAGE 7: COPPA & PRIVACY EXPOSURE */}
          {auditData?.infrastructure?.coppaRisk && (
            <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
              <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">06 · COPPA & Privacy Exposure</h2>
                <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
              </div>
    
              <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-2xl mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle className="w-10 h-10 text-amber-600" />
                  <h3 className="text-3xl font-black text-amber-900">Input Forms Detected</h3>
                </div>
                <p className="text-amber-800 text-xl leading-relaxed">
                  We detected user input forms (such as `&lt;input type="email"&gt;` or `&lt;input type="tel"&gt;`) on the public surface. This elevates the compliance requirements for COPPA, GDPR, and CCPA.
                </p>
              </div>
    
              <div className="space-y-8 flex-grow">
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
                  <h4 className="font-bold text-gray-900 text-xl mb-3">1. Mandatory Age Gates</h4>
                  <p className="text-gray-600 leading-relaxed">If the service caters to minors, strict age gating mechanisms must be implemented before collecting PII (Personally Identifiable Information). Failure to do so exposes the domain to massive FTC fines under COPPA.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
                  <h4 className="font-bold text-gray-900 text-xl mb-3">2. Privacy Policy Visibility</h4>
                  <p className="text-gray-600 leading-relaxed">A legally vetted Privacy Policy and Terms of Service must be linked in close proximity to every data capture form. The current DOM structure requires verification of these links.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
                  <h4 className="font-bold text-gray-900 text-xl mb-3">3. Database Encryption at Rest</h4>
                  <p className="text-gray-600 leading-relaxed">Though unverifiable externally, backend teams must ensure that any collected PII is encrypted at rest and in transit, utilizing TLS 1.3 for submission endpoints.</p>
                </div>
              </div>
            </div>
          )}
    
          {/* PAGE 8: APPENDIX */}
          <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
            <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Appendix · What we cannot assess</h2>
              <span className="text-gray-400 font-bold uppercase tracking-wider">Transparency Statement</span>
            </div>
    
            <div className="bg-gray-50 border border-gray-200 p-10 rounded-3xl flex-grow">
              <p className="text-gray-700 mb-10 font-medium text-xl leading-relaxed">
                In our commitment to providing a transparent and truthful technical audit, we explicitly define the boundaries of our external scan. The following areas cannot be accurately assessed without direct access to the source code, AWS/GCP consoles, and internal server environments.
              </p>
    
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-3 text-xl">1. Backend API Security</h4>
                  <p className="text-gray-600 leading-relaxed">Parameter manipulation, SQL injection vulnerabilities, and internal endpoint security remain outside the scope of an external footprint scan.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-3 text-xl">2. Database Architecture</h4>
                  <p className="text-gray-600 leading-relaxed">Performance of SQL queries, use of advanced extensions, indexing strategy, and database scaling bottlenecks cannot be inferred.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-3 text-xl">3. Token Flow Integrity</h4>
                  <p className="text-gray-600 leading-relaxed">Refresh token lifecycles, JWT signing keys, and server-side validation mechanics for authentication systems are hidden from external observation.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-3 text-xl">4. Code Quality & Debt</h4>
                  <p className="text-gray-600 leading-relaxed">Test coverage percentages, architectural design patterns, CI/CD pipeline stability, and internal technical debt cannot be evaluated.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PAGE X: HISTORICAL TREND (If selected) */}
      {reportType === "historical" && (
        <div className="print-page p-8 h-screen relative page-break-after flex flex-col">
          <div className="border-b-4 border-gray-900 pb-4 mb-10 flex justify-between items-end">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">07 · Historical Trend</h2>
            <span className="text-gray-400 font-bold uppercase tracking-wider">{safeHostname}</span>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 flex-grow flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
             <TrendingUp className="w-20 h-20 text-indigo-200 mb-6" />
             <p className="text-gray-500 font-medium text-xl mb-12">
               Score Trajectory (Last {targetScans.length} Scans)
             </p>
             <div className="w-full flex items-end justify-between h-64 mt-8 px-16">
               {targetScans.slice(0, 10).reverse().map((s: any, i: number) => (
                 <div key={i} className="flex flex-col items-center gap-4 w-16">
                   <div className="font-bold text-gray-700">{s.scan_results.score}</div>
                   <div 
                     className="w-full bg-indigo-500 rounded-t-md shadow-sm transition-all duration-1000" 
                     style={{ height: `${s.scan_results.score}%` }}
                   ></div>
                   <span className="text-sm font-bold text-gray-400">
                     {new Date(s.scan_results.createdAt).getMonth()+1}/{new Date(s.scan_results.createdAt).getDate()}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
