import { describe, expect, it } from "vitest";

import { getDiatonicChords } from "../lib/music/chords";
import { progressionInputSchema, validateProgressionInput } from "../lib/progressions/progression-schema";

const validChords = getDiatonicChords({ tonic: "C", mode: "ionian", chordType: "triads" }).map((chord) => ({
  ...chord,
  inversion: 0 as const,
  octaveOffset: 0 as const,
  bassRootOctavesDown: 0 as const,
}));

describe("validateProgressionInput", () => {
  it("accepts chords from the selected key", () => {
    expect(validateProgressionInput({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: validChords.slice(0, 3),
      notes: "",
      tempo: 100,
      audioArt: "piano",
      playbackStyle: "block",
      ambience: 18,
    }).chords).toHaveLength(3);
  });

  it("defaults voicing and audio controls for older saved takes", () => {
    const parsed = progressionInputSchema.parse({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{
        degree: validChords[0].degree,
        romanNumeral: validChords[0].romanNumeral,
        chordName: validChords[0].chordName,
        notes: validChords[0].notes,
        inversion: validChords[0].inversion,
      }],
      notes: "",
    });

    expect(parsed.chords[0].octaveOffset).toBe(0);
    expect(parsed.chords[0].bassRootOctavesDown).toBe(0);
    expect(parsed.tempo).toBe(100);
    expect(parsed.audioArt).toBe("piano");
    expect(parsed.playbackStyle).toBe("block");
    expect(parsed.ambience).toBe(18);
  });

  it("rejects unsupported tonic and mode combinations", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "D#",
      mode: "ionian",
      chordType: "triads",
      chords: validChords.slice(0, 1),
      notes: "",
      tempo: 100,
      audioArt: "piano",
      playbackStyle: "block",
      ambience: 18,
    })).toThrow("D# ionian is not supported");
  });

  it("rejects chords outside the selected key", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{ degree: 1, romanNumeral: "I", chordName: "D", notes: ["D", "F#", "A"], inversion: 0, octaveOffset: 0, bassRootOctavesDown: 0 }],
      notes: "",
      tempo: 100,
      audioArt: "piano",
      playbackStyle: "block",
      ambience: 18,
    })).toThrow("Progression contains chords outside the selected key");
  });

  it("rejects inversions outside the chord range", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{ ...validChords[0], inversion: 3 }],
      notes: "",
      tempo: 100,
      audioArt: "piano",
      playbackStyle: "block",
      ambience: 18,
    })).toThrow("Progression contains an inversion outside the chord range");
  });

  it("rejects octave and bass-root values outside the supported range", () => {
    expect(() => progressionInputSchema.parse({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{ ...validChords[0], octaveOffset: 2 }],
      notes: "",
    })).toThrow();

    expect(() => progressionInputSchema.parse({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{ ...validChords[0], bassRootOctavesDown: 3 }],
      notes: "",
    })).toThrow();
  });

  it("rejects playback styles outside the selected instrument", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: validChords.slice(0, 1),
      notes: "",
      tempo: 100,
      audioArt: "arp",
      playbackStyle: "block",
      ambience: 18,
    })).toThrow("Playback style is not available for the selected instrument");
  });
});
