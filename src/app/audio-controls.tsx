"use client";

import {
  AUDIO_ARTS,
  clampTempo,
  MAX_TEMPO,
  MIN_TEMPO,
  PLAYBACK_STYLE_OPTIONS,
  type AudioArt,
  type PlaybackStyle,
} from "@/lib/audio/chord-audio";

const AUDIO_ART_ABBREVIATIONS: Record<AudioArt, string> = {
  piano: "PIA",
  pad: "PAD",
  arp: "ARP",
  strings: "STR",
};

const PLAYBACK_STYLE_LABELS: Record<PlaybackStyle, string> = {
  block: "BLK",
  broken: "STR",
  pulse: "PLS",
  up: "UP",
  down: "DWN",
  bounce: "BNC",
  alt: "ALT",
  zig: "ZIG",
  up2: "UP2",
  down2: "DN2",
  bounce2: "BN2",
  sustain: "SUS",
};

type AudioControlsProps = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
  playbackStyle: PlaybackStyle;
  ambience: number;
  onMutedChange: (isMuted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onTempoChange: (tempo: number) => void;
  onAudioArtChange: (audioArt: AudioArt) => void;
  onPlaybackStyleChange: (playbackStyle: PlaybackStyle) => void;
  onAmbienceChange: (ambience: number) => void;
};

/** Slim hardware-readout style audio bar — lives in the Progression zone's
 *  header row alongside the chord-count readout. */
export function AudioControls({
  isMuted,
  volume,
  tempo,
  audioArt,
  playbackStyle,
  ambience,
  onMutedChange,
  onVolumeChange,
  onTempoChange,
  onAudioArtChange,
  onPlaybackStyleChange,
  onAmbienceChange,
}: AudioControlsProps) {
  const playbackStyleOptions = PLAYBACK_STYLE_OPTIONS[audioArt];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
      <button
        type="button"
        onClick={() => onMutedChange(!isMuted)}
        aria-pressed={!isMuted}
        className={`h-7 cursor-pointer border-[0.5px] px-3 transition duration-[var(--t)] ${
          isMuted
            ? "border-[var(--hair)] text-[var(--text-3)] hover:border-[var(--text-2)] hover:text-[var(--text-2)]"
            : "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
        }`}
        style={{ borderRadius: "var(--radius)" }}
      >
        {isMuted ? "Mute" : "Sound"}
      </button>

      <label className="flex items-center gap-2">
        <span>Vol {String(volume).padStart(3, "0")}</span>
        <input
          className="h-1 w-[88px] accent-[var(--accent)]"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
      </label>

      <label className="flex items-center gap-2">
        <span>FX {String(ambience).padStart(3, "0")}</span>
        <input
          className="h-1 w-[88px] accent-[var(--accent)]"
          type="range"
          min="0"
          max="100"
          value={ambience}
          onChange={(event) => onAmbienceChange(Number(event.target.value))}
        />
      </label>

      <label className="flex items-center gap-2">
        <span>BPM {String(tempo).padStart(3, "0")}</span>
        <input
          className="h-1 w-[112px] accent-[var(--accent)]"
          type="range"
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          value={tempo}
          onChange={(event) => onTempoChange(clampTempo(Number(event.target.value)))}
        />
      </label>

      <div
        role="group"
        aria-label="Audio instrument"
        className="flex h-7 overflow-hidden border-[0.5px] border-[var(--hair)]"
        style={{ borderRadius: "var(--radius)" }}
      >
        {AUDIO_ARTS.map((value) => {
          const isSelected = value === audioArt;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onAudioArtChange(value)}
              className={`cursor-pointer px-3 font-mono text-[10px] uppercase leading-none tracking-[0.10em] transition duration-[var(--t)] ${
                isSelected
                  ? "bg-[var(--text)] text-[var(--surface)]"
                  : "text-[var(--text-3)] hover:bg-[var(--inset)] hover:text-[var(--text)]"
              }`}
            >
              {AUDIO_ART_ABBREVIATIONS[value]}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Playback style"
        className="flex h-7 overflow-hidden border-[0.5px] border-[var(--hair)]"
        style={{ borderRadius: "var(--radius)" }}
      >
        {playbackStyleOptions.map((value) => {
          const isSelected = value === playbackStyle;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              disabled={playbackStyleOptions.length === 1}
              onClick={() => onPlaybackStyleChange(value)}
              className={`cursor-pointer px-3 font-mono text-[10px] uppercase leading-none tracking-[0.10em] transition duration-[var(--t)] disabled:cursor-default ${
                isSelected
                  ? "bg-[var(--text)] text-[var(--surface)]"
                  : "text-[var(--text-3)] hover:bg-[var(--inset)] hover:text-[var(--text)]"
              }`}
            >
              {PLAYBACK_STYLE_LABELS[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
