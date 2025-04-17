CREATE TABLE `buy_record` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`payment_intent_id` varchar(255),
	`status` enum('paid','unpaid','no_payment_required') NOT NULL,
	`refunded` boolean NOT NULL DEFAULT false,
	CONSTRAINT `buy_record_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `team_product_bought`;