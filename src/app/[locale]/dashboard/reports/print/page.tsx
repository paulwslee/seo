import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scanResults, users, projects } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Globe, TrendingUp, ShieldCheck, FileCode2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { PrintAutomator } from "./print-automator";

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
  let performance: any = null;
  let auditData: any = null;
  try {
    results = JSON.parse(latestScan.canonicalRiskJson);
    basicSeo = JSON.parse(latestScan.basicSeoJson);
    if (latestScan.performanceJson) {
      performance = JSON.parse(latestScan.performanceJson);
    }
    if ((latestScan as any).auditJson) {
      auditData = JSON.parse((latestScan as any).auditJson);
    }
  } catch (e) {}

  const printDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`min-h-screen bg-white text-black font-sans print-wrapper ${paperSize}`}>
      <PrintAutomator />

      {/* COVER PAGE */}
      <div className="print-page cover-page flex flex-col justify-center items-center h-screen relative page-break-after">
        <div className="absolute top-10 left-10">
          <img src={logoUrl} alt="Company Logo" className="h-12 object-contain" />
        </div>
        <div className="absolute top-12 right-10 text-gray-500 font-medium">
          {printDate}
        </div>

        <div className="text-center max-w-3xl px-8">
          <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-8">
            <Globe className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
            Comprehensive<br/>SEO Audit Report
          </h1>
          <h2 className="text-3xl font-semibold text-indigo-600 mb-12">
            {safeHostname}
          </h2>

          <div className="grid grid-cols-2 gap-8 text-left mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Prepared For</p>
              <p className="text-xl font-bold text-gray-900">{safeHostname}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Prepared By</p>
              <p className="text-xl font-bold text-gray-900">{companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Overall SEO Score</p>
              <p className="text-4xl font-black text-emerald-600">{latestScan.score}/100</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Report Type</p>
              <p className="text-xl font-bold text-gray-900">{reportType === 'single' ? 'Single Snapshot' : 'Historical Analysis'}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 text-center text-sm text-gray-400 font-medium">
          Confidential & Proprietary • {companyName}
        </div>
      </div>

      {/* PAGE 2: EXECUTIVE SUMMARY */}
      <div className="print-page p-12 h-screen relative page-break-after">
        <div className="border-b-2 border-gray-900 pb-4 mb-8 flex justify-between items-end">
          <h2 className="text-3xl font-black text-gray-900">Executive Summary</h2>
          <span className="text-gray-500 font-bold">{safeHostname}</span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
             <div className="text-sm font-bold text-gray-500 uppercase">Health Score</div>
             <div className="text-4xl font-black text-gray-900 mt-2">{latestScan.score}</div>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
             <div className="text-sm font-bold text-gray-500 uppercase">Indexability</div>
             <div className="text-2xl font-bold text-gray-900 mt-2 capitalize">{results.indexability || "Unknown"}</div>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <FileCode2 className="w-8 h-8 text-indigo-500 mb-4" />
             <div className="text-sm font-bold text-gray-500 uppercase">Tech Status</div>
             <div className="text-2xl font-bold text-gray-900 mt-2 capitalize">{results.technicalSeo?.status || "Pass"}</div>
           </div>
        </div>

        {/* PERFORMANCE METRICS SECTION (If Available) */}
        {performance && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Web Vitals & Performance</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-gray-500 uppercase">Performance</span>
                <span className={`text-3xl font-black mt-2 ${performance.score >= 90 ? 'text-emerald-500' : performance.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{performance.score}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-gray-500 uppercase">LCP</span>
                <span className="text-xl font-bold text-gray-900 mt-2">{performance.lcp}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-gray-500 uppercase">CLS</span>
                <span className="text-xl font-bold text-gray-900 mt-2">{performance.cls}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-gray-500 uppercase">TBT</span>
                <span className="text-xl font-bold text-gray-900 mt-2">{performance.tbt}</span>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Findings</h3>
        <ul className="space-y-4">
          {results.actionPlan?.slice(0, 5).map((action: any, i: number) => (
            <li key={i} className="flex gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
              <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-lg mb-1">{action.message}</p>
                <p className="text-gray-600">{action.fix}</p>
              </div>
            </li>
          ))}
          {results.actionPlan?.length === 0 && (
             <li className="flex gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-lg">No critical errors found</p>
                <p className="text-gray-600">Your site is excellently optimized.</p>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* PAGE 3: TECHNICAL DUE DILIGENCE (Inferred & Verified) */}
      {auditData && (
        <div className="print-page p-12 h-screen relative page-break-after">
          <div className="border-b-2 border-gray-900 pb-4 mb-8 flex justify-between items-end">
            <h2 className="text-3xl font-black text-gray-900">Technical Due Diligence</h2>
            <span className="text-gray-500 font-bold">{safeHostname}</span>
          </div>

          <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm font-medium">
            <strong>⚠️ Disclaimer:</strong> Some metrics below are "Inferred from external footprint". This means we analyzed the network response without having direct source code access.
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Security */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Security & DNS (Verified)</h3>
              <ul className="space-y-3">
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">SPF Record</span>
                  <span className={auditData.dns?.spfRecord ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{auditData.dns?.spfRecord ? "Configured" : "Missing"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">DMARC Record</span>
                  <span className={auditData.dns?.dmarcRecord ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{auditData.dns?.dmarcRecord ? "Configured" : "Missing"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">HSTS Header</span>
                  <span className={auditData.securityHeaders?.hsts ? "text-emerald-600 font-bold" : "text-yellow-600 font-bold"}>{auditData.securityHeaders?.hsts ? "Enabled" : "Missing"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">CSP Header</span>
                  <span className={auditData.securityHeaders?.csp ? "text-emerald-600 font-bold" : "text-yellow-600 font-bold"}>{auditData.securityHeaders?.csp ? "Enabled" : "Missing"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Permissions-Policy</span>
                  <span className={auditData.securityHeaders?.permissionsPolicy ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{auditData.securityHeaders?.permissionsPolicy ? "Enabled" : "Missing"}</span>
                </li>
              </ul>
            </div>

            {/* Infrastructure */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Infrastructure (Inferred)</h3>
              <ul className="space-y-3">
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Tech Stack</span>
                  <span className="text-indigo-600 font-bold text-right">{auditData.infrastructure?.techStack?.join(", ") || "Unknown"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Rendering Mode</span>
                  <span className={auditData.infrastructure?.isCsrBailout ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{auditData.infrastructure?.isCsrBailout ? "Client-Side (CSR Bailout Risk)" : "SSR / SSG"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">CDN Server</span>
                  <span className="text-gray-900 font-bold text-right truncate max-w-[150px]">{auditData.infrastructure?.cdnHeaders?.server || "N/A"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">COPPA/Privacy Risk</span>
                  <span className={auditData.infrastructure?.coppaRisk ? "text-yellow-600 font-bold" : "text-emerald-600 font-bold"}>{auditData.infrastructure?.coppaRisk ? "Potential (Forms Found)" : "Low"}</span>
                </li>
              </ul>
            </div>

            {/* Performance Assets (NEW) */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Performance (Payload)</h3>
              <ul className="space-y-3">
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Font Preloads</span>
                  <span className={auditData.performanceAssets?.fontPreloads > 10 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{auditData.performanceAssets?.fontPreloads || 0} files</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">CSS & JS Assets</span>
                  <span className="text-gray-900 font-bold">{auditData.performanceAssets?.cssLinks || 0} CSS / {auditData.performanceAssets?.jsScripts || 0} JS</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Image Optimization</span>
                  <span className={auditData.performanceAssets?.totalImages > 0 && auditData.performanceAssets?.nextImages === 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                    {auditData.performanceAssets?.nextImages || 0} / {auditData.performanceAssets?.totalImages || 0} optimized
                  </span>
                </li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Accessibility & Usability</h3>
              <ul className="space-y-3">
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Mobile Zoom Blocked</span>
                  <span className={auditData.accessibility?.isMobileZoomBlocked ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{auditData.accessibility?.isMobileZoomBlocked ? "Yes (Bad for WCAG)" : "No"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Semantic HTML Elements</span>
                  <span className={auditData.accessibility?.hasSemanticHTML ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{auditData.accessibility?.hasSemanticHTML ? "Detected" : "Not Detected"}</span>
                </li>
                <li className="flex justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-600 font-medium">Missing Image Alt Tags</span>
                  <span className={auditData.accessibility?.imagesMissingAlt > 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{auditData.accessibility?.imagesMissingAlt || 0} issues</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* APPENDIX PAGE: OUT OF SCOPE */}
      <div className="print-page p-12 h-screen relative page-break-after">
        <div className="border-b-2 border-gray-900 pb-4 mb-8 flex justify-between items-end">
          <h2 className="text-3xl font-black text-gray-900">Appendix: Not Assessed</h2>
          <span className="text-gray-500 font-bold">Transparency Statement</span>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
          <p className="text-gray-600 mb-6 font-medium text-lg">
            In our commitment to providing a transparent and truthful technical audit, we explicitly define the boundaries of our external scan. The following areas cannot be accurately assessed without direct access to the source code and internal server environment.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2">1. Backend API Security</h4>
              <p className="text-sm text-gray-500">Parameter manipulation, SQL injection vulnerabilities, and internal endpoint security remain outside the scope of an external footprint scan.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2">2. Database Architecture</h4>
              <p className="text-sm text-gray-500">Performance of SQL queries, use of advanced extensions (e.g., PostGIS), and database optimization cannot be inferred.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2">3. Token Flow Integrity</h4>
              <p className="text-sm text-gray-500">Refresh token lifecycles and server-side validation mechanics for authentication systems are hidden from external observation.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2">4. Code Quality & Debt</h4>
              <p className="text-sm text-gray-500">Test coverage percentages, architectural design patterns, and internal technical debt cannot be evaluated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE X: HISTORICAL TREND (If selected) */}
      {reportType === "historical" && (
        <div className="print-page p-12 h-screen relative page-break-after">
          <div className="border-b-2 border-gray-900 pb-4 mb-8 flex justify-between items-end">
            <h2 className="text-3xl font-black text-gray-900">Historical Trend</h2>
            <span className="text-gray-500 font-bold">{safeHostname}</span>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 h-96 flex flex-col justify-center items-center">
             <TrendingUp className="w-16 h-16 text-indigo-300 mb-4" />
             <p className="text-gray-500 font-medium">
               (Chart rendering engine will generate graph here showing last {targetScans.length} scans)
             </p>
             <div className="w-full flex items-end justify-between h-48 mt-8 px-10">
               {targetScans.slice(0, 10).reverse().map((s: any, i: number) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                   <div 
                     className="w-12 bg-indigo-500 rounded-t-sm" 
                     style={{ height: `${s.scan_results.score}%` }}
                   ></div>
                   <span className="text-xs font-bold text-gray-400">
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
