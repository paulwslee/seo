import { db } from "./src/lib/db/index.ts";
import { scanResults } from "./src/lib/db/schema.ts";
import { desc } from "drizzle-orm";

async function main() {
  const scans = await db.select().from(scanResults).orderBy(desc(scanResults.createdAt)).limit(1);
  if (scans.length > 0) {
    const s = scans[0];
    console.log("ID:", s.id);
    console.log("CreatedAt:", s.createdAt);
    console.log("auditJson type:", typeof s.auditJson);
    if (s.auditJson) {
      const parsed = JSON.parse(s.auditJson);
      console.log("auditJson keys:", Object.keys(parsed));
      if (parsed.markdown_report) {
         console.log("markdown_report length:", parsed.markdown_report.length);
      }
    }
    console.log("evidenceHash:", s.evidenceHash);
  } else {
    console.log("No scans found.");
  }
}
main();
