require('dotenv').config({ path: '.env.local' });
const { db } = require('./src/lib/db');
const { sql } = require('drizzle-orm');

async function run() {
  console.log('Adding score column...');
  try {
    await db.run(sql`ALTER TABLE scan_results ADD COLUMN score INTEGER`);
    console.log('Success!');
  } catch(e) {
    console.log('Error:', e.message);
  }
}
run().catch(console.error);
