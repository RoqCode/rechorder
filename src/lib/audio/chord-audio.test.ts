import { describe, expect, it } from "vitest";

import { getArpFrequencies, getChordPlaybackDuration } from "./chord-audio";

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

  it("supports alternate and zig-zag four-step patterns", () => {
    expect(getArpFrequencies([100, 125, 150], "alt")).toEqual([
      100,
      150,
      125,
      100,
    ]);
    expect(getArpFrequencies([100, 125, 150, 175], "alt")).toEqual([
      100,
      150,
      125,
      175,
    ]);
    expect(getArpFrequencies([100, 125, 150], "zig")).toEqual([
      100,
      125,
      100,
      150,
    ]);
  });

  it("supports two-octave eight-step patterns", () => {
    expect(getArpFrequencies([100, 125, 150], "up2")).toEqual([
      100,
      125,
      150,
      200,
      250,
      300,
      250,
      200,
    ]);
    expect(getArpFrequencies([100, 125, 150], "down2")).toEqual([
      300,
      250,
      200,
      150,
      125,
      100,
      125,
      150,
    ]);
    expect(getArpFrequencies([100, 125, 150], "bounce2")).toEqual([
      100,
      150,
      200,
      125,
      300,
      250,
      150,
      200,
    ]);
  });

  it("uses every seventh chord tone across two octaves", () => {
    expect(getArpFrequencies([100, 125, 150, 175], "up2")).toEqual([
      100,
      125,
      150,
      175,
      200,
      250,
      300,
      350,
    ]);
  });
});

describe("getChordPlaybackDuration", () => {
  it("keeps harmonic timing consistent across instruments", () => {
    const baseSettings = {
      isMuted: false,
      volume: 85,
      tempo: 100,
      ambience: 18,
    };

    expect(getChordPlaybackDuration({ ...baseSettings, audioArt: "piano", playbackStyle: "block" })).toBe(1.2);
    expect(getChordPlaybackDuration({ ...baseSettings, audioArt: "arp", playbackStyle: "up" })).toBe(1.2);
    expect(getChordPlaybackDuration({ ...baseSettings, audioArt: "pad", playbackStyle: "sustain" })).toBe(1.2);
    expect(getChordPlaybackDuration({ ...baseSettings, audioArt: "strings", playbackStyle: "sustain" })).toBe(1.2);
  });
});
