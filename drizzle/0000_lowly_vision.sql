CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`domain` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `scan_results` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`url` text NOT NULL,
	`basic_seo_json` text NOT NULL,
	`canonical_risk_json` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `translations_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_text` text NOT NULL,
	`target_lang` text NOT NULL,
	`translated_text` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `translations_cache_original_text_unique` ON `translations_cache` (`original_text`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);