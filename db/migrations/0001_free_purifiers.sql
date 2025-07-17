CREATE TABLE "analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"eulaText" text NOT NULL,
	"summary" text NOT NULL,
	"riskScore" integer NOT NULL,
	"riskReasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"userId" text,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint
);
--> statement-breakpoint
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;