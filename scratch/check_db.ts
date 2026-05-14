import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../src/lib/db/schema';
import { desc } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const D1_PROXY_URL = process.env.D1_PROXY_URL!;
const D1_PROXY_SECRET = process.env.D1_PROXY_SECRET!;

const db = drizzle(
  async (sql, params, method) => {
    try {
      const response = await fetch(D1_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${D1_PROXY_SECRET}`
        },
        body: JSON.stringify({ sql, params, method })
      });
      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return { rows: [] };
      }
      if (!data) return { rows: [] };
      const isEmpty = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
      if (data.results && Array.isArray(data.results)) {
        return { rows: data.results.filter((row: any) => !isEmpty(row)) };
      }
      if (isEmpty(data)) return { rows: [] };
      if (Array.isArray(data)) return { rows: data.filter((row: any) => !isEmpty(row)) };
      if (data && !data.rows) return { rows: [data] };
      return { rows: data.rows || [] };
    } catch (e: any) {
      console.error('CRITICAL: Error from D1 proxy:', e);
      throw e;
    }
  },
  { schema }
);

async function main() {
  console.log("Querying db...");
  const results = await db.select().from(schema.scanResults).orderBy(desc(schema.scanResults.createdAt)).limit(1);
  if (results.length > 0) {
    console.log("Latest scan URL:", results[0].url);
    const auditJson = JSON.parse(results[0].auditJson as string);
    const deck = auditJson.en?.deck;
    console.log("Raw Audit JSON keys:", Object.keys(auditJson));
    console.log("Has en?", !!auditJson.en);
    if (auditJson.en) {
      console.log("en keys:", Object.keys(auditJson.en));
      console.log("Original keys:", Object.keys(auditJson.en.original || {}));
      console.log("Original full:", JSON.stringify(auditJson.en.original, null, 2));
    }
    if (results[0].rawEvidenceJson) {
      const rawEvidence = JSON.parse(results[0].rawEvidenceJson as string);
      console.log("Raw Evidence Keys:", Object.keys(rawEvidence));
      console.log("Raw Evidence audit_data keys:", Object.keys(rawEvidence.audit_data || {}));
    }
  } else {
    console.log("No scans found.");
  }
}

main().catch(console.error);
