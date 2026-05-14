import { z } from "zod";

import { type ProgressionChord } from "../db/schema";
import { CHORD_TYPES, getDiatonicChords, getSupportedTonics, MUSIC_MODES } from "../lib/music/chords";

const progressionChordInputSchema = z.object({
  degree: z.number().int().min(1).max(7),
  romanNumeral: z.string().min(1).max(16),
  chordName: z.string().min(1).max(32),
  notes: z.array(z.string().min(1).max(4)).min(3).max(4),
});

export const progressionInputSchema = z.object({
  name: z.string().trim().min(1, "Progression name is required").max(80),
  tonic: z.string().trim().min(1).max(3),
  mode: z.enum(MUSIC_MODES),
  chordType: z.enum(CHORD_TYPES),
  chords: z.array(progressionChordInputSchema).min(1, "Progression needs at least one chord").max(64),
  notes: z.string().trim().max(1000),
});

export const updateProgressionInputSchema = progressionInputSchema.extend({
  id: z.string().uuid(),
});

export const progressionIdSchema = z.string().uuid();

export type ProgressionInput = z.infer<typeof progressionInputSchema>;
export type UpdateProgressionInput = z.infer<typeof updateProgressionInputSchema>;

export function validateProgressionInput<T extends ProgressionInput>(input: T) {
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
