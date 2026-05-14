"use client";

import { useState } from "react";

import { formatNote, type DiatonicChord } from "@/lib/music/chords";
import { ChordDisplay } from "./chord-display";

type ProgressionSequenceProps = {
  progression: DiatonicChord[];
  playingIndex: number | null;
  keyLabel: string;
  isPlaying: boolean;
  isLooping: boolean;
  copyMessage: string;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onTogglePlayback: () => void;
  onToggleLoop: () => void;
  onClear: () => void;
  onCopy: () => void;
};

export function ProgressionSequence({
  progression,
  playingIndex,
  keyLabel,
  isPlaying,
  isLooping,
  copyMessage,
  onRemove,
  onReorder,
  onTogglePlayback,
  onToggleLoop,
  onClear,
  onCopy,
}: ProgressionSequenceProps) {
  const [dragSource, setDragSource] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const count = progression.length;
  const readout = `${count} ${count === 1 ? "Chord" : "Chords"} · ${keyLabel}`;

  return (
    <section className="border-b border-[var(--rule)] py-9">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-[10px]">
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
            04
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            Progression
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            {readout}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
          <button
            type="button"
            onClick={onTogglePlayback}
            disabled={progression.length === 0}
            className="cursor-pointer text-[var(--text-2)] transition-colors duration-[var(--t)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-3)] disabled:opacity-50"
          >
            {isPlaying ? "■ Stop" : "▶ Play"}
          </button>
          <button
            type="button"
            onClick={onToggleLoop}
            disabled={progression.length === 0}
            aria-pressed={isLooping}
            className={`cursor-pointer transition-colors duration-[var(--t)] disabled:cursor-not-allowed disabled:opacity-50 ${
              isLooping ? "text-[var(--accent)]" : "text-[var(--text-2)] hover:text-[var(--text)]"
            }`}
          >
            ↻ Loop
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={progression.length === 0}
            className="cursor-pointer text-[var(--text-2)] transition-colors duration-[var(--t)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear progression
          </button>
          <button
            type="button"
            onClick={onCopy}
            disabled={progression.length === 0}
            className="cursor-pointer text-[var(--text-2)] transition-colors duration-[var(--t)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copyMessage || "Copy as text"}
          </button>
        </div>
      </header>

      <div
        className="flex min-h-[132px] flex-wrap items-stretch gap-[14px] bg-[var(--inset)] p-5"
        style={{ borderRadius: "var(--radius)" }}
      >
        {progression.length === 0 ? (
          <div className="flex w-full items-center justify-center py-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">
            — Add chords from above —
          </div>
        ) : (
          progression.map((chord, index) => {
            const isPlaying = playingIndex === index;
            const isDragging = dragSource === index;
            const isDropTarget = dropTarget === index && dragSource !== index;
            const notesDisplay = chord.notes.map(formatNote).join(" ");

            return (
              <div
                key={`${chord.degree}-${index}`}
                draggable
                onDragStart={(event) => {
                  setDragSource(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onDragEnd={() => {
                  setDragSource(null);
                  setDropTarget(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget(index);
                }}
                onDragLeave={() => {
                  setDropTarget((current) => (current === index ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = Number(event.dataTransfer.getData("text/plain"));
                  if (Number.isFinite(from) && from !== index) onReorder(from, index);
                  setDragSource(null);
                  setDropTarget(null);
                }}
                className={`group w-[126px] cursor-grab transition duration-[var(--t)] ${isDragging ? "opacity-40" : ""}`}
              >
                <div
                  className={`relative flex h-[104px] flex-col border-[0.5px] p-[10px] transition duration-[var(--t)] ${
                    isPlaying
                      ? "border-[var(--accent)] bg-[var(--accent-bg)]"
                      : isDropTarget
                        ? "border-[var(--accent)] bg-[var(--surface)]"
                        : "border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--text-2)]"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <button
                    type="button"
                    aria-label={`Remove ${chord.chordName}`}
                    onClick={() => onRemove(index)}
                    className="absolute right-[8px] top-[7px] cursor-pointer font-mono text-[10px] leading-none text-[var(--text-3)] opacity-0 transition-opacity duration-[var(--t)] hover:text-[var(--text)] group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <div
                    className="font-mono font-medium leading-none text-[var(--text)]"
                    style={{ fontSize: "16px", letterSpacing: "-0.01em" }}
                  >
                    {chord.romanNumeral}
                  </div>

                  <div className="mt-auto flex items-baseline justify-between gap-2">
                    <ChordDisplay chordName={chord.chordName} size={26} weight={600} />
                    <div
                      className="font-mono font-medium leading-none text-[var(--text-2)]"
                      style={{ fontSize: "12px", letterSpacing: "-0.01em" }}
                    >
                      {notesDisplay}
                    </div>
                  </div>
                </div>
                <div className="mt-[8px] text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                  Step {String(index + 1).padStart(2, "0")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
