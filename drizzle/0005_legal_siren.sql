ALTER TABLE "todo_changes" RENAME COLUMN "change" TO "update";--> statement-breakpoint
ALTER TABLE "todo_changes" ADD COLUMN "doc_type" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "todo_changes" ADD COLUMN "doc_id" text DEFAULT '' NOT NULL;