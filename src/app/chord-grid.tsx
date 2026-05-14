"use client";

import {
  CHORD_TYPES,
  type ChordType,
  type DiatonicChord,
  formatNote,
  getDegreeFunction,
  type MusicMode,
} from "@/lib/music/chords";
import { ChordDisplay } from "./chord-display";
import { CHORD_TYPE_LABELS } from "./chord-type-labels";
import { CollapsibleSection } from "./collapsible-section";

type ChordGridProps = {
  chords: DiatonicChord[];
  mode: MusicMode;
  selectedDegree: number | null;
  chordType: ChordType;
  isCollapsed: boolean;
  onPreviewChord: (chord: DiatonicChord) => void;
  onAddChord: (chord: DiatonicChord) => void;
  onChangeChordType: (chordType: ChordType) => void;
  onToggleCollapse: () => void;
};

export function ChordGrid({
  chords,
  mode,
  selectedDegree,
  chordType,
  isCollapsed,
  onPreviewChord,
  onAddChord,
  onChangeChordType,
  onToggleCollapse,
}: ChordGridProps) {
  const selectedChord = chords.find((chord) => chord.degree === selectedDegree);
  const readout = selectedChord
    ? `${selectedChord.chordName.replace("dim", "°")}`
    : "Tap a chord to preview";

  return (
    <CollapsibleSection
      index="02"
      title="Diatonic Chords"
      readout={readout}
      isCollapsed={isCollapsed}
      hideActionsWhenCollapsed
      onToggle={onToggleCollapse}
      actions={
        <div className="flex flex-wrap gap-[6px]">
          {CHORD_TYPES.map((type) => {
            const isActive = type === chordType;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChangeChordType(type)}
                aria-pressed={isActive}
                className={`flex h-[26px] min-w-[44px] cursor-pointer items-center justify-center border-[0.5px] px-2 text-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] transition duration-[var(--t)] ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                    : "border-[var(--hair)] text-[var(--text-3)] hover:border-[var(--text-2)] hover:text-[var(--text-2)]"
                }`}
                style={{ borderRadius: "var(--radius)" }}
              >
                {CHORD_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4 sm:gap-[14px] min-[880px]:grid-cols-5 xl:grid-cols-7">
        {chords.map((chord) => {
          const isSelected = selectedDegree === chord.degree;
          const isDominant = chord.romanNumeral === "V" || chord.romanNumeral === "V7";
          const degreeFunction = getDegreeFunction(mode, chord.degree);
          const notesDisplay = chord.notes.map(formatNote).join(" ");

          return (
            <div
              key={`${chord.degree}-${chord.romanNumeral}`}
              className={`group relative min-h-[124px] sm:aspect-square sm:min-h-[140px] ${
                isSelected
                  ? "border-[0.5px] border-[var(--accent)] bg-[var(--accent-bg)]"
                  : isDominant
                    ? "border-[0.5px] border-[var(--accent)] bg-[var(--surface)] hover:border-[var(--text)]"
                    : "border-[0.5px] border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--text)]"
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              <button
                type="button"
                onClick={() => onPreviewChord(chord)}
                className="flex h-full w-full cursor-pointer flex-col p-3 text-left"
                aria-label={`Preview ${chord.romanNumeral} ${chord.chordName}, ${degreeFunction}, notes ${notesDisplay}`}
                aria-pressed={isSelected}
              >
                <div>
                  <div
                    className="font-mono font-medium leading-none text-[var(--text)]"
                    style={{ fontSize: "18px", letterSpacing: "-0.01em" }}
                  >
                    {chord.romanNumeral}
                  </div>
                  <div className="mt-[6px] font-mono text-[10px] uppercase leading-none tracking-[0.12em] text-[var(--text-3)]">
                    {degreeFunction}
                  </div>
                </div>

                <div className="mt-auto flex items-baseline justify-between gap-2">
                  <ChordDisplay chordName={chord.chordName} size={36} weight={600} />
                  <div
                    className="font-mono font-medium leading-none text-[var(--text-2)]"
                    style={{ fontSize: "18px", letterSpacing: "-0.01em" }}
                  >
                    {notesDisplay}
                  </div>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Add ${chord.chordName} to progression`}
                onClick={() => onAddChord(chord)}
                className="absolute right-2 top-2 flex h-[30px] w-[30px] items-center justify-center border-[0.5px] border-[var(--hair)] bg-[var(--surface)] font-mono text-[16px] leading-none text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--accent)] hover:text-[var(--accent)] sm:right-3 sm:top-3 sm:h-[22px] sm:w-[22px] sm:text-[14px]"
                style={{ borderRadius: "var(--radius)" }}
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
