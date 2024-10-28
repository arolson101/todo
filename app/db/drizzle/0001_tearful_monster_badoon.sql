ALTER TABLE `todo_todo_list` ADD `modified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `todo_todo_list` DROP COLUMN `base_doc`;--> statement-breakpoint
ALTER TABLE `todo_todo_list` DROP COLUMN `delta`;