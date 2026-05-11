import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const modeEnum = pgEnum("mode", ["major", "natural_minor"]);
export const chordTypeEnum = pgEnum("chord_type", ["triads", "sevenths"]);

export type ProgressionChord = {
  degree: number;
  romanNumeral: string;
  chordName: string;
  notes: string[];
};

export const progressions = pgTable("progressions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  tonic: text("tonic").notNull(),
  mode: modeEnum("mode").notNull(),
  chordType: chordTypeEnum("chord_type").notNull(),
  chords: jsonb("chords").$type<ProgressionChord[]>().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
