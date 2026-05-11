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
      <div className="bg-red-500/10 border-b border-red-500/20 text-red-600 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        App Factory Standard Master Admin Mode
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
