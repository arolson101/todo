CREATE TABLE `todo_todos` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `todo_todo_list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `todo_todo_list` (
	`id` text PRIMARY KEY NOT NULL,
	`base_doc` blob NOT NULL,
	`delta` blob,
	`ydoc` blob NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
