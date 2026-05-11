export type MusicMode = "major" | "natural_minor";
export type ChordType = "triads" | "sevenths";

export type DiatonicChord = {
  degree: number;
  romanNumeral: string;
  chordName: string;
  notes: string[];
};

export type GetDiatonicChordsInput = {
  tonic: string;
  mode: MusicMode;
  chordType: ChordType;
};

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const NATURAL_SEMITONES: Record<(typeof LETTERS)[number], number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SCALE_INTERVALS: Record<MusicMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
};

const SUPPORTED_TONICS: Record<MusicMode, string[]> = {
  major: ["C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
  natural_minor: ["A", "E", "B", "F#", "C#", "G#", "D#", "A#", "D", "G", "C", "F", "Bb", "Eb", "Ab"],
};

export const MUSIC_MODES: MusicMode[] = ["major", "natural_minor"];
export const CHORD_TYPES: ChordType[] = ["triads", "sevenths"];

export function getSupportedTonics(mode: MusicMode) {
  return SUPPORTED_TONICS[mode];
}

const ROMAN_NUMERALS: Record<MusicMode, Record<ChordType, string[]>> = {
  major: {
    triads: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    sevenths: ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"],
  },
  natural_minor: {
    triads: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
    sevenths: ["i7", "iiø7", "IIImaj7", "iv7", "v7", "VImaj7", "VII7"],
  },
};

export function getDiatonicChords(input: GetDiatonicChordsInput): DiatonicChord[] {
  if (!SUPPORTED_TONICS[input.mode].includes(input.tonic)) {
    throw new Error(`${input.tonic} ${input.mode} is not supported`);
  }

  const scale = getScale(input.tonic, input.mode);

  return scale.map((root, index) => {
    const notes = getStackedThirds(scale, index, input.chordType === "sevenths" ? 4 : 3);

    return {
      degree: index + 1,
      romanNumeral: ROMAN_NUMERALS[input.mode][input.chordType][index],
      chordName: getChordName(root, notes),
      notes,
    };
  });
}

export function getScale(tonic: string, mode: MusicMode): string[] {
  const parsedTonic = parseNote(tonic);
  const tonicLetterIndex = LETTERS.indexOf(parsedTonic.letter);
  const tonicSemitone = getNoteSemitone(tonic);

  return SCALE_INTERVALS[mode].map((interval, index) => {
    const letter = LETTERS[(tonicLetterIndex + index) % LETTERS.length];
    const targetSemitone = normalizeSemitone(tonicSemitone + interval);
    const naturalSemitone = NATURAL_SEMITONES[letter];
    const accidentalOffset = getClosestAccidentalOffset(targetSemitone - naturalSemitone);

    return `${letter}${getAccidental(accidentalOffset)}`;
  });
}

function getStackedThirds(scale: string[], rootIndex: number, noteCount: number) {
  return Array.from({ length: noteCount }, (_, index) => scale[(rootIndex + index * 2) % scale.length]);
}

function getChordName(root: string, notes: string[]) {
  const intervals = notes.slice(1).map((note) => getInterval(root, note));

  if (intervals.length === 2) {
    if (intervals[0] === 4 && intervals[1] === 7) return root;
    if (intervals[0] === 3 && intervals[1] === 7) return `${root}m`;
    if (intervals[0] === 3 && intervals[1] === 6) return `${root}dim`;
  }

  if (intervals.length === 3) {
    if (intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 11) return `${root}maj7`;
    if (intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 10) return `${root}7`;
    if (intervals[0] === 3 && intervals[1] === 7 && intervals[2] === 10) return `${root}m7`;
    if (intervals[0] === 3 && intervals[1] === 6 && intervals[2] === 10) return `${root}m7b5`;
  }

  throw new Error(`Unsupported chord quality for ${notes.join(" ")}`);
}

function getInterval(root: string, note: string) {
  return normalizeSemitone(getNoteSemitone(note) - getNoteSemitone(root));
}

function getNoteSemitone(note: string) {
  const parsed = parseNote(note);
  return normalizeSemitone(NATURAL_SEMITONES[parsed.letter] + parsed.accidentalOffset);
}

function parseNote(note: string) {
  const match = /^([A-G])([#b]*)$/.exec(note);

  if (!match) {
    throw new Error(`${note} is not a valid English note name`);
  }

  const letter = match[1] as (typeof LETTERS)[number];
  const accidentalOffset = [...match[2]].reduce((offset, accidental) => {
    return offset + (accidental === "#" ? 1 : -1);
  }, 0);

  return { letter, accidentalOffset };
}

function getClosestAccidentalOffset(offset: number) {
  const normalized = ((offset + 6) % 12) - 6;

  if (normalized < -2 || normalized > 2) {
    throw new Error(`Cannot spell note with accidental offset ${normalized}`);
  }

  return normalized;
}

function getAccidental(offset: number) {
  if (offset === -2) return "bb";
  if (offset === -1) return "b";
  if (offset === 0) return "";
  if (offset === 1) return "#";
  if (offset === 2) return "##";

  throw new Error(`Unsupported accidental offset ${offset}`);
}

function normalizeSemitone(semitone: number) {
  return ((semitone % 12) + 12) % 12;
}
