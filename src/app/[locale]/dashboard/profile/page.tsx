import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Settings, User, Mail, Bell, FileText, LayoutTemplate, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { EmailUpdateForm } from "./email-update-form";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id || session.user.email || "";
  const userDb = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const userProfile = userDb[0];

  if (!userProfile) {
    redirect("/login");
  }

  const currentEmail = userProfile.email || "";
  // Check if it's a "fake" email (e.g. from Kakao without email consent)
  const isFakeEmail = currentEmail.endsWith("@kakao.com") && currentEmail.split("@")[0].match(/^\d+$/);
  const canEditEmail = !currentEmail || isFakeEmail;

  return (
    <main className="min-h-full bg-background p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-500" />
          Profile & Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and notification preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Information Section */}
        <section className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-emerald-500" /> Personal Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Name</label>
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm font-medium">
                {userProfile.name || "User"}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> 
                Contact Email
                {!canEditEmail && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
              </label>
              
              {canEditEmail ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-500 font-medium mb-3">
                    Please provide a valid email address to receive important SEO reports and notifications.
                  </p>
                  <EmailUpdateForm currentEmail={currentEmail} userId={userProfile.id} />
                </div>
              ) : (
                <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm font-medium flex justify-between items-center">
                  <span>{currentEmail}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded font-bold">Verified via Social Login</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Future Personalization Settings */}
        <section className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm opacity-60 relative overflow-hidden group">
          {/* Overlay for "Coming Soon" */}
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-background border border-border shadow-lg rounded-full px-6 py-2 font-bold text-sm text-emerald-500">
              Coming Soon
            </div>
          </div>

          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-indigo-500" /> Personalization
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-background/50 border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold">Notification Schedule</h3>
              </div>
              <p className="text-sm text-muted-foreground">Set your preferred time to receive daily or weekly scan alerts.</p>
            </div>

            <div className="bg-background/50 border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold">SEO Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">Customize the layout and recipients of your automated PDF reports.</p>
            </div>

            <div className="bg-background/50 border border-border/50 rounded-xl p-5 sm:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <LayoutTemplate className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold">Custom Templates</h3>
              </div>
              <p className="text-sm text-muted-foreground">Define your own rules and priority weights for SEO risk scoring.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
