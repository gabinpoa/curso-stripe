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
CREATE TABLE `lessons` (
	`id` varchar(255) NOT NULL,
	`module_id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`content_types` enum('MDX','VIDEO','DOCUMENT') NOT NULL,
	`content` text NOT NULL,
	`order` int NOT NULL,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
CREATE TABLE `modules` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`order` int NOT NULL,
	`is_extra_content` boolean NOT NULL DEFAULT false,
	`level` varchar(50),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`default_price_id` varchar(255) NOT NULL,
	`thumbnail` varchar(255) NOT NULL,
	`description` text,
	`duration` varchar(50),
	`level` varchar(50),
	`instructor` varchar(100),
	`checkout_url` varchar(255),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
CREATE TABLE `users` (
	`customer_id` varchar(255) NOT NULL,
	`name` varchar(100),
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `users_customer_id` PRIMARY KEY(`customer_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
ALTER TABLE `buy_record` ADD CONSTRAINT `buy_record_customer_id_users_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`customer_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `buy_record` ADD CONSTRAINT `buy_record_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_module_id_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE no action ON UPDATE no action;