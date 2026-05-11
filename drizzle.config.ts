import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // If we are deploying via Cloudflare D1, we usually use wrangler.
  // For standard drizzle-kit pushes, we can configure an HTTP proxy or a local SQLite file.
} satisfies Config;
