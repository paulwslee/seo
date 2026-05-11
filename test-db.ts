import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './src/lib/db/schema';

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
  console.log("Fetching projects...");
  const allProjects = await db.select().from(schema.projects);
  console.log("Projects:", allProjects);
  
  console.log("Fetching scans...");
  const allScans = await db.select().from(schema.scanResults);
  console.log("Scans:", allScans);
}

run().catch(console.error);
