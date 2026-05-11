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
      <div style={{ background: 'linear-gradient(to right, #064e3b, #022c22)', color: '#6ee7b7' }} className="px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md">
        <AlertCircle className="w-4 h-4" style={{ color: '#34d399' }} />
        <span style={{ letterSpacing: '0.05em' }}>
          APP FACTORY STANDARD MASTER ADMIN MODE
        </span>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
