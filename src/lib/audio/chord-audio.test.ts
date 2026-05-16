import { describe, expect, it } from "vitest";

import { getArpFrequencies } from "./chord-audio";

describe("getArpFrequencies", () => {
  it("fills four steps for triad up patterns", () => {
    expect(getArpFrequencies([100, 125, 150], "up")).toEqual([
      100,
      125,
      150,
      200,
    ]);
  });

  it("fills four steps for seventh up patterns", () => {
    expect(getArpFrequencies([100, 125, 150, 175], "up")).toEqual([
      100,
      125,
      150,
      175,
    ]);
  });

  it("supports down and bounce patterns", () => {
    expect(getArpFrequencies([100, 125, 150], "down")).toEqual([
      150,
      125,
      100,
      125,
    ]);
    expect(getArpFrequencies([100, 125, 150], "bounce")).toEqual([
      100,
      150,
      125,
      150,
    ]);
  });
});
