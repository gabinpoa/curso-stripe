CREATE TABLE `orders` (
	`id` varchar(20) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`order_token` varchar(255),
	`status` enum('paid','unpaid','no_payment_required') NOT NULL,
	`refunded` boolean NOT NULL DEFAULT false,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);

DROP TABLE `buy_record`;

ALTER TABLE `products` ADD `status` enum('active','inactive') DEFAULT 'active' NOT NULL;

ALTER TABLE `products` ADD `price` int NOT NULL;

ALTER TABLE `products` ADD `images` text;

ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_users_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`customer_id`) ON DELETE no action ON UPDATE no action;

ALTER TABLE `orders` ADD CONSTRAINT `orders_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;

ALTER TABLE `products` DROP COLUMN `default_price_id`;