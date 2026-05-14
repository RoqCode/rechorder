import { z } from "zod";

import { type ProgressionChord } from "../db/schema";
import { CHORD_TYPES, getDiatonicChords, getSupportedTonics, MUSIC_MODES } from "../lib/music/chords";

const chordInversionSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

const progressionChordInputSchema = z.object({
  degree: z.number().int().min(1).max(7),
  romanNumeral: z.string().min(1).max(16),
  chordName: z.string().min(1).max(32),
  notes: z.array(z.string().min(1).max(4)).min(3).max(4),
  inversion: chordInversionSchema.optional().default(0),
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

export type ProgressionInput = z.input<typeof progressionInputSchema>;
export type UpdateProgressionInput = z.input<typeof updateProgressionInputSchema>;
type ValidatedProgressionInput = z.output<typeof progressionInputSchema>;

export function validateProgressionInput<T extends ValidatedProgressionInput>(input: T) {
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

  const hasInvalidInversion = input.chords.some((chord) => (chord.inversion ?? 0) >= chord.notes.length);

  if (hasInvalidInversion) {
    throw new Error("Progression contains an inversion outside the chord range");
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
