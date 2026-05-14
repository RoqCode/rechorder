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

const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  triads: "Triads",
  sevenths: "Sevenths",
};

type ChordGridProps = {
  chords: DiatonicChord[];
  mode: MusicMode;
  selectedDegree: number | null;
  chordType: ChordType;
  onPreviewChord: (chord: DiatonicChord) => void;
  onAddChord: (chord: DiatonicChord) => void;
  onChangeChordType: (chordType: ChordType) => void;
};

export function ChordGrid({
  chords,
  mode,
  selectedDegree,
  chordType,
  onPreviewChord,
  onAddChord,
  onChangeChordType,
}: ChordGridProps) {
  const selectedChord = chords.find((chord) => chord.degree === selectedDegree);
  const readout = selectedChord
    ? `${selectedChord.chordName.replace("dim", "°")}`
    : "Tap a chord to preview";

  return (
    <section className="border-b border-[var(--rule)] py-9">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-[10px]">
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
            02
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            Diatonic Chords
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            {readout}
          </span>
        </div>
        <div className="flex gap-[6px]">
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
      </header>

      <div className="grid grid-cols-3 gap-[14px] sm:grid-cols-4 md:grid-cols-7">
        {chords.map((chord) => {
          const isSelected = selectedDegree === chord.degree;
          const isDominant = chord.romanNumeral === "V" || chord.romanNumeral === "V7";
          const degreeFunction = getDegreeFunction(mode, chord.degree);
          const notesDisplay = chord.notes.map(formatNote).join(" ");

          return (
            <div
              key={`${chord.degree}-${chord.romanNumeral}`}
              role="button"
              tabIndex={0}
              onClick={() => onPreviewChord(chord)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onPreviewChord(chord);
              }}
              className={`group relative flex aspect-square min-h-[140px] cursor-pointer flex-col p-3 text-left transition duration-[var(--t)] ${
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
                aria-label={`Add ${chord.chordName} to progression`}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddChord(chord);
                }}
                className="absolute right-3 top-3 flex h-[22px] w-[22px] items-center justify-center border-[0.5px] border-[var(--hair)] bg-[var(--surface)] font-mono text-[14px] leading-none text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderRadius: "var(--radius)" }}
              >
                +
              </button>
              {/* TOP-LEFT STACK: roman + function as the abstract/theoretical
                  side of the card — the chord's role in the key. */}
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

              {/* BOTTOM ROW: chord name (left) + tones (right) — the concrete
                  musical content of the card. Baseline-aligned so the 18px
                  tone row sits on the same baseline as the 36px hero. */}
              <div className="mt-auto flex items-baseline justify-between gap-2">
                <ChordDisplay chordName={chord.chordName} size={36} weight={600} />
                <div
                  className="font-mono font-medium leading-none text-[var(--text-2)]"
                  style={{ fontSize: "18px", letterSpacing: "-0.01em" }}
                >
                  {notesDisplay}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
