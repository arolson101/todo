CREATE TABLE `todo_todos` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `todo_todo_list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `todo_todo_list_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` text NOT NULL,
	`update` blob NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `todo_todo_list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `todo_todo_list` (
	`id` text PRIMARY KEY NOT NULL,
	`base_doc` blob,
	`ydoc` blob NOT NULL,
	`modified` integer DEFAULT true NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `list_id_idx` ON `todo_todo_list_updates` (`list_id`);