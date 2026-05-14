"use client";

import { getPitchClass } from "@/lib/music/chords";
import {
  BLACK_KEYS,
  getKeyRelativeRootPositionKeyIds,
  getVisibleChordToneKeyIds,
  stripOctave,
  WHITE_KEYS,
} from "@/lib/music/keyboard";

type PianoKeyboardProps = {
  activeNotes: string[];
  alternateNotes?: string[];
  activeNoteMode?: "root-position" | "visible";
  rootFloorKey: string;
  /** First note of the active chord — rendered with the "R" marker. */
  rootNote?: string;
};

export function PianoKeyboard({
  activeNotes,
  alternateNotes = activeNotes,
  activeNoteMode = "root-position",
  rootFloorKey,
  rootNote,
}: PianoKeyboardProps) {
  const activeKeyIds =
    activeNoteMode === "visible"
      ? getVisibleChordToneKeyIds(activeNotes)
      : getKeyRelativeRootPositionKeyIds(activeNotes, rootFloorKey);
  const alternateKeyIds = getVisibleChordToneKeyIds(alternateNotes);
  // Compare by pitch class, not by spelling — E# and F share a piano key, but
  // the chord's stored root note keeps its enharmonic spelling (E#).
  const rootKeyId = rootNote
    ? [...activeKeyIds].find(
        (id) => getPitchClass(stripOctave(id)) === getPitchClass(rootNote),
      )
    : null;

  return (
    <div
      className="relative mx-auto h-[160px] w-full select-none"
      aria-label={activeNotes.length ? `Piano keys for ${activeNotes.join(" ")}` : "Empty keyboard"}
    >
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: `repeat(${WHITE_KEYS.length}, minmax(0, 1fr))` }}
      >
        {WHITE_KEYS.map((note) => {
          const isActive = activeKeyIds.has(note);
          const isAlternate = alternateKeyIds.has(note) && !isActive;
          const isRoot = note === rootKeyId;
          const showLabel = note.startsWith("C");

          return (
            <div
              key={note}
              className={`relative overflow-hidden border-[0.5px] border-r-0 transition-[background-color,border-color] duration-[var(--t-fast)] last:border-r-[0.5px] ${
                isActive || isRoot
                  ? "border-[var(--rule)] bg-[var(--accent)]"
                  : "border-[var(--hair)] bg-[var(--surface)]"
              }`}
              style={{ borderRadius: "0 0 var(--radius) var(--radius)" }}
              title={note}
            >
              {isRoot ? (
                <div className="absolute left-0 right-0 top-[8px] text-center font-mono text-[10px] font-medium text-[var(--text)]">
                  R
                </div>
              ) : null}
              {showLabel ? (
                <div
                  className={`absolute bottom-[8px] left-0 right-0 z-[2] text-center font-mono text-[10px] tracking-[0.08em] ${
                    isActive || isRoot ? "text-[var(--text)]" : "text-[var(--text-3)]"
                  }`}
                >
                  {note}
                </div>
              ) : null}
              {isAlternate ? (
                <span className="absolute bottom-[28px] left-1/2 h-[16px] w-[16px] -translate-x-1/2 rounded-full bg-[var(--accent)]" />
              ) : null}
            </div>
          );
        })}
      </div>

      {BLACK_KEYS.map(({ note, leftWhiteKey }) => {
        const isActive = activeKeyIds.has(note);
        const isAlternate = alternateKeyIds.has(note) && !isActive;
        const isRoot = note === rootKeyId;

        return (
          <div
            key={note}
            className={`absolute top-0 z-[3] h-[62%] -translate-x-1/2 overflow-hidden border-[0.5px] border-[var(--rule)] transition-[background-color] duration-[var(--t-fast)] ${
              isActive || isRoot ? "bg-[var(--accent)]" : "bg-[var(--deep)]"
            }`}
            style={{
              left: `${((leftWhiteKey + 1) / WHITE_KEYS.length) * 100}%`,
              width: `${(100 / WHITE_KEYS.length) * 0.6}%`,
              borderRadius: "0 0 var(--radius) var(--radius)",
            }}
            title={note}
          >
            {isRoot ? (
              <div className="absolute left-0 right-0 top-[5px] z-[4] text-center font-mono text-[9px] font-medium text-[var(--text)]">
                R
              </div>
            ) : null}
            {isAlternate ? (
              <span className="absolute bottom-[8px] left-1/2 h-[16px] w-[16px] -translate-x-1/2 rounded-full bg-[var(--accent)]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
