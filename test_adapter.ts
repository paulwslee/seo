import { db } from "./src/lib/db";
import { users, projects } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Testing insert into projects...");
  try {
    const res = await db.insert(projects).values({
      id: crypto.randomUUID(),
      userId: "test-user-123",
      domain: "example.com"
    });
    console.log("Insert result:", res);
  } catch (err) {
    console.error("Query error:", err);
  }
}

run();
