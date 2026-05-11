import { describe, expect, it } from "vitest";

import { getCenteredRootFloorKey, getKeyRelativeRootPositionKeyIds } from "./keyboard";

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
