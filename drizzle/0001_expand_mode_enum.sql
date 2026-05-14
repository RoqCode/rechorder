-- Expand the mode enum from {major, natural_minor} to the seven diatonic
-- modes. Existing rows are mapped: major -> ionian, natural_minor -> aeolian.
ALTER TABLE "progressions" ALTER COLUMN "mode" SET DATA TYPE text;--> statement-breakpoint
UPDATE "progressions" SET "mode" = 'ionian' WHERE "mode" = 'major';--> statement-breakpoint
UPDATE "progressions" SET "mode" = 'aeolian' WHERE "mode" = 'natural_minor';--> statement-breakpoint
DROP TYPE "public"."mode";--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian');--> statement-breakpoint
ALTER TABLE "progressions" ALTER COLUMN "mode" SET DATA TYPE "public"."mode" USING "mode"::"public"."mode";
