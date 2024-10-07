ALTER TABLE "todo_user" ADD COLUMN "passwordHash" text;--> statement-breakpoint
ALTER TABLE "todo_todo" ADD COLUMN "deleted" boolean DEFAULT false NOT NULL;