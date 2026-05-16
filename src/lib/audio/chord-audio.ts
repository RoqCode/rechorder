import type { DiatonicChord } from "../music/chords";
import { getBassRootKeyId, getKeyRelativeVoicingKeyIds } from "../music/keyboard";

export const AUDIO_ARTS = ["piano", "pad", "arp", "strings"] as const;
export type AudioArt = (typeof AUDIO_ARTS)[number];
export const PLAYBACK_STYLES = [
  "block",
  "broken",
  "pulse",
  "up",
  "down",
  "bounce",
  "sustain",
] as const;
export type PlaybackStyle = (typeof PLAYBACK_STYLES)[number];

export const PLAYBACK_STYLE_OPTIONS: Record<AudioArt, PlaybackStyle[]> = {
  piano: ["block", "broken", "pulse"],
  arp: ["up", "down", "bounce"],
  pad: ["sustain"],
  strings: ["sustain"],
};

export const DEFAULT_PLAYBACK_STYLE: Record<AudioArt, PlaybackStyle> = {
  piano: "block",
  arp: "up",
  pad: "sustain",
  strings: "sustain",
};

export type AudioSettings = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
  playbackStyle: PlaybackStyle;
  ambience: number;
};

export const MIN_TEMPO = 60;
export const MAX_TEMPO = 180;

type PlayChordPreviewInput = {
  audioContext: AudioContext;
  chord: DiatonicChord;
  rootFloorKey: string;
  settings: AudioSettings;
  startTime?: number;
};

export type AudioVoice = {
  stop: (when?: number) => void;
};

type AudioGraph = {
  input: GainNode;
  dryGain: GainNode;
  wetGain: GainNode;
};

type InstrumentPreset = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  gain: number;
  type: OscillatorType;
  highpassFrequency: number;
  filterFrequency: number;
  filterQ: number;
  detuneCents: number[];
  duration: number;
  stagger: number;
};

const AUDIO_GRAPHS = new WeakMap<AudioContext, AudioGraph>();

const PRESETS: Record<AudioArt, InstrumentPreset> = {
  piano: {
    attack: 0.001,
    decay: 0.22,
    sustain: 0.18,
    release: 0.28,
    gain: 0.28,
    type: "triangle",
    highpassFrequency: 85,
    filterFrequency: 5200,
    filterQ: 0.7,
    detuneCents: [0],
    duration: 1.05,
    stagger: 0.008,
  },
  pad: {
    attack: 0.24,
    decay: 0.45,
    sustain: 0.56,
    release: 0.9,
    gain: 0.16,
    type: "sine",
    highpassFrequency: 95,
    filterFrequency: 1800,
    filterQ: 0.45,
    detuneCents: [-5, 5],
    duration: 1.7,
    stagger: 0.012,
  },
  arp: {
    attack: 0.004,
    decay: 0.12,
    sustain: 0.24,
    release: 0.18,
    gain: 0.34,
    type: "triangle",
    highpassFrequency: 90,
    filterFrequency: 6200,
    filterQ: 0.75,
    detuneCents: [0],
    duration: 0.3,
    stagger: 0,
  },
  strings: {
    attack: 0.08,
    decay: 0.28,
    sustain: 0.72,
    release: 0.55,
    gain: 0.13,
    type: "triangle",
    highpassFrequency: 80,
    filterFrequency: 2600,
    filterQ: 0.55,
    detuneCents: [-7, 7],
    duration: 0.9,
    stagger: 0.004,
  },
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
  const tempo = clampTempo(settings.tempo);

  if (settings.audioArt === "arp") {
    return (60 / tempo / 2) * 4;
  }

  return 60 / tempo;
}

export function getArpFrequencies(frequencies: number[], style: PlaybackStyle) {
  if (frequencies.length === 0) return [];

  if (style === "down") {
    return getArpPatternIndexes(frequencies.length, "down").map(
      (index) => frequencies[index],
    );
  }

  if (style === "bounce") {
    return getArpPatternIndexes(frequencies.length, "bounce").map(
      (index) => frequencies[index],
    );
  }

  return getArpPatternIndexes(frequencies.length, "up").map((index, step) => {
    const frequency = frequencies[index];
    return frequencies.length === 3 && step === 3 ? frequency * 2 : frequency;
  });
}

export function clampTempo(tempo: number) {
  if (!Number.isFinite(tempo)) return 100;
  return Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, Math.round(tempo)));
}

export function playChordPreview({ audioContext, chord, rootFloorKey, settings, startTime }: PlayChordPreviewInput) {
  if (settings.isMuted) {
    return [];
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  const now = startTime ?? audioContext.currentTime;
  const chordKeyIds = [
    ...getKeyRelativeVoicingKeyIds(
      chord.notes,
      rootFloorKey,
      chord.inversion ?? 0,
      chord.octaveOffset ?? 0,
    ),
  ];
  const bassRootKeyId = getBassRootKeyId(
    chord.notes,
    rootFloorKey,
    chord.bassRootOctavesDown ?? 0,
  );
  const frequencies = chordKeyIds.map(getKeyFrequency);
  const bassRootFrequency = bassRootKeyId ? getKeyFrequency(bassRootKeyId) : null;
  const baseGain = settings.volume / 100;
  const preset = PRESETS[settings.audioArt];
  const noteDuration = startTime === undefined ? preset.duration : Math.min(preset.duration, getChordPlaybackDuration(settings) * 0.88);
  const voices: AudioVoice[] = [];
  const graph = getAudioGraph(audioContext);

  setAmbience(graph, settings.ambience);

  if (settings.audioArt === "arp") {
    const stepDuration = 60 / clampTempo(settings.tempo) / 2;
    const arpFrequencies = getArpFrequencies(frequencies, settings.playbackStyle);
    if (bassRootFrequency) {
      voices.push(
        playTone(audioContext, graph.input, bassRootFrequency, now, {
          ...preset,
          duration: stepDuration * Math.max(1.1, frequencies.length),
          gain: baseGain * preset.gain * 0.46,
        }),
      );
    }
    arpFrequencies.forEach((frequency, index) => {
      voices.push(
        playTone(audioContext, graph.input, frequency, now + index * stepDuration, {
          ...preset,
          duration: stepDuration * 1.1,
          gain: baseGain * preset.gain,
        }),
      );
    });
    return voices;
  }

  if (settings.audioArt === "piano" && settings.playbackStyle === "pulse") {
    const pulseDuration = Math.min(noteDuration, getChordPlaybackDuration(settings) * 0.3);
    const secondPulseStart = now + getChordPlaybackDuration(settings) * 0.5;
    if (bassRootFrequency) {
      voices.push(
        playTone(audioContext, graph.input, bassRootFrequency, now, {
          ...preset,
          attack: 0.01,
          decay: 0.16,
          sustain: 0.12,
          release: 0.18,
          duration: getChordPlaybackDuration(settings) * 0.82,
          gain: baseGain * preset.gain * 0.36,
        }),
      );
    }
    [now, secondPulseStart].forEach((pulseStart) => {
      frequencies.forEach((frequency, index) => {
        voices.push(
          playTone(audioContext, graph.input, frequency, pulseStart + index * 0.004, {
            ...preset,
            decay: 0.12,
            sustain: 0.08,
            release: 0.16,
            duration: pulseDuration,
            gain: baseGain * preset.gain * 0.64,
          }),
        );
      });
    });

    return voices;
  }

  voices.push(
    ...playChordBlock({
      audioContext,
      destination: graph.input,
      frequencies,
      bassRootFrequency,
      startTime: now,
      preset,
      duration: noteDuration,
      baseGain,
      stagger:
        settings.audioArt === "piano" && settings.playbackStyle === "broken"
          ? 0.045
          : preset.stagger,
    }),
  );

  return voices;
}

function getArpPatternIndexes(
  noteCount: number,
  style: "up" | "down" | "bounce",
) {
  if (noteCount === 1) return [0, 0, 0, 0];
  if (style === "down") {
    return noteCount >= 4 ? [3, 2, 1, 0] : [2, 1, 0, 1];
  }
  if (style === "bounce") {
    const top = Math.min(noteCount - 1, 2);
    return [0, top, 1, top];
  }

  return noteCount >= 4 ? [0, 1, 2, 3] : [0, 1, 2, 0];
}

function playChordBlock({
  audioContext,
  destination,
  frequencies,
  bassRootFrequency,
  startTime,
  preset,
  duration,
  baseGain,
  stagger,
}: {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencies: number[];
  bassRootFrequency: number | null;
  startTime: number;
  preset: InstrumentPreset;
  duration: number;
  baseGain: number;
  stagger: number;
}) {
  const voices: AudioVoice[] = [];

  if (bassRootFrequency) {
    voices.push(
      playTone(audioContext, destination, bassRootFrequency, startTime, {
        ...preset,
        attack: Math.max(preset.attack, 0.01),
        duration,
        gain: baseGain * preset.gain * 0.58,
      }),
    );
  }

  frequencies.forEach((frequency, index) => {
    voices.push(
      playTone(audioContext, destination, frequency, startTime + index * stagger, {
        ...preset,
        duration,
        gain: baseGain * preset.gain,
      }),
    );
  });

  return voices;
}

function getAudioGraph(audioContext: AudioContext) {
  const existing = AUDIO_GRAPHS.get(audioContext);
  if (existing) return existing;

  const input = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const convolver = audioContext.createConvolver();
  const compressor = audioContext.createDynamicsCompressor();

  input.gain.value = 0.9;
  convolver.buffer = createRoomImpulse(audioContext);
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.18;

  input.connect(dryGain).connect(compressor);
  input.connect(convolver).connect(wetGain).connect(compressor);
  compressor.connect(audioContext.destination);

  const graph = { input, dryGain, wetGain };
  AUDIO_GRAPHS.set(audioContext, graph);
  return graph;
}

function setAmbience(graph: AudioGraph, ambience: number) {
  const wet = Math.min(0.35, Math.max(0, ambience / 100) * 0.35);
  graph.dryGain.gain.value = 1 - wet * 0.45;
  graph.wetGain.gain.value = wet;
}

function playTone(
  audioContext: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  options: InstrumentPreset,
) {
  const highpass = audioContext.createBiquadFilter();
  const lowpass = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  const oscillators = options.detuneCents.map((detuneCents) => {
    const oscillator = audioContext.createOscillator();

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.detune.setValueAtTime(detuneCents, startTime);
    oscillator.connect(gain);
    oscillator.start(startTime);

    return oscillator;
  });

  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(options.highpassFrequency, startTime);
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(options.filterFrequency, startTime);
  lowpass.Q.setValueAtTime(options.filterQ, startTime);
  gain.connect(highpass).connect(lowpass).connect(destination);

  scheduleEnvelope(gain.gain, startTime, options);

  const releaseStart = startTime + options.duration;
  const stopTime = releaseStart + options.release + 0.05;
  oscillators.forEach((oscillator) => oscillator.stop(stopTime));

  return {
    stop(when = audioContext.currentTime) {
      const releaseTime = Math.max(audioContext.currentTime, when);
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setTargetAtTime(0.0001, releaseTime, Math.max(0.015, options.release / 4));
      oscillators.forEach((oscillator) => {
        try {
          oscillator.stop(releaseTime + options.release + 0.05);
        } catch {
          // already stopped
        }
      });
    },
  };
}

function scheduleEnvelope(gain: AudioParam, startTime: number, options: InstrumentPreset) {
  const peak = options.gain / Math.max(1, options.detuneCents.length);
  const sustain = Math.max(0.0001, peak * options.sustain);
  const attackEnd = startTime + options.attack;
  const decayEnd = attackEnd + options.decay;
  const releaseStart = startTime + options.duration;

  gain.setValueAtTime(0.0001, startTime);
  gain.linearRampToValueAtTime(peak, attackEnd);
  gain.exponentialRampToValueAtTime(sustain, decayEnd);
  gain.setValueAtTime(sustain, releaseStart);
  gain.exponentialRampToValueAtTime(0.0001, releaseStart + options.release);
}

function createRoomImpulse(audioContext: AudioContext) {
  const duration = 1.25;
  const sampleCount = Math.floor(audioContext.sampleRate * duration);
  const impulse = audioContext.createBuffer(2, sampleCount, audioContext.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < sampleCount; index += 1) {
      const decay = (1 - index / sampleCount) ** 2.4;
      data[index] = (Math.random() * 2 - 1) * decay * 0.45;
    }
  }

  return impulse;
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
