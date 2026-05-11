CREATE TABLE `api_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`service_name` text NOT NULL,
	`prompt_type` text NOT NULL,
	`duration_ms` integer NOT NULL,
	`estimated_cost` integer,
	`created_at` integer
);
