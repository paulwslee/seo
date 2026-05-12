require('dotenv').config({ path: '.env.local' });
const { db } = require('./src/lib/db');
const { scanResults } = require('./src/lib/db/schema');
const { eq } = require('drizzle-orm');

async function run() {
  console.log('Backfilling scores...');
  const allScans = await db.select().from(scanResults);
  let updated = 0;
  for (const scan of allScans) {
    if (scan.score === null || scan.score === undefined) {
      try {
        const parsed = JSON.parse(scan.canonicalRiskJson);
        if (parsed && typeof parsed.score === 'number') {
          await db.update(scanResults).set({ score: parsed.score }).where(eq(scanResults.id, scan.id));
          updated++;
        }
      } catch(e) {}
    }
  }
  console.log('Updated ' + updated + ' rows!');
}
run().catch(console.error);
