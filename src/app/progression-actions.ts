"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { type ProgressionChord, progressions } from "@/db/schema";
import type { ChordType, MusicMode } from "@/lib/music/chords";

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

export async function listProgressions() {
  const rows = await db.select().from(progressions).orderBy(desc(progressions.createdAt));

  return rows.map(toSavedProgression);
}

export async function createProgression(input: CreateProgressionInput) {
  const name = input.name.trim();
  const notes = input.notes.trim();

  if (!name) {
    throw new Error("Progression name is required");
  }

  if (input.chords.length === 0) {
    throw new Error("Progression needs at least one chord");
  }

  const [row] = await db
    .insert(progressions)
    .values({
      name,
      tonic: input.tonic,
      mode: input.mode,
      chordType: input.chordType,
      chords: input.chords,
      notes: notes || null,
    })
    .returning();

  revalidatePath("/");

  return toSavedProgression(row);
}

export async function deleteProgression(id: string) {
  await db.delete(progressions).where(eq(progressions.id, id));
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
