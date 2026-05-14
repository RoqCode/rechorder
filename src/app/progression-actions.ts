"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { type ProgressionChord, progressions } from "@/db/schema";
import { type ChordType, type MusicMode } from "@/lib/music/chords";
import {
  progressionIdSchema,
  progressionInputSchema,
  type ProgressionInput,
  updateProgressionInputSchema,
  type UpdateProgressionInput as ValidatedUpdateProgressionInput,
  validateProgressionInput,
} from "./progression-validation";

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

export type CreateProgressionInput = ProgressionInput;
export type UpdateProgressionInput = ValidatedUpdateProgressionInput;

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
