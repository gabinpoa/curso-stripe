CREATE TABLE `team_product_bought` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`team_id` bigint unsigned NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`payment_intent_id` varchar(255),
	`status` varchar(20) NOT NULL,
	`refunded` boolean NOT NULL DEFAULT false,
	CONSTRAINT `team_product_bought_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `team_product_bought` ADD CONSTRAINT `team_product_bought_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;