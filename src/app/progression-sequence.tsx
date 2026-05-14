"use client";

import { useState } from "react";

import { type ChordInversion, formatNote, type DiatonicChord } from "@/lib/music/chords";
import { getVoicedNotes } from "@/lib/music/keyboard";
import { ChordDisplay } from "./chord-display";
import { CollapsibleSection } from "./collapsible-section";

type ProgressionSequenceProps = {
  progression: DiatonicChord[];
  activeIndex: number | null;
  playingIndex: number | null;
  keyLabel: string;
  isPlaying: boolean;
  isLooping: boolean;
  isCollapsed: boolean;
  copyMessage: string;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onFocusChord: (index: number) => void;
  onChangeInversion: (index: number, inversion: ChordInversion) => void;
  onTogglePlayback: () => void;
  onToggleLoop: () => void;
  onToggleCollapse: () => void;
  onClear: () => void;
  onCopy: () => void;
};

export function ProgressionSequence({
  progression,
  activeIndex,
  playingIndex,
  keyLabel,
  isPlaying,
  isLooping,
  isCollapsed,
  copyMessage,
  onRemove,
  onReorder,
  onFocusChord,
  onChangeInversion,
  onTogglePlayback,
  onToggleLoop,
  onToggleCollapse,
  onClear,
  onCopy,
}: ProgressionSequenceProps) {
  const [dragSource, setDragSource] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const count = progression.length;
  const readout = `${count} ${count === 1 ? "Chord" : "Chords"} · ${keyLabel}`;
  const effectiveActiveIndex = isPlaying && playingIndex !== null ? playingIndex : activeIndex;
  const activeChord = effectiveActiveIndex !== null ? (progression[effectiveActiveIndex] ?? null) : null;

  return (
    <CollapsibleSection
      index="05"
      title="Progression"
      readout={readout}
      isCollapsed={isCollapsed}
      onToggle={onToggleCollapse}
      actions={
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
          <button
            type="button"
            onClick={onTogglePlayback}
            disabled={progression.length === 0}
            className={`cursor-pointer transition-colors duration-[var(--t)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-3)] disabled:opacity-50 ${
              isPlaying ? "text-[var(--accent)]" : "text-[var(--text-2)]"
            }`}
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
      }
    >
      <div
        className="flex min-h-[132px] flex-wrap items-stretch gap-[10px] bg-[var(--inset)] p-3 sm:gap-[14px] sm:p-5"
        style={{ borderRadius: "var(--radius)" }}
      >
        {progression.length === 0 ? (
          <div className="flex w-full items-center justify-center py-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">
            — Add chords from above —
          </div>
        ) : (
          progression.map((chord, index) => {
            const isPlaying = playingIndex === index;
            const isActive = effectiveActiveIndex === index;
            const isDragging = dragSource === index;
            const isDropTarget = dropTarget === index && dragSource !== index;
            const activeInversion = chord.inversion ?? 0;
            const notesDisplay = getVoicedNotes(chord.notes, activeInversion).map(formatNote).join(" ");

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
                className={`group w-[calc(50%_-_5px)] cursor-grab transition duration-[var(--t)] sm:w-[126px] ${isDragging ? "opacity-40" : ""}`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onFocusChord(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onFocusChord(index);
                    }
                  }}
                  className={`relative flex h-[104px] flex-col border-[0.5px] p-[10px] transition duration-[var(--t)] ${
                    isPlaying
                      ? "border-[var(--accent)] bg-[var(--accent-bg)]"
                      : isActive
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(index);
                    }}
                    className="absolute right-[8px] top-[7px] cursor-pointer font-mono text-[12px] leading-none text-[var(--text-3)] transition-opacity duration-[var(--t)] hover:text-[var(--text)] sm:text-[10px] sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <div className="absolute right-[8px] top-[28px] flex gap-2 transition-opacity duration-[var(--t)] sm:top-[26px] sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label={`Move ${chord.chordName} left`}
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        onReorder(index, index - 1);
                      }}
                      className="cursor-pointer font-mono text-[10px] leading-none text-[var(--text-3)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${chord.chordName} right`}
                      disabled={index === progression.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        onReorder(index, index + 1);
                      }}
                      className="cursor-pointer font-mono text-[10px] leading-none text-[var(--text-3)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-6 pr-6">
                    <div>
                      <div
                        className="font-mono font-medium leading-none text-[var(--text)]"
                        style={{ fontSize: "16px", letterSpacing: "-0.01em" }}
                      >
                        {chord.romanNumeral}
                      </div>
                      <div className="mt-[6px] font-mono text-[9px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
                        {getInversionLabel(activeInversion)}
                      </div>
                    </div>
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

      {activeChord && effectiveActiveIndex !== null ? (
        <div className="mt-4 flex flex-wrap gap-[6px]">
          {getInversionOptions(activeChord.notes.length).map((inversion) => {
            const isActive = inversion === (activeChord.inversion ?? 0);

            return (
              <button
                key={inversion}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChangeInversion(effectiveActiveIndex, inversion)}
                className={`flex h-[26px] min-w-[44px] cursor-pointer items-center justify-center border-[0.5px] px-2 text-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] transition duration-[var(--t)] ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                    : "border-[var(--hair)] text-[var(--text-3)] hover:border-[var(--text-2)] hover:text-[var(--text)]"
                }`}
                style={{ borderRadius: "var(--radius)" }}
              >
                {getInversionLabel(inversion)}
              </button>
            );
          })}
        </div>
      ) : null}
    </CollapsibleSection>
  );
}

function getInversionOptions(noteCount: number): ChordInversion[] {
  return [0, 1, 2, 3].filter((inversion) => inversion < noteCount) as ChordInversion[];
}

function getInversionLabel(inversion: ChordInversion) {
  if (inversion === 0) return "Root";
  if (inversion === 1) return "1st";
  if (inversion === 2) return "2nd";
  return "3rd";
}
