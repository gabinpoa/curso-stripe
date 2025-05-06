ALTER TABLE `users` MODIFY COLUMN `password_hash` varchar(255);
ALTER TABLE `products` DROP COLUMN `duration`;
ALTER TABLE `products` DROP COLUMN `level`;
ALTER TABLE `products` DROP COLUMN `instructor`;
ALTER TABLE `products` DROP COLUMN `checkout_url`;
ALTER TABLE `products` DROP COLUMN `price`;
ALTER TABLE `users` DROP COLUMN `deleted_at`;