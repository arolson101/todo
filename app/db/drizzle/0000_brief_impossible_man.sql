CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL
);
