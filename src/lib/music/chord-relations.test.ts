import { describe, expect, it } from "vitest";

import { getDiatonicChords } from "./chords";
import { getChordRelations, getTopChordRelations } from "./chord-relations";

describe("getChordRelations", () => {
  it("labels dominant movement to the tonic as a strong pull", () => {
    const chords = getDiatonicChords({
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 5) ?? null;

    const relations = getChordRelations({ source, candidates: chords, mode: "ionian" });

    expect(relations.get(1)?.label).toBe("strong pull");
  });

  it("labels subdominant movement to the tonic as a soft return", () => {
    const chords = getDiatonicChords({
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 4) ?? null;

    const relations = getChordRelations({ source, candidates: chords, mode: "ionian" });

    expect(relations.get(1)?.label).toBe("soft return");
  });

  it("keeps minor-mode v to i as a home move instead of a major dominant", () => {
    const chords = getDiatonicChords({
      tonic: "A",
      mode: "aeolian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 5) ?? null;

    const relations = getChordRelations({ source, candidates: chords, mode: "aeolian" });

    expect(relations.get(1)?.label).toBe("home");
  });

  it("labels predominant motion as keeps moving", () => {
    const chords = getDiatonicChords({
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 2) ?? null;

    const relations = getChordRelations({ source, candidates: chords, mode: "ionian" });

    expect(relations.get(5)?.label).toBe("keeps moving");
  });

  it("labels shared-tone movement as smooth", () => {
    const chords = getDiatonicChords({
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 1) ?? null;

    const relations = getChordRelations({ source, candidates: chords, mode: "ionian" });

    expect(relations.get(6)?.label).toBe("smooth");
    expect(relations.get(6)?.sharedToneCount).toBe(2);
  });

  it("returns the highest-scored next ideas first", () => {
    const chords = getDiatonicChords({
      tonic: "C",
      mode: "ionian",
      chordType: "triads",
    });
    const source = chords.find((chord) => chord.degree === 5) ?? null;
    const relations = getChordRelations({ source, candidates: chords, mode: "ionian" });

    expect(getTopChordRelations(relations, 2).map((relation) => relation.label)).toEqual([
      "strong pull",
      "smooth",
    ]);
  });
});
