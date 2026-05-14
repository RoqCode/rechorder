import { type ChordInversion, getPitchClass } from "./chords";

export const WHITE_KEYS = [
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
] as const;

export const BLACK_KEYS = [
  { note: "C#2", leftWhiteKey: 0 },
  { note: "D#2", leftWhiteKey: 1 },
  { note: "F#2", leftWhiteKey: 3 },
  { note: "G#2", leftWhiteKey: 4 },
  { note: "A#2", leftWhiteKey: 5 },
  { note: "C#3", leftWhiteKey: 7 },
  { note: "D#3", leftWhiteKey: 8 },
  { note: "F#3", leftWhiteKey: 10 },
  { note: "G#3", leftWhiteKey: 11 },
  { note: "A#3", leftWhiteKey: 12 },
  { note: "C#4", leftWhiteKey: 14 },
  { note: "D#4", leftWhiteKey: 15 },
  { note: "F#4", leftWhiteKey: 17 },
  { note: "G#4", leftWhiteKey: 18 },
  { note: "A#4", leftWhiteKey: 19 },
] as const;

const KEYBOARD_KEYS = [...WHITE_KEYS, ...BLACK_KEYS.map((key) => key.note)].sort(
  (first, second) => getKeyPosition(first) - getKeyPosition(second),
);

const KEYBOARD_CENTER = (getKeyPosition(KEYBOARD_KEYS[0]) + getKeyPosition(KEYBOARD_KEYS[KEYBOARD_KEYS.length - 1])) / 2;

export function getKeyRelativeRootPositionKeyIds(activeNotes: string[], rootFloorKey: string) {
  return getKeyRelativeVoicingKeyIds(activeNotes, rootFloorKey, 0);
}

export function getKeyRelativeVoicingKeyIds(activeNotes: string[], rootFloorKey: string, inversion: ChordInversion = 0) {
  return new Set(getRootPositionCandidate(getVoicedNotes(activeNotes, inversion), rootFloorKey) ?? []);
}

export function getVoicedNotes(activeNotes: string[], inversion: ChordInversion = 0) {
  const safeInversion = Math.min(inversion, Math.max(activeNotes.length - 1, 0));

  return [...activeNotes.slice(safeInversion), ...activeNotes.slice(0, safeInversion)];
}

export function getVisibleChordToneKeyIds(activeNotes: string[]) {
  const activePitchClasses = new Set(activeNotes.map(getPitchClass));

  return new Set(
    KEYBOARD_KEYS.filter((key) => activePitchClasses.has(getPitchClass(stripOctave(key)))),
  );
}

export function getCenteredRootFloorKey(rootFloorNote: string, chordNoteSets: string[][]) {
  const candidates = KEYBOARD_KEYS.filter((key) => getPitchClass(stripOctave(key)) === getPitchClass(rootFloorNote))
    .filter((rootFloorKey) => chordNoteSets.every((notes) => getRootPositionCandidate(notes, rootFloorKey) !== null))
    .sort((first, second) => getRootFloorScore(first) - getRootFloorScore(second));

  return candidates[0] ?? KEYBOARD_KEYS[0];
}

export function stripOctave(note: string) {
  return note.replace(/\d$/, "");
}

function getRootPositionCandidate(activeNotes: string[], rootKey: string) {
  const keys: string[] = [];
  let previousPosition = getKeyPosition(rootKey) - 1;

  for (const note of activeNotes) {
    const key = KEYBOARD_KEYS.find((keyboardKey) => {
      return getPitchClass(stripOctave(keyboardKey)) === getPitchClass(note) && getKeyPosition(keyboardKey) > previousPosition;
    });

    if (!key) return null;

    keys.push(key);
    previousPosition = getKeyPosition(key);
  }

  return keys;
}

function getRootFloorScore(key: string) {
  return Math.abs(getKeyPosition(key) - KEYBOARD_CENTER);
}

function getKeyPosition(note: string) {
  const octave = Number(note.at(-1));
  const noteName = stripOctave(note);

  return octave * 12 + getPitchClass(noteName);
}
