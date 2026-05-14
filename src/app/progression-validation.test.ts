import { describe, expect, it } from "vitest";

import { getDiatonicChords } from "../lib/music/chords";
import { validateProgressionInput } from "../lib/progressions/progression-schema";

const validChords = getDiatonicChords({ tonic: "C", mode: "ionian", chordType: "triads" }).map((chord) => ({
  ...chord,
  inversion: 0 as const,
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
    }).chords).toHaveLength(3);
  });

  it("rejects unsupported tonic and mode combinations", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "D#",
      mode: "ionian",
      chordType: "triads",
      chords: validChords.slice(0, 1),
      notes: "",
    })).toThrow("D# ionian is not supported");
  });

  it("rejects chords outside the selected key", () => {
    expect(() => validateProgressionInput({
      name: "Test",
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
      chords: [{ degree: 1, romanNumeral: "I", chordName: "D", notes: ["D", "F#", "A"], inversion: 0 }],
      notes: "",
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
    })).toThrow("Progression contains an inversion outside the chord range");
  });
});
