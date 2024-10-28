CREATE TABLE `todo_todo_list_updates` (
	`list_id` text NOT NULL,
	`update` blob NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `todo_todo_list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
CREATE INDEX `list_id_idx` ON `todo_todo_list_updates` (`list_id`);