ALTER TABLE `api_usage_logs` ADD `target_id` text;--> statement-breakpoint
ALTER TABLE `api_usage_logs` ADD `prompt_tokens` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `api_usage_logs` ADD `completion_tokens` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `scan_results` ADD `score` integer;--> statement-breakpoint
ALTER TABLE `scan_results` ADD `performance_json` text;--> statement-breakpoint
ALTER TABLE `scan_results` ADD `audit_json` text;--> statement-breakpoint
ALTER TABLE `users` ADD `company_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `white_label_logo` text;