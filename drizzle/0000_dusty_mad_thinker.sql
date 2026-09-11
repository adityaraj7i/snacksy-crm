CREATE TABLE `cafe_tables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`seats` integer DEFAULT 2 NOT NULL,
	`zone` text DEFAULT 'Main floor' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cafe_tables_name_unique` ON `cafe_tables` (`name`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`table_name` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'kitchen' NOT NULL,
	`waiter` text NOT NULL,
	`payment_method` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
