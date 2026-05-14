import { describe, expect, it } from "vitest";

import { getDiatonicChords } from "./chords";
import { applyProgressionTemplate, PROGRESSION_TEMPLATES } from "./progression-templates";

describe("applyProgressionTemplate", () => {
  it("maps template degrees to the current key and mode", () => {
    const chords = getDiatonicChords({ tonic: "C", mode: "ionian", chordType: "triads" });
    const template = PROGRESSION_TEMPLATES.find((candidate) => candidate.id === "axis");

    expect(template).toBeDefined();
    expect(applyProgressionTemplate(template!, chords).map((chord) => chord.romanNumeral)).toEqual([
      "I",
      "V",
      "vi",
      "IV",
    ]);
  });

  it("starts every generated chord in root position", () => {
    const chords = getDiatonicChords({ tonic: "A", mode: "aeolian", chordType: "sevenths" });
    const progression = applyProgressionTemplate(PROGRESSION_TEMPLATES[0], chords);

    expect(progression.every((chord) => chord.inversion === 0)).toBe(true);
  });
});
