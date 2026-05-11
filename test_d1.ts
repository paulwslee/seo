import { db } from "./src/lib/db/index";
import { sql } from "drizzle-orm";

async function runMigrations() {
  try {
    console.log("Creating tables on D1 Proxy...");

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        emailVerified INTEGER,
        image TEXT,
        plan TEXT DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_price_id TEXT,
        stripe_current_period_end INTEGER,
        created_at INTEGER
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS accounts (
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, providerAccountId)
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sessionToken TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expires INTEGER NOT NULL
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        created_at INTEGER
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS scan_results (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        url TEXT NOT NULL,
        basic_seo_json TEXT NOT NULL,
        canonical_risk_json TEXT NOT NULL,
        created_at INTEGER
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        service_name TEXT NOT NULL,
        model_name TEXT,
        prompt_type TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        estimated_cost INTEGER,
        created_at INTEGER
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS system_configs (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at INTEGER
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS translations_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_text TEXT NOT NULL UNIQUE,
        target_lang TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        created_at INTEGER
      );
    `);

    console.log("Successfully created all tables!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

runMigrations();
