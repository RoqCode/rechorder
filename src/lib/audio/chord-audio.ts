import type { DiatonicChord } from "@/lib/music/chords";
import { getKeyRelativeRootPositionKeyIds } from "@/lib/music/keyboard";

export const AUDIO_ARTS = ["piano", "pad", "arp"] as const;
export type AudioArt = (typeof AUDIO_ARTS)[number];

export type AudioSettings = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
};

type PlayChordPreviewInput = {
  audioContext: AudioContext;
  chord: DiatonicChord;
  rootFloorKey: string;
  settings: AudioSettings;
  startTime?: number;
};

const KEY_SEMITONES: Record<string, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

export function getChordPlaybackDuration(settings: AudioSettings) {
  if (settings.audioArt === "arp") {
    return (60 / settings.tempo / 2) * 4;
  }

  return 60 / settings.tempo;
}

export function playChordPreview({ audioContext, chord, rootFloorKey, settings, startTime }: PlayChordPreviewInput) {
  if (settings.isMuted) {
    return;
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  const now = startTime ?? audioContext.currentTime;
  const chordKeyIds = [...getKeyRelativeRootPositionKeyIds(chord.notes, rootFloorKey)];
  const frequencies = chordKeyIds.map(getKeyFrequency);
  const baseGain = settings.volume / 100;

  if (settings.audioArt === "arp") {
    const stepDuration = 60 / settings.tempo / 2;
    frequencies.forEach((frequency, index) => {
      playTone(audioContext, frequency, now + index * stepDuration, {
        attack: 0.01,
        duration: stepDuration * 1.35,
        gain: baseGain * 1.1,
        type: "triangle",
      });
    });
    return;
  }

  frequencies.forEach((frequency, index) => {
    playTone(audioContext, frequency, now + index * 0.01, {
      attack: settings.audioArt === "pad" ? 0.18 : 0.015,
      duration: settings.audioArt === "pad" ? 2.2 : 1.2,
      gain: settings.audioArt === "pad" ? baseGain * 0.28 : baseGain * 0.42,
      type: settings.audioArt === "pad" ? "sine" : "triangle",
    });
  });
}

type PlayToneOptions = {
  attack: number;
  duration: number;
  gain: number;
  type: OscillatorType;
};

function playTone(audioContext: AudioContext, frequency: number, startTime: number, options: PlayToneOptions) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = options.type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(options.gain, startTime + options.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + options.duration);

  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + options.duration + 0.05);
}

function getKeyFrequency(keyId: string) {
  const match = /^([A-G]#?)(\d)$/.exec(keyId);

  if (!match) {
    throw new Error(`${keyId} is not a playable keyboard key`);
  }

  const [, note, octave] = match;
  const midiNote = (Number(octave) + 1) * 12 + KEY_SEMITONES[note];

  return 440 * 2 ** ((midiNote - 69) / 12);
}
