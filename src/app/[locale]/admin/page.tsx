import { db } from "@/lib/db";
import { users, apiUsageLogs, systemConfigs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminTabs } from "./admin-tabs";

export default async function AdminPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const allLogs = await db.select().from(apiUsageLogs).orderBy(desc(apiUsageLogs.createdAt)).limit(1000);
  const configs = await db.select().from(systemConfigs);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">App Factory Master Admin</h1>
        <p className="text-muted-foreground mt-2">Manage global settings, users, and API billing across all products.</p>
      </div>
      
      <AdminTabs 
        initialUsers={allUsers} 
        initialLogs={allLogs} 
        initialConfigs={configs} 
      />
    </div>
  );
}
