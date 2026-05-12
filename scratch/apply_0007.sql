ALTER TABLE `api_usage_logs` ADD `target_id` text;
ALTER TABLE `api_usage_logs` ADD `prompt_tokens` integer DEFAULT 0;
ALTER TABLE `api_usage_logs` ADD `completion_tokens` integer DEFAULT 0;
ALTER TABLE `scan_results` ADD `score` integer;
ALTER TABLE `scan_results` ADD `performance_json` text;
ALTER TABLE `scan_results` ADD `audit_json` text;
ALTER TABLE `users` ADD `company_name` text;
ALTER TABLE `users` ADD `white_label_logo` text;
