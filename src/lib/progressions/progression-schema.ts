import { z } from "zod";

import {
  AUDIO_ARTS,
  MAX_TEMPO,
  MIN_TEMPO,
  PLAYBACK_STYLE_OPTIONS,
  PLAYBACK_STYLES,
  type AudioArt,
  type PlaybackStyle,
} from "../audio/chord-audio";
import {
  CHORD_TYPES,
  getDiatonicChords,
  getSupportedTonics,
  MUSIC_MODES,
  type ChordType,
  type MusicMode,
} from "../music/chords";

export type ProgressionChord = {
  degree: number;
  romanNumeral: string;
  chordName: string;
  notes: string[];
  inversion?: 0 | 1 | 2 | 3;
  octaveOffset?: -1 | 0 | 1;
  bassRootOctavesDown?: 0 | 1 | 2;
};

const chordInversionSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
const chordOctaveOffsetSchema = z.union([
  z.literal(-1),
  z.literal(0),
  z.literal(1),
]);
const bassRootOctavesDownSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);
const tempoSchema = z.number().int().min(MIN_TEMPO).max(MAX_TEMPO).default(100);
const ambienceSchema = z.number().int().min(0).max(100).default(18);

export const progressionChordSchema = z.object({
  degree: z.number().int().min(1).max(7),
  romanNumeral: z.string().min(1).max(16),
  chordName: z.string().min(1).max(32),
  notes: z.array(z.string().min(1).max(4)).min(3).max(4),
  inversion: chordInversionSchema.optional().default(0),
  octaveOffset: chordOctaveOffsetSchema.optional().default(0),
  bassRootOctavesDown: bassRootOctavesDownSchema.optional().default(0),
});

export const progressionInputSchema = z.object({
  name: z.string().trim().min(1, "Progression name is required").max(80),
  tonic: z.string().trim().min(1).max(3),
  mode: z.enum(MUSIC_MODES),
  chordType: z.enum(CHORD_TYPES),
  chords: z
    .array(progressionChordSchema)
    .min(1, "Progression needs at least one chord")
    .max(64),
  notes: z.string().trim().max(1000),
  tempo: tempoSchema,
  audioArt: z.enum(AUDIO_ARTS).default("piano"),
  playbackStyle: z.enum(PLAYBACK_STYLES).default("block"),
  ambience: ambienceSchema,
});

export const updateProgressionInputSchema = progressionInputSchema.extend({
  id: z.string().uuid(),
});

export const progressionIdSchema = z.string().uuid();

export const savedProgressionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tonic: z.string(),
  mode: z.enum(MUSIC_MODES),
  chordType: z.enum(CHORD_TYPES),
  chords: z.array(progressionChordSchema),
  notes: z.string().nullable(),
  tempo: tempoSchema,
  audioArt: z.enum(AUDIO_ARTS).default("piano"),
  playbackStyle: z.enum(PLAYBACK_STYLES).default("block"),
  ambience: ambienceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const progressionExportSchema = z.object({
  app: z.literal("rechorder"),
  version: z.literal(1),
  exportedAt: z.string(),
  progressions: z.array(savedProgressionSchema),
});

export type ProgressionInput = z.input<typeof progressionInputSchema>;
export type UpdateProgressionInput = z.input<
  typeof updateProgressionInputSchema
>;
export type SavedProgression = z.infer<typeof savedProgressionSchema> & {
  mode: MusicMode;
  chordType: ChordType;
  audioArt: AudioArt;
  playbackStyle: PlaybackStyle;
};
export type ProgressionExport = z.infer<typeof progressionExportSchema>;
type ValidatedProgressionInput = z.output<typeof progressionInputSchema>;

export function validateProgressionInput<T extends ValidatedProgressionInput>(
  input: T,
) {
  if (!getSupportedTonics(input.mode).includes(input.tonic)) {
    throw new Error(`${input.tonic} ${input.mode} is not supported`);
  }

  const allowedChords = getDiatonicChords(input);
  const hasInvalidChord = input.chords.some((chord) => {
    return !allowedChords.some((allowedChord) =>
      isSameChord(chord, allowedChord),
    );
  });

  if (hasInvalidChord) {
    throw new Error("Progression contains chords outside the selected key");
  }

  const hasInvalidInversion = input.chords.some(
    (chord) => (chord.inversion ?? 0) >= chord.notes.length,
  );

  if (hasInvalidInversion) {
    throw new Error("Progression contains an inversion outside the chord range");
  }

  if (!PLAYBACK_STYLE_OPTIONS[input.audioArt].includes(input.playbackStyle)) {
    throw new Error("Playback style is not available for the selected instrument");
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
