import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects, scanResults, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { UpgradeButton } from "@/components/stripe/upgrade-button";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Use email as a fallback if id is not present
  const userId = session.user.id || session.user.email || "";

  // Fetch user projects and plan
  const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
  const userDb = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
  const userPlan = userDb[0]?.plan || 'free';
  
  // If no projects, return empty state
  if (userProjects.length === 0) {
    return (
      <main className="min-h-full bg-background p-6 md:p-12 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No scans yet</h2>
          <p className="text-muted-foreground mb-6">You haven't scanned any websites yet. Go to the home page to run your first SEO check.</p>
          <Link href="/">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Run a Scan
            </button>
          </Link>
        </div>
      </main>
    );
  }

  // Fetch scan results for all projects of this user
  const projectIds = userProjects.map(p => p.id);
  // Ideally we would use `inArray(scanResults.projectId, projectIds)` but let's do multiple selects or just fetch all and filter if it's small,
  // but let's just do a simple approach. Since SQLite proxy might not support complex IN queries out of the box in some older drizzle versions, 
  // let's fetch all scanResults for these projects.
  
  let allScans: any[] = [];
  for (const pid of projectIds) {
    const scans = await db.select().from(scanResults).where(eq(scanResults.projectId, pid)).orderBy(desc(scanResults.createdAt));
    allScans = [...allScans, ...scans];
  }

  // Sort by date descending
  allScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
    if (status === "warning") return <AlertTriangle className="text-yellow-500 w-5 h-5 flex-shrink-0" />;
    return <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />;
  };

  return (
    <main className="min-h-full bg-background p-6 md:p-12 max-w-6xl mx-auto w-full">
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
        <div className="flex items-center gap-3">
          {userPlan !== 'premium' && <UpgradeButton />}
          <Link href="/">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              New Scan
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {allScans.map((scan) => {
          let basicSeo: any = {};
          try {
            basicSeo = JSON.parse(scan.basicSeoJson);
          } catch (e) {}

          const date = new Date(scan.createdAt).toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          });

          return (
            <div key={scan.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start md:items-center gap-4">
                <div className="mt-1 md:mt-0">
                  {getStatusIcon(basicSeo.status || 'warning')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{scan.url}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col text-sm">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium max-w-[200px] truncate">{basicSeo.title || 'N/A'}</span>
                </div>
                {/* For MVP, click goes to home page with URL. In future, goes to detailed report page */}
                <Link href={`/?url=${encodeURIComponent(scan.url)}`}>
                  <button className="flex items-center gap-1 text-emerald-500 hover:text-emerald-600 font-medium text-sm transition-colors">
                    Re-scan <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
