export const MUSIC_MODES = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
] as const;
export const CHORD_TYPES = ["triads", "sevenths"] as const;

export type MusicMode = (typeof MUSIC_MODES)[number];
export type ChordType = (typeof CHORD_TYPES)[number];

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

export type ModeDescriptor = {
  id: MusicMode;
  abbreviation: string;
  label: string;
  /** Primary emotional impression (rendered as the strong/leading word). */
  mood: string;
  /** Harmonic-character tag rendered after the dot — gives a second angle
   *  without making the readout sound like a genre tagger. */
  flavor: string;
};

export const MODE_DESCRIPTORS: Record<MusicMode, ModeDescriptor> = {
  ionian:     { id: "ionian",     abbreviation: "ION", label: "Ionian",     mood: "Bright",       flavor: "Resolved" },
  dorian:     { id: "dorian",     abbreviation: "DOR", label: "Dorian",     mood: "Warm",         flavor: "Hopeful" },
  phrygian:   { id: "phrygian",   abbreviation: "PHR", label: "Phrygian",   mood: "Dark",         flavor: "Spanish" },
  lydian:     { id: "lydian",     abbreviation: "LYD", label: "Lydian",     mood: "Dreamy",       flavor: "Floating" },
  mixolydian: { id: "mixolydian", abbreviation: "MIX", label: "Mixolydian", mood: "Bluesy",       flavor: "Folk" },
  aeolian:    { id: "aeolian",    abbreviation: "AEO", label: "Aeolian",    mood: "Melancholic",  flavor: "Reflective" },
  locrian:    { id: "locrian",    abbreviation: "LOC", label: "Locrian",    mood: "Unstable",     flavor: "Eerie" },
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
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

/** Mode-relative triad roman numerals (independent of the actual tonic). */
export function getTriadRomans(mode: MusicMode): string[] {
  return TRIAD_ROMAN_NUMERALS[mode];
}

const BASE_DEGREE_FUNCTIONS = [
  "Tonic",
  "Supertonic",
  "Mediant",
  "Subdominant",
  "Dominant",
  "Submediant",
];

/** Modes whose 7th scale degree sits a half-step under the tonic — the
 *  classical "leading tone". All other modes get "Subtonic" (whole step). */
const LEADING_TONE_MODES = new Set<MusicMode>(["ionian", "lydian"]);

/** Returns the classical English name for a diatonic scale-degree function
 *  (Tonic, Subdominant, Dominant, …). The seventh degree resolves to
 *  "Leading Tone" or "Subtonic" depending on the mode. */
export function getDegreeFunction(mode: MusicMode, degree: number): string {
  if (degree >= 1 && degree <= 6) return BASE_DEGREE_FUNCTIONS[degree - 1];
  if (degree === 7) return LEADING_TONE_MODES.has(mode) ? "Leading Tone" : "Subtonic";
  return "";
}

// Triad-level roman numerals per mode. Seventh-chord romans are derived from
// these plus the chord quality (see deriveSeventhRoman).
const TRIAD_ROMAN_NUMERALS: Record<MusicMode, string[]> = {
  ionian: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  dorian: ["i", "ii", "♭III", "IV", "v", "vi°", "♭VII"],
  phrygian: ["i", "♭II", "♭III", "iv", "v°", "♭VI", "♭vii"],
  lydian: ["I", "II", "iii", "♯iv°", "V", "vi", "vii"],
  mixolydian: ["I", "ii", "iii°", "IV", "v", "vi", "♭VII"],
  aeolian: ["i", "ii°", "♭III", "iv", "v", "♭VI", "♭VII"],
  locrian: ["i°", "♭II", "♭iii", "iv", "♭V", "♭VI", "♭vii"],
};

// All conventional enharmonic spellings we might want to offer as tonics. We
// filter dynamically below — any spelling that would force a triple sharp/flat
// or otherwise fail getScale is dropped per mode.
const TONIC_CANDIDATES = [
  "C", "C#", "Db",
  "D", "D#", "Eb",
  "E", "Fb",
  "F", "F#", "Gb",
  "G", "G#", "Ab",
  "A", "A#", "Bb",
  "B", "Cb",
] as const;

const SUPPORTED_TONICS_CACHE: Partial<Record<MusicMode, string[]>> = {};

export function getSupportedTonics(mode: MusicMode): string[] {
  const cached = SUPPORTED_TONICS_CACHE[mode];
  if (cached) return cached;

  const supported = TONIC_CANDIDATES.filter((tonic) => {
    try {
      const scale = getScale(tonic, mode);
      // Reject keys whose canonical spelling needs double accidentals — these
      // are theoretical (e.g. D# ionian, Db aeolian) and would surface
      // notation users never write.
      return scale.every((note) => !note.includes("##") && !note.includes("bb"));
    } catch {
      return false;
    }
  });

  SUPPORTED_TONICS_CACHE[mode] = supported;
  return supported;
}

export function getDiatonicChords(input: GetDiatonicChordsInput): DiatonicChord[] {
  if (!getSupportedTonics(input.mode).includes(input.tonic)) {
    throw new Error(`${input.tonic} ${input.mode} is not supported`);
  }

  const scale = getScale(input.tonic, input.mode);

  return scale.map((root, index) => {
    const notes = getStackedThirds(scale, index, input.chordType === "sevenths" ? 4 : 3);
    const chordName = getChordName(root, notes);
    const triadRoman = TRIAD_ROMAN_NUMERALS[input.mode][index];
    const romanNumeral =
      input.chordType === "sevenths" ? deriveSeventhRoman(triadRoman, chordName, root) : triadRoman;

    return {
      degree: index + 1,
      romanNumeral,
      chordName,
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

export function getPitchClass(note: string) {
  return getNoteSemitone(note);
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
    if (intervals[0] === 4 && intervals[1] === 8) return `${root}aug`;
  }

  if (intervals.length === 3) {
    if (intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 11) return `${root}maj7`;
    if (intervals[0] === 4 && intervals[1] === 7 && intervals[2] === 10) return `${root}7`;
    if (intervals[0] === 3 && intervals[1] === 7 && intervals[2] === 10) return `${root}m7`;
    if (intervals[0] === 3 && intervals[1] === 7 && intervals[2] === 11) return `${root}mMaj7`;
    if (intervals[0] === 3 && intervals[1] === 6 && intervals[2] === 10) return `${root}m7b5`;
    if (intervals[0] === 3 && intervals[1] === 6 && intervals[2] === 9) return `${root}dim7`;
    if (intervals[0] === 4 && intervals[1] === 8 && intervals[2] === 11) return `${root}augMaj7`;
  }

  throw new Error(`Unsupported chord quality for ${notes.join(" ")}`);
}

function deriveSeventhRoman(triadRoman: string, chordName: string, root: string) {
  const suffix = chordName.slice(root.length);

  if (suffix === "maj7") return `${triadRoman}maj7`;
  if (suffix === "7") return `${triadRoman}7`;
  if (suffix === "m7") return `${triadRoman}7`; // lowercase roman already implies minor
  if (suffix === "mMaj7") return `${triadRoman}(maj7)`;
  if (suffix === "m7b5") return `${triadRoman.replace(/°$/, "")}ø7`;
  if (suffix === "dim7") return `${triadRoman}7`;
  if (suffix === "augMaj7") return `${triadRoman}maj7`;

  return triadRoman;
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
  const normalized = normalizeSemitone(offset + 6) - 6;

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

/* ----------------------------------------------------------------
 * Display helpers
 * --------------------------------------------------------------*/

export type ChordDisplayParts = {
  letter: string;
  accidental: string;
  quality: string;
};

/** Parses a chordName like "F#m7" into its visual parts so the UI can size
 *  the letter, accidental and quality suffix independently. */
export function parseChordDisplay(chordName: string): ChordDisplayParts {
  const match = /^([A-G])(b{1,2}|#{1,2})?(.*)$/.exec(chordName);

  if (!match) return { letter: chordName, accidental: "", quality: "" };

  return {
    letter: match[1],
    accidental: formatAccidental(match[2] ?? ""),
    quality: formatQuality(match[3] ?? ""),
  };
}

/** Parses a bare note name like "F#" into letter + accidental, with sharps
 *  and flats already converted to ♯ / ♭ glyphs. */
export function parseNoteDisplay(note: string): { letter: string; accidental: string } {
  const match = /^([A-G])(b{1,2}|#{1,2})?$/.exec(note);

  if (!match) return { letter: note, accidental: "" };

  return {
    letter: match[1],
    accidental: formatAccidental(match[2] ?? ""),
  };
}

/** Glyph-formatted single-note string — "F#" → "F♯", "Bbb" → "B𝄫". */
export function formatNote(note: string): string {
  const parts = parseNoteDisplay(note);
  return parts.letter + parts.accidental;
}

function formatAccidental(raw: string) {
  if (!raw) return "";
  return [...raw].map((character) => (character === "#" ? "♯" : "♭")).join("");
}

function formatQuality(raw: string) {
  if (raw === "dim") return "°";
  if (raw === "aug") return "+";
  if (raw === "m7b5") return "m7♭5";
  if (raw === "dim7") return "°7";
  return raw;
}
