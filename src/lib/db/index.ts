import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

const D1_PROXY_URL = process.env.D1_PROXY_URL!;
const D1_PROXY_SECRET = process.env.D1_PROXY_SECRET!;

export const db = drizzle(
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
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`D1 Proxy Error ${response.status}: ${text}`);
      }
      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return { rows: [] };
      }
      
      // Handle various D1 proxy response formats
      if (!data) return { rows: [] };

      // Helper to check if an object is effectively empty
      const isEmpty = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;

      // If the worker returned a D1 result object (with results/success keys)
      if (data.results && Array.isArray(data.results)) {
        return { rows: data.results.filter(row => !isEmpty(row)) };
      }

      // If data is an empty object
      if (isEmpty(data)) {
        return { rows: [] };
      }
      
      // If the worker returned an array directly
      if (Array.isArray(data)) {
        return { rows: data.filter(row => !isEmpty(row)) };
      }

      // If the worker returned a single row as an object
      if (data && !data.rows) {
        return { rows: [data] };
      }
      
      return { rows: data.rows || [] };
    } catch (e: any) {
      console.error('CRITICAL: Error from D1 proxy:', e);
      throw e; // Don't hide errors!
    }
  },
  { schema }
);
