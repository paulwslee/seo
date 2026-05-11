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
      const data = await response.json();
      return { rows: data.rows || [] };
    } catch (e: any) {
      console.error('Error from D1 proxy:', e);
      return { rows: [] };
    }
  },
  { schema }
);
