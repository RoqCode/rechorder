"use client";

import { AUDIO_ARTS, type AudioArt } from "@/lib/audio/chord-audio";

const AUDIO_ART_ABBREVIATIONS: Record<AudioArt, string> = {
  piano: "PIA",
  pad: "PAD",
  arp: "ARP",
  strings: "STR",
};

type AudioControlsProps = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
  onMutedChange: (isMuted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onTempoChange: (tempo: number) => void;
  onAudioArtChange: (audioArt: AudioArt) => void;
};

/** Slim hardware-readout style audio bar — lives in the Progression zone's
 *  header row alongside the chord-count readout. */
export function AudioControls({
  isMuted,
  volume,
  tempo,
  audioArt,
  onMutedChange,
  onVolumeChange,
  onTempoChange,
  onAudioArtChange,
}: AudioControlsProps) {
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
        <span>BPM</span>
        <input
          className="h-7 w-[52px] border-[0.5px] border-[var(--hair)] bg-[var(--surface)] px-2 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--text)] outline-none focus:border-[var(--text-2)]"
          style={{ borderRadius: "var(--radius)" }}
          type="number"
          min="60"
          max="180"
          value={tempo}
          onChange={(event) => onTempoChange(Number(event.target.value))}
        />
      </label>

      <div
        className="flex h-7 overflow-hidden border-[0.5px] border-[var(--hair)]"
        style={{ borderRadius: "var(--radius)" }}
      >
        {AUDIO_ARTS.map((value) => {
          const isSelected = value === audioArt;
          return (
            <button
              key={value}
              type="button"
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
    </div>
  );
}
