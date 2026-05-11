"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { type ProgressionChord, progressions } from "@/db/schema";
import { CHORD_TYPES, getDiatonicChords, getSupportedTonics, MUSIC_MODES, type ChordType, type MusicMode } from "@/lib/music/chords";

const progressionChordInputSchema = z.object({
  degree: z.number().int().min(1).max(7),
  romanNumeral: z.string().min(1).max(16),
  chordName: z.string().min(1).max(32),
  notes: z.array(z.string().min(1).max(4)).min(3).max(4),
});

const progressionInputSchema = z.object({
  name: z.string().trim().min(1, "Progression name is required").max(80),
  tonic: z.string().trim().min(1).max(3),
  mode: z.enum(MUSIC_MODES),
  chordType: z.enum(CHORD_TYPES),
  chords: z.array(progressionChordInputSchema).min(1, "Progression needs at least one chord").max(64),
  notes: z.string().trim().max(1000),
});

const updateProgressionInputSchema = progressionInputSchema.extend({
  id: z.string().uuid(),
});

const progressionIdSchema = z.string().uuid();

export type SavedProgression = {
  id: string;
  name: string;
  tonic: string;
  mode: MusicMode;
  chordType: ChordType;
  chords: ProgressionChord[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgressionInput = {
  name: string;
  tonic: string;
  mode: MusicMode;
  chordType: ChordType;
  chords: ProgressionChord[];
  notes: string;
};

export type UpdateProgressionInput = CreateProgressionInput & {
  id: string;
};

export async function listProgressions() {
  const rows = await db.select().from(progressions).orderBy(desc(progressions.createdAt));

  return rows.map(toSavedProgression);
}

export async function createProgression(input: CreateProgressionInput) {
  const parsedInput = validateProgressionInput(progressionInputSchema.parse(input));

  const [row] = await db
    .insert(progressions)
    .values({
      name: parsedInput.name,
      tonic: parsedInput.tonic,
      mode: parsedInput.mode,
      chordType: parsedInput.chordType,
      chords: parsedInput.chords,
      notes: parsedInput.notes || null,
    })
    .returning();

  revalidatePath("/");

  return toSavedProgression(row);
}

export async function updateProgression(input: UpdateProgressionInput) {
  const parsedInput = validateProgressionInput(updateProgressionInputSchema.parse(input));

  const [row] = await db
    .update(progressions)
    .set({
      name: parsedInput.name,
      tonic: parsedInput.tonic,
      mode: parsedInput.mode,
      chordType: parsedInput.chordType,
      chords: parsedInput.chords,
      notes: parsedInput.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(progressions.id, parsedInput.id))
    .returning();

  if (!row) {
    throw new Error("Progression not found");
  }

  revalidatePath("/");

  return toSavedProgression(row);
}

export async function deleteProgression(id: string) {
  const parsedId = progressionIdSchema.parse(id);

  await db.delete(progressions).where(eq(progressions.id, parsedId));
  revalidatePath("/");
}

function toSavedProgression(row: typeof progressions.$inferSelect): SavedProgression {
  return {
    ...row,
    mode: row.mode as MusicMode,
    chordType: row.chordType as ChordType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function validateProgressionInput<T extends CreateProgressionInput>(input: T) {
  if (!getSupportedTonics(input.mode).includes(input.tonic)) {
    throw new Error(`${input.tonic} ${input.mode} is not supported`);
  }

  const allowedChords = getDiatonicChords(input);
  const hasInvalidChord = input.chords.some((chord) => {
    return !allowedChords.some((allowedChord) => isSameChord(chord, allowedChord));
  });

  if (hasInvalidChord) {
    throw new Error("Progression contains chords outside the selected key");
  }

  return input;
}

function isSameChord(first: ProgressionChord, second: ProgressionChord) {
  return (
    first.degree === second.degree &&
    first.romanNumeral === second.romanNumeral &&
    first.chordName === second.chordName &&
    first.notes.length === second.notes.length &&
    first.notes.every((note, index) => note === second.notes[index])
  );
}
