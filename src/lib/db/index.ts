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
      const data = JSON.parse(rawText);
      console.log('Parsed data:', data);
      
      // If the worker returns exactly null (e.g. from .first() with no results)
      if (data === null) {
        return { rows: [] }; 
      }
      
      // If the worker returned an error
      if (data?.error) throw new Error(`D1 Error: ${data.error}`);
      
      // If the worker returned the row directly as an object (from .first())
      if (data && !Array.isArray(data) && !data.rows) {
        return { rows: [data] };
      }
      
      // If the worker returned an array directly
      if (Array.isArray(data)) {
        return { rows: data };
      }
      
      // Default case
      return { rows: data.rows || [] };
    } catch (e: any) {
      console.error('CRITICAL: Error from D1 proxy:', e);
      throw e; // Don't hide errors!
    }
  },
  { schema }
);
