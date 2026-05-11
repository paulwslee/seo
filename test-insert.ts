import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './src/lib/db/schema';
import crypto from 'crypto';

const D1_PROXY_URL = "https://seo-tools-proxy.paul-ws-lee.workers.dev";
const D1_PROXY_SECRET = "a41cb824-098e-4177-bfce-bd5d8af8e06c";

const db = drizzle(
  async (sql, params, method) => {
    const response = await fetch(D1_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${D1_PROXY_SECRET}`
      },
      body: JSON.stringify({ sql, params, method })
    });
    const data = JSON.parse(await response.text());
    if (data === null) return { rows: [] };
    if (data?.error) throw new Error(data.error);
    if (Array.isArray(data)) return { rows: data };
    return { rows: data.rows || [data] };
  },
  { schema }
);

async function run() {
  const projectId = crypto.randomUUID();
  console.log("Inserting project...");
  await db.insert(schema.projects).values({
    id: projectId,
    userId: "my-test-user",
    domain: "https://test.com"
  });
  
  console.log("Inserting scan result...");
  await db.insert(schema.scanResults).values({
    id: crypto.randomUUID(),
    projectId: projectId,
    url: "https://test.com",
    basicSeoJson: "{}",
    canonicalRiskJson: "{}"
  });
  
  console.log("Success! Fetching scans:");
  const scans = await db.select().from(schema.scanResults);
  console.log(scans);
}
run().catch(console.error);
