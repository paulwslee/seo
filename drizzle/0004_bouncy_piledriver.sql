ALTER TABLE `users` ADD `plan` text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_customer_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_subscription_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_price_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_current_period_end` integer;