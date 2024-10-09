DROP INDEX IF EXISTS "changes_user_id_change_id";--> statement-breakpoint
ALTER TABLE "todo_changes" ADD COLUMN "source_id" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "changes_userid_changeid_sourceid" ON "todo_changes" USING btree ("user_id","change_id","source_id");