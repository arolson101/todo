CREATE TABLE IF NOT EXISTS "todo_changes" (
	"change_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"change" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
DROP TABLE "todo_todo";--> statement-breakpoint
ALTER TABLE "todo_authenticator" DROP CONSTRAINT "todo_authenticator_userId_credentialID_pk";--> statement-breakpoint
ALTER TABLE "todo_authenticator" ADD CONSTRAINT "todo_authenticator_credentialID_userId_pk" PRIMARY KEY("credentialID","userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_changes" ADD CONSTRAINT "todo_changes_user_id_todo_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."todo_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "changes_user_id" ON "todo_changes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "changes_user_id_change_id" ON "todo_changes" USING btree ("user_id","change_id");