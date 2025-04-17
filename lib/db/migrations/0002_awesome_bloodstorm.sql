ALTER TABLE `team_product_bought` DROP FOREIGN KEY `team_product_bought_team_id_teams_id_fk`;
--> statement-breakpoint
ALTER TABLE `team_product_bought` ADD `customer_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `team_product_bought` ADD `content_types` enum('paid','unpaid','no_payment_required') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `customer_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_customer_id_unique` UNIQUE(`customer_id`);--> statement-breakpoint
ALTER TABLE `team_product_bought` DROP COLUMN `team_id`;--> statement-breakpoint
ALTER TABLE `team_product_bought` DROP COLUMN `status`;