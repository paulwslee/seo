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
      <div className="bg-black text-white border-b border-gray-800 px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
        <AlertCircle className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400">
          App Factory Standard Master Admin Mode
        </span>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
