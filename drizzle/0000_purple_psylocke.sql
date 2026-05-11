CREATE TYPE "public"."chord_type" AS ENUM('triads', 'sevenths');--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('major', 'natural_minor');--> statement-breakpoint
CREATE TABLE "progressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tonic" text NOT NULL,
	"mode" "mode" NOT NULL,
	"chord_type" "chord_type" NOT NULL,
	"chords" jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
