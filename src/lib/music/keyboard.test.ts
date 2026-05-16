import { describe, expect, it } from "vitest";

import {
  getCenteredRootFloorKey,
  getBassRootKeyId,
  getKeyRelativeRootPositionKeyIds,
  getKeyRelativeVoicingKeyIds,
  getVoicedNotes,
  getVisibleChordToneKeyIds,
} from "./keyboard";

describe("getCenteredRootFloorKey", () => {
  it("chooses C3 for C major triads so all degrees move upward", () => {
    const rootFloorKey = getCenteredRootFloorKey("C", [
      ["C", "E", "G"],
      ["D", "F", "A"],
      ["E", "G", "B"],
      ["F", "A", "C"],
      ["G", "B", "D"],
      ["A", "C", "E"],
      ["B", "D", "F"],
    ]);

    expect(rootFloorKey).toBe("C3");
    expect([...getKeyRelativeRootPositionKeyIds(["C", "E", "G"], rootFloorKey)]).toEqual(["C3", "E3", "G3"]);
    expect([...getKeyRelativeRootPositionKeyIds(["B", "D", "F"], rootFloorKey)]).toEqual(["B3", "D4", "F4"]);
  });

  it("keeps Bb major degrees above the selected key floor", () => {
    const rootFloorKey = getCenteredRootFloorKey("Bb", [
      ["Bb", "D", "F"],
      ["C", "Eb", "G"],
      ["D", "F", "A"],
      ["Eb", "G", "Bb"],
      ["F", "A", "C"],
      ["G", "Bb", "D"],
      ["A", "C", "Eb"],
    ]);

    expect(rootFloorKey).toBe("A#2");
    expect([...getKeyRelativeRootPositionKeyIds(["A", "C", "Eb"], rootFloorKey)]).toEqual(["A3", "C4", "D#4"]);
  });

  it("keeps Ab major sevenths visible inside C2-C5", () => {
    const rootFloorKey = getCenteredRootFloorKey("Ab", [
      ["Ab", "C", "Eb", "G"],
      ["Bb", "Db", "F", "Ab"],
      ["C", "Eb", "G", "Bb"],
      ["Db", "F", "Ab", "C"],
      ["Eb", "G", "Bb", "Db"],
      ["F", "Ab", "C", "Eb"],
      ["G", "Bb", "Db", "F"],
    ]);

    expect(rootFloorKey).toBe("G#2");
    expect([...getKeyRelativeRootPositionKeyIds(["Eb", "G", "Bb", "Db"], rootFloorKey)]).toEqual(["D#3", "G3", "A#3", "C#4"]);
  });
});

describe("getVisibleChordToneKeyIds", () => {
  it("returns every visible octave for chord tones", () => {
    expect([...getVisibleChordToneKeyIds(["C", "E", "G"])]).toEqual([
      "C2",
      "E2",
      "G2",
      "C3",
      "E3",
      "G3",
      "C4",
      "E4",
      "G4",
      "C5",
    ]);
  });

  it("matches enharmonic chord tones to their visible piano keys", () => {
    expect([...getVisibleChordToneKeyIds(["Bb", "D", "F"])]).toContain("A#3");
  });
});

describe("getKeyRelativeVoicingKeyIds", () => {
  it("moves inverted notes above the lower chord tones", () => {
    expect([...getKeyRelativeVoicingKeyIds(["C", "E", "G"], "C3", 1)]).toEqual(["E3", "G3", "C4"]);
    expect([...getKeyRelativeVoicingKeyIds(["C", "E", "G", "B"], "C3", 3)]).toEqual(["B3", "C4", "E4", "G4"]);
  });

  it("transposes the whole voicing by octaves after inversion", () => {
    expect([...getKeyRelativeVoicingKeyIds(["C", "E", "G"], "C3", 1, -1)]).toEqual(["E2", "G2", "C3"]);
    expect([...getKeyRelativeVoicingKeyIds(["C", "E", "G"], "C3", 1, 1)]).toEqual(["E4", "G4", "C5"]);
  });
});

describe("getBassRootKeyId", () => {
  it("returns a low root below the root-position chord", () => {
    expect(getBassRootKeyId(["C", "E", "G"], "C3", 1)).toBe("C2");
    expect(getBassRootKeyId(["C", "E", "G"], "C3", 2)).toBe("C1");
  });

  it("returns null when bass root is disabled", () => {
    expect(getBassRootKeyId(["C", "E", "G"], "C3", 0)).toBeNull();
  });
});

describe("getVoicedNotes", () => {
  it("returns notes in inversion order for display", () => {
    expect(getVoicedNotes(["C", "E", "G"], 0)).toEqual(["C", "E", "G"]);
    expect(getVoicedNotes(["C", "E", "G"], 1)).toEqual(["E", "G", "C"]);
    expect(getVoicedNotes(["C", "E", "G", "B"], 3)).toEqual(["B", "C", "E", "G"]);
  });
});
