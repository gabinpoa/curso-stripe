ALTER TABLE `products` MODIFY COLUMN `thumbnail` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `completed_lessons` text;