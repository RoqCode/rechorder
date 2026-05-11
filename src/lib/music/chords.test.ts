import { describe, expect, it } from "vitest";

import { getDiatonicChords, getPitchClass, getScale } from "./chords";

describe("getScale", () => {
  it("spells C major without accidentals", () => {
    expect(getScale("C", "major")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("spells F major with Bb", () => {
    expect(getScale("F", "major")).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
  });

  it("spells Gb major with Cb instead of B", () => {
    expect(getScale("Gb", "major")).toEqual(["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"]);
  });

  it("spells Cb major without negative modulo drift", () => {
    expect(getScale("Cb", "major")).toEqual(["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"]);
  });

  it("spells A natural minor without accidentals", () => {
    expect(getScale("A", "natural_minor")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });
});

describe("getPitchClass", () => {
  it("treats enharmonic notes as the same pitch class", () => {
    expect(getPitchClass("Cb")).toBe(getPitchClass("B"));
    expect(getPitchClass("F#")).toBe(getPitchClass("Gb"));
  });
});

describe("getDiatonicChords", () => {
  it("returns C major triads", () => {
    expect(getDiatonicChords({ tonic: "C", mode: "major", chordType: "triads" })).toEqual([
      { degree: 1, romanNumeral: "I", chordName: "C", notes: ["C", "E", "G"] },
      { degree: 2, romanNumeral: "ii", chordName: "Dm", notes: ["D", "F", "A"] },
      { degree: 3, romanNumeral: "iii", chordName: "Em", notes: ["E", "G", "B"] },
      { degree: 4, romanNumeral: "IV", chordName: "F", notes: ["F", "A", "C"] },
      { degree: 5, romanNumeral: "V", chordName: "G", notes: ["G", "B", "D"] },
      { degree: 6, romanNumeral: "vi", chordName: "Am", notes: ["A", "C", "E"] },
      { degree: 7, romanNumeral: "vii°", chordName: "Bdim", notes: ["B", "D", "F"] },
    ]);
  });

  it("returns A natural minor triads", () => {
    expect(getDiatonicChords({ tonic: "A", mode: "natural_minor", chordType: "triads" })).toEqual([
      { degree: 1, romanNumeral: "i", chordName: "Am", notes: ["A", "C", "E"] },
      { degree: 2, romanNumeral: "ii°", chordName: "Bdim", notes: ["B", "D", "F"] },
      { degree: 3, romanNumeral: "III", chordName: "C", notes: ["C", "E", "G"] },
      { degree: 4, romanNumeral: "iv", chordName: "Dm", notes: ["D", "F", "A"] },
      { degree: 5, romanNumeral: "v", chordName: "Em", notes: ["E", "G", "B"] },
      { degree: 6, romanNumeral: "VI", chordName: "F", notes: ["F", "A", "C"] },
      { degree: 7, romanNumeral: "VII", chordName: "G", notes: ["G", "B", "D"] },
    ]);
  });

  it("returns C major seventh chords", () => {
    expect(getDiatonicChords({ tonic: "C", mode: "major", chordType: "sevenths" })).toEqual([
      { degree: 1, romanNumeral: "Imaj7", chordName: "Cmaj7", notes: ["C", "E", "G", "B"] },
      { degree: 2, romanNumeral: "ii7", chordName: "Dm7", notes: ["D", "F", "A", "C"] },
      { degree: 3, romanNumeral: "iii7", chordName: "Em7", notes: ["E", "G", "B", "D"] },
      { degree: 4, romanNumeral: "IVmaj7", chordName: "Fmaj7", notes: ["F", "A", "C", "E"] },
      { degree: 5, romanNumeral: "V7", chordName: "G7", notes: ["G", "B", "D", "F"] },
      { degree: 6, romanNumeral: "vi7", chordName: "Am7", notes: ["A", "C", "E", "G"] },
      { degree: 7, romanNumeral: "viiø7", chordName: "Bm7b5", notes: ["B", "D", "F", "A"] },
    ]);
  });

  it("keeps flat-key chord spelling", () => {
    expect(getDiatonicChords({ tonic: "Gb", mode: "major", chordType: "triads" })[3]).toEqual({
      degree: 4,
      romanNumeral: "IV",
      chordName: "Cb",
      notes: ["Cb", "Eb", "Gb"],
    });
  });
});
