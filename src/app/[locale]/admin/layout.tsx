import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AlertCircle } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.email)) {
    // If not logged in or not an admin, redirect to home
    redirect("/");
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 text-slate-200 px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 tracking-wide shadow-sm">
        <AlertCircle className="w-4 h-4 text-emerald-400" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          App Factory Standard Master Admin Mode
        </span>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
