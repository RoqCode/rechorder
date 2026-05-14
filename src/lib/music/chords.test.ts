import { describe, expect, it } from "vitest";

import {
  getDiatonicChords,
  getPitchClass,
  getScale,
  getSupportedTonics,
  parseChordDisplay,
  parseNoteDisplay,
} from "./chords";

describe("getScale", () => {
  it("spells C ionian without accidentals", () => {
    expect(getScale("C", "ionian")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("spells F ionian with Bb", () => {
    expect(getScale("F", "ionian")).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
  });

  it("spells Gb ionian with Cb instead of B", () => {
    expect(getScale("Gb", "ionian")).toEqual(["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"]);
  });

  it("spells Cb ionian without negative modulo drift", () => {
    expect(getScale("Cb", "ionian")).toEqual(["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"]);
  });

  it("spells A aeolian without accidentals", () => {
    expect(getScale("A", "aeolian")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("spells D dorian without accidentals", () => {
    expect(getScale("D", "dorian")).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
  });

  it("spells E phrygian without accidentals", () => {
    expect(getScale("E", "phrygian")).toEqual(["E", "F", "G", "A", "B", "C", "D"]);
  });

  it("spells F lydian without accidentals", () => {
    expect(getScale("F", "lydian")).toEqual(["F", "G", "A", "B", "C", "D", "E"]);
  });

  it("spells G mixolydian without accidentals", () => {
    expect(getScale("G", "mixolydian")).toEqual(["G", "A", "B", "C", "D", "E", "F"]);
  });

  it("spells B locrian without accidentals", () => {
    expect(getScale("B", "locrian")).toEqual(["B", "C", "D", "E", "F", "G", "A"]);
  });
});

describe("getPitchClass", () => {
  it("treats enharmonic notes as the same pitch class", () => {
    expect(getPitchClass("Cb")).toBe(getPitchClass("B"));
    expect(getPitchClass("F#")).toBe(getPitchClass("Gb"));
  });
});

describe("getSupportedTonics", () => {
  it("returns the same ionian tonics that used to be hardcoded", () => {
    expect(getSupportedTonics("ionian")).toEqual([
      "C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B", "Cb",
    ]);
  });

  it("includes A for aeolian", () => {
    expect(getSupportedTonics("aeolian")).toContain("A");
  });

  it("includes B for locrian", () => {
    expect(getSupportedTonics("locrian")).toContain("B");
  });
});

describe("getDiatonicChords", () => {
  it("returns C ionian triads", () => {
    expect(getDiatonicChords({ tonic: "C", mode: "ionian", chordType: "triads" })).toEqual([
      { degree: 1, romanNumeral: "I", chordName: "C", notes: ["C", "E", "G"] },
      { degree: 2, romanNumeral: "ii", chordName: "Dm", notes: ["D", "F", "A"] },
      { degree: 3, romanNumeral: "iii", chordName: "Em", notes: ["E", "G", "B"] },
      { degree: 4, romanNumeral: "IV", chordName: "F", notes: ["F", "A", "C"] },
      { degree: 5, romanNumeral: "V", chordName: "G", notes: ["G", "B", "D"] },
      { degree: 6, romanNumeral: "vi", chordName: "Am", notes: ["A", "C", "E"] },
      { degree: 7, romanNumeral: "vii°", chordName: "Bdim", notes: ["B", "D", "F"] },
    ]);
  });

  it("returns A aeolian triads", () => {
    expect(getDiatonicChords({ tonic: "A", mode: "aeolian", chordType: "triads" })).toEqual([
      { degree: 1, romanNumeral: "i", chordName: "Am", notes: ["A", "C", "E"] },
      { degree: 2, romanNumeral: "ii°", chordName: "Bdim", notes: ["B", "D", "F"] },
      { degree: 3, romanNumeral: "♭III", chordName: "C", notes: ["C", "E", "G"] },
      { degree: 4, romanNumeral: "iv", chordName: "Dm", notes: ["D", "F", "A"] },
      { degree: 5, romanNumeral: "v", chordName: "Em", notes: ["E", "G", "B"] },
      { degree: 6, romanNumeral: "♭VI", chordName: "F", notes: ["F", "A", "C"] },
      { degree: 7, romanNumeral: "♭VII", chordName: "G", notes: ["G", "B", "D"] },
    ]);
  });

  it("returns D dorian triads with proper romans", () => {
    expect(getDiatonicChords({ tonic: "D", mode: "dorian", chordType: "triads" })).toEqual([
      { degree: 1, romanNumeral: "i", chordName: "Dm", notes: ["D", "F", "A"] },
      { degree: 2, romanNumeral: "ii", chordName: "Em", notes: ["E", "G", "B"] },
      { degree: 3, romanNumeral: "♭III", chordName: "F", notes: ["F", "A", "C"] },
      { degree: 4, romanNumeral: "IV", chordName: "G", notes: ["G", "B", "D"] },
      { degree: 5, romanNumeral: "v", chordName: "Am", notes: ["A", "C", "E"] },
      { degree: 6, romanNumeral: "vi°", chordName: "Bdim", notes: ["B", "D", "F"] },
      { degree: 7, romanNumeral: "♭VII", chordName: "C", notes: ["C", "E", "G"] },
    ]);
  });

  it("returns F lydian with #iv°", () => {
    const chords = getDiatonicChords({ tonic: "F", mode: "lydian", chordType: "triads" });
    expect(chords[3]).toEqual({
      degree: 4,
      romanNumeral: "♯iv°",
      chordName: "Bdim",
      notes: ["B", "D", "F"],
    });
  });

  it("returns B locrian starting on i°", () => {
    const chords = getDiatonicChords({ tonic: "B", mode: "locrian", chordType: "triads" });
    expect(chords[0]).toEqual({
      degree: 1,
      romanNumeral: "i°",
      chordName: "Bdim",
      notes: ["B", "D", "F"],
    });
  });

  it("returns C ionian seventh chords", () => {
    expect(getDiatonicChords({ tonic: "C", mode: "ionian", chordType: "sevenths" })).toEqual([
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
    expect(getDiatonicChords({ tonic: "Gb", mode: "ionian", chordType: "triads" })[3]).toEqual({
      degree: 4,
      romanNumeral: "IV",
      chordName: "Cb",
      notes: ["Cb", "Eb", "Gb"],
    });
  });
});

describe("parseChordDisplay", () => {
  it("splits a plain major chord", () => {
    expect(parseChordDisplay("C")).toEqual({ letter: "C", accidental: "", quality: "" });
  });

  it("splits a sharp minor seventh", () => {
    expect(parseChordDisplay("F#m7")).toEqual({ letter: "F", accidental: "♯", quality: "m7" });
  });

  it("renders diminished as °", () => {
    expect(parseChordDisplay("Bdim")).toEqual({ letter: "B", accidental: "", quality: "°" });
  });

  it("renders m7b5 as m7♭5", () => {
    expect(parseChordDisplay("Bm7b5")).toEqual({ letter: "B", accidental: "", quality: "m7♭5" });
  });

  it("renders Cb correctly", () => {
    expect(parseChordDisplay("Cbmaj7")).toEqual({ letter: "C", accidental: "♭", quality: "maj7" });
  });
});

describe("parseNoteDisplay", () => {
  it("splits a plain natural", () => {
    expect(parseNoteDisplay("C")).toEqual({ letter: "C", accidental: "" });
  });

  it("converts sharps and flats to glyphs", () => {
    expect(parseNoteDisplay("F#")).toEqual({ letter: "F", accidental: "♯" });
    expect(parseNoteDisplay("Bb")).toEqual({ letter: "B", accidental: "♭" });
  });
});
