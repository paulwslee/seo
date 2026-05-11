import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

// 1. AppFactory Standard: Lazy Translation Cache Table
export const translationsCache = sqliteTable("translations_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  originalText: text("original_text").notNull().unique(), // We index the original text (or a hash) to look it up fast
  targetLang: text("target_lang").notNull(),              // e.g., 'ko', 'ja', 'es'
  translatedText: text("translated_text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  plan: text("plan").default("free"), // 'free' or 'premium'
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: integer("stripe_current_period_end", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] })
]);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] })
]);

export const authenticators = sqliteTable("authenticators", {
  credentialID: text("credentialID").notNull().unique(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("providerAccountId").notNull(),
  credentialPublicKey: text("credentialPublicKey").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credentialDeviceType").notNull(),
  credentialBackedUp: integer("credentialBackedUp", { mode: "boolean" }).notNull(),
  transports: text("transports"),
}, (authenticator) => [
  primaryKey({ columns: [authenticator.userId, authenticator.credentialID] })
]);

// 3. Projects (Domains being scanned)
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users
  domain: text("domain").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 4. Scan Results (SEO Tool Specific)
export const scanResults = sqliteTable("scan_results", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  url: text("url").notNull(),
  
  // Storing JSON stringified results due to SQLite limitations
  basicSeoJson: text("basic_seo_json").notNull(), 
  canonicalRiskJson: text("canonical_risk_json").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 5. Global API Usage Tracking (AppFactorys Standard)
export const apiUsageLogs = sqliteTable("api_usage_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id"), // Optional: null for anonymous scans
  serviceName: text("service_name").notNull(), // e.g., 'SEO Compass'
  modelName: text("model_name"), // e.g., 'gemini-2.5-flash'
  promptType: text("prompt_type").notNull(), // e.g., 'seo_analysis'
  targetId: text("target_id"), // e.g. URL scanned or Text translated
  promptTokens: integer("prompt_tokens").default(0), // Actual input tokens
  completionTokens: integer("completion_tokens").default(0), // Actual output/thought tokens
  durationMs: integer("duration_ms").notNull(), // How long the API call took
  estimatedCost: integer("estimated_cost"), // Optional estimated cost based on tokens
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// 6. Global System Configurations (AppFactorys Standard)
export const systemConfigs = sqliteTable("system_configs", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

