CREATE SCHEMA "my_schema";
--> statement-breakpoint
ALTER TYPE "public"."content_types" SET SCHEMA "my_schema";--> statement-breakpoint
ALTER TABLE "lessons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "modules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teams" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."invitations" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."activity_logs" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."lessons" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."modules" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."team_members" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."teams" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "public"."users" SET SCHEMA "my_schema";
--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" RENAME TO "activity_logs";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" RENAME TO "invitations";--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP CONSTRAINT "activity_logs_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP CONSTRAINT "invitations_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP CONSTRAINT "invitations_invited_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD COLUMN "role" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD COLUMN "invited_by" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD COLUMN "invited_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD COLUMN "action" text NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD COLUMN "timestamp" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "my_schema"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "my_schema"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "my_schema"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP COLUMN "action";--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP COLUMN "timestamp";--> statement-breakpoint
ALTER TABLE "my_schema"."invitations" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP COLUMN "invited_by";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP COLUMN "invited_at";--> statement-breakpoint
ALTER TABLE "my_schema"."activity_logs" DROP COLUMN "status";