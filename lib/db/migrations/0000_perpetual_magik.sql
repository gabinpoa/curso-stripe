CREATE TABLE `orders` (
	`id` varchar(20) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`order_token` varchar(255),
	`status` enum('paid','unpaid','no_payment_required') NOT NULL,
	`refunded` boolean NOT NULL DEFAULT false,
	`completed_lessons` text,
	CONSTRAINT `orders_id_product_id_pk` PRIMARY KEY(`id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`thumbnail` varchar(255),
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`images` text,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`customer_id` varchar(255) NOT NULL,
	`name` varchar(100),
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_customer_id` PRIMARY KEY(`customer_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_users_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`customer_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;