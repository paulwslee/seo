import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const D1_PROXY_URL = process.env.D1_PROXY_URL!;
const D1_PROXY_SECRET = process.env.D1_PROXY_SECRET!;

async function checkColumns() {
  console.log("--- Checking Accounts Table Columns ---");
  const sql = "PRAGMA table_info(accounts)";
  const response = await fetch(D1_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${D1_PROXY_SECRET}`
    },
    body: JSON.stringify({ sql, params: [], method: 'all' })
  });
  const data = await response.json() as any;
  
  console.log("RAW DATA SAMPLE:", JSON.stringify(data[0] || data.rows?.[0]));
  
  const rows = Array.isArray(data) ? data : (data.rows || []);
  
  rows.forEach((col: any) => {
    // Try different possible property names
    const name = col.name || col.ColumnName || col[1];
    const type = col.type || col.ColumnType || col[2];
    console.log(`- ${name} (${type})`);
  });
}

checkColumns();
