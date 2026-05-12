import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects, scanResults, users, accounts } from "@/lib/db/schema";
import { eq, desc, inArray, gte, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Clock, ShieldCheck, History, Settings, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";
import { UpgradeButton } from "@/components/stripe/upgrade-button";
import { ManageSubscriptionButton } from "@/components/stripe/manage-subscription-button";
import { TrendChart } from "./trend-chart";
import { SocialLinkManager } from "./social-link-manager";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { Pagination } from "@/components/dashboard/pagination";
import { DeleteButton } from "@/components/dashboard/delete-button";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const domainFilter = searchParams.domain || "all";
  const dateFilter = searchParams.date || "all";
  const startFilter = searchParams.start;
  const endFilter = searchParams.end;
  const page = Number(searchParams.page) || 1;
  const itemsPerPage = 10;

  const userId = session.user.id || session.user.email || "";

  // User Profile
  const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
  const userDb = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
  const userPlan = userDb[0]?.plan || 'free';
  const projectIds = userProjects.map(p => p.id);
  const domains = Array.from(new Set(userProjects.map(p => p.domain)));

  // Date Filtering Logic
  let dateCondition = undefined;
  const now = new Date();
  if (dateFilter === 'today') {
    dateCondition = gte(scanResults.createdAt, new Date(now.setHours(0,0,0,0)));
  } else if (dateFilter === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    dateCondition = and(gte(scanResults.createdAt, yesterday), sql`${scanResults.createdAt} < ${today.getTime()}`);
  } else if (dateFilter === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateCondition = gte(scanResults.createdAt, weekAgo);
  } else if (dateFilter === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    dateCondition = gte(scanResults.createdAt, monthAgo);
  } else if (dateFilter === '3months') {
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    dateCondition = gte(scanResults.createdAt, threeMonthsAgo);
  } else if (dateFilter === 'custom' && startFilter && endFilter) {
    const start = new Date(startFilter);
    const end = new Date(endFilter);
    end.setHours(23,59,59,999);
    dateCondition = and(gte(scanResults.createdAt, start), sql`${scanResults.createdAt} <= ${end.getTime()}`);
  }

  // Domain Filter Logic
  let activeProjectIds = projectIds;
  if (domainFilter !== 'all') {
    const targetProject = userProjects.find(p => p.domain === domainFilter);
    activeProjectIds = targetProject ? [targetProject.id] : [];
  }

  // Fetch ALL matching scans for Trend Chart
  let chartScans: any[] = [];
  if (activeProjectIds.length > 0) {
    let conditions = [inArray(scanResults.projectId, activeProjectIds)];
    if (dateCondition) conditions.push(dateCondition);
    
    chartScans = await db.select().from(scanResults)
      .where(and(...conditions))
      .orderBy(desc(scanResults.createdAt));
  }

  // Fetch Paginated Scans for List
  let pagedScans: any[] = [];
  let hasNextPage = false;
  if (activeProjectIds.length > 0) {
    let conditions = [inArray(scanResults.projectId, activeProjectIds)];
    if (dateCondition) conditions.push(dateCondition);

    pagedScans = await db.select().from(scanResults)
      .where(and(...conditions))
      .orderBy(desc(scanResults.createdAt))
      .limit(itemsPerPage + 1)
      .offset((page - 1) * itemsPerPage);

    hasNextPage = pagedScans.length > itemsPerPage;
    if (hasNextPage) {
      pagedScans.pop(); // remove the extra item used for checking next page
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
    if (status === "warning") return <AlertTriangle className="text-yellow-500 w-5 h-5 flex-shrink-0" />;
    return <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />;
  };

  return (
    <main className="min-h-full bg-background p-6 md:p-10 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {userPlan === 'premium' ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Premium Plan (Unlimited Scans)
              </span>
            ) : (
              <span>Free Plan ({projectIds.length}/3 domains used)</span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {userPlan === 'premium' ? <ManageSubscriptionButton /> : <UpgradeButton userEmail={session.user.email || ""} />}
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer">
              New Scan <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <DashboardFilter domains={domains} />
          
          {chartScans.length > 0 && <TrendChart scans={chartScans} selectedDomain={domainFilter} />}
          
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" /> Scan History
            </h2>
            <div className="grid gap-4">
              {pagedScans.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No scans found</h2>
                  <p className="text-muted-foreground mb-6 max-w-sm">There are no scan records matching your current filter.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pagedScans.map((scan) => {
                    let basicSeo: any = {};
                    try { basicSeo = JSON.parse(scan.basicSeoJson); } catch (e) {}

                    const date = new Date(scan.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });

                    return (
                      <div key={scan.id} className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-4 sm:p-5 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <div className="flex items-start gap-3 w-full">
                          <div className="p-1.5 bg-background rounded-full border border-border/50 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                            {getStatusIcon(basicSeo.status || 'warning')}
                          </div>
                          
                          <div className="flex flex-col min-w-0 w-full">
                            <div className="flex items-center gap-2 mb-0.5 w-full">
                              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 border border-border/50 leading-none">Title</span>
                              <span className="text-sm font-medium truncate text-muted-foreground w-full" title={basicSeo.title}>{basicSeo.title || 'N/A'}</span>
                            </div>
                            
                            <h3 className="font-bold text-base text-foreground truncate w-full leading-tight" title={scan.url}>{scan.url}</h3>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-1.5 w-full">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 leading-none">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{date}</span>
                              </div>
                              
                              <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                                <DeleteButton id={scan.id} type="scan" compact />
                                <Link href={`/dashboard/scan/${scan.id}`} className="flex-1 sm:flex-none">
                                  <button className="w-full flex items-center justify-center gap-1.5 bg-background border border-border text-foreground hover:bg-muted font-semibold text-xs px-4 py-1.5 rounded-lg transition-all cursor-pointer">
                                    Details
                                  </button>
                                </Link>
                                <Link href={`/?url=${encodeURIComponent(scan.url)}`} className="flex-1 sm:flex-none">
                                  <button className="w-full flex items-center justify-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer">
                                    Re-scan
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <Pagination hasNextPage={hasNextPage} currentPage={page} />
          </div>
        </div>

        <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col gap-6">
          {/* Projects Management Panel */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> My Domains
            </h2>
            <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col gap-3 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full">
              {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No domains registered.</p>
              ) : (
                domains.map(domain => (
                  <div key={domain} className="flex items-center justify-between bg-background border border-border/50 p-3 rounded-xl shadow-sm">
                    <span className="font-semibold text-sm truncate pr-2">{domain}</span>
                    <DeleteButton id={domain} type="domain" compact />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Security Panel */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Account Security
              </h2>
              <Link href="/dashboard/profile">
                <button className="text-xs font-bold text-muted-foreground hover:text-emerald-500 bg-muted hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Profile Settings
                </button>
              </Link>
            </div>
            <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6 h-full">
              <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">Email Address</h3>
                <p className="text-foreground font-semibold break-all">{session.user.email}</p>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">Linked Social Accounts</h3>
                <div className="space-y-3">
                  <SocialLinkManager provider="google" label="Google" isConnected={userAccounts.some(a => a.provider === 'google')} totalAccounts={userAccounts.length} />
                  <SocialLinkManager provider="apple" label="Apple" isConnected={userAccounts.some(a => a.provider === 'apple')} totalAccounts={userAccounts.length} />
                  <SocialLinkManager provider="kakao" label="Kakao" isConnected={userAccounts.some(a => a.provider === 'kakao')} totalAccounts={userAccounts.length} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
