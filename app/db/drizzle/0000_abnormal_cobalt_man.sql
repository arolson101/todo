CREATE TABLE `todo_todos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
