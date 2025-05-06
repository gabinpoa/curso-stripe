ALTER TABLE `orders` DROP PRIMARY KEY;
ALTER TABLE `orders` ADD PRIMARY KEY(`id`,`product_id`);