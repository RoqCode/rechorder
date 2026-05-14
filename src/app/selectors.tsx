"use client";

import { useMemo } from "react";

import {
  formatNote,
  getScale,
  getPitchClass,
  getSupportedTonics,
  MODE_DESCRIPTORS,
  MUSIC_MODES,
  type MusicMode,
} from "@/lib/music/chords";
import { NoteDisplay } from "./chord-display";
import { CollapsibleSection } from "./collapsible-section";

type SelectorsProps = {
  tonic: string;
  mode: MusicMode;
  isCollapsed: boolean;
  onTonicChange: (tonic: string) => void;
  onModeChange: (mode: MusicMode) => void;
  onToggleCollapse: () => void;
};

// Shared display size for both heroes (root glyph + mode name). Both panels
// align baseline-to-baseline so their strips and readouts sit on the same y.
const HERO_SIZE = 64;

// 12 chromatic pitch classes, displayed left-to-right like a keyboard row.
// Sharp pitch classes render as shorter markers (mirrors a piano's black keys).
const PITCH_CLASS_LAYOUT: Array<{ pc: number; isSharp: boolean }> = [
  { pc: 0, isSharp: false },
  { pc: 1, isSharp: true },
  { pc: 2, isSharp: false },
  { pc: 3, isSharp: true },
  { pc: 4, isSharp: false },
  { pc: 5, isSharp: false },
  { pc: 6, isSharp: true },
  { pc: 7, isSharp: false },
  { pc: 8, isSharp: true },
  { pc: 9, isSharp: false },
  { pc: 10, isSharp: true },
  { pc: 11, isSharp: false },
];

const PC_TO_PREFERRED_TONIC: Record<number, { sharp: string; flat: string }> = {
  0: { sharp: "C", flat: "C" },
  1: { sharp: "C#", flat: "Db" },
  2: { sharp: "D", flat: "D" },
  3: { sharp: "D#", flat: "Eb" },
  4: { sharp: "E", flat: "E" },
  5: { sharp: "F", flat: "F" },
  6: { sharp: "F#", flat: "Gb" },
  7: { sharp: "G", flat: "G" },
  8: { sharp: "G#", flat: "Ab" },
  9: { sharp: "A", flat: "A" },
  10: { sharp: "A#", flat: "Bb" },
  11: { sharp: "B", flat: "B" },
};

function pickTonicForPitchClass(
  pc: number,
  supportedTonics: string[],
): string | null {
  const preferred = PC_TO_PREFERRED_TONIC[pc];
  if (supportedTonics.includes(preferred.sharp)) return preferred.sharp;
  if (supportedTonics.includes(preferred.flat)) return preferred.flat;
  return supportedTonics.find((tonic) => getPitchClass(tonic) === pc) ?? null;
}

export function Selectors({
  tonic,
  mode,
  isCollapsed,
  onTonicChange,
  onModeChange,
  onToggleCollapse,
}: SelectorsProps) {
  const supportedTonics = useMemo(() => getSupportedTonics(mode), [mode]);
  const tonicPitchClass = getPitchClass(tonic);
  const scale = useMemo(() => getScale(tonic, mode), [tonic, mode]);

  const descriptor = MODE_DESCRIPTORS[mode];

  return (
    <CollapsibleSection
      index="01"
      title="Key"
      readout={`${formatNote(tonic)} ${descriptor.label} · ${scale.map(formatNote).join(" ")}`}
      isCollapsed={isCollapsed}
      onToggle={onToggleCollapse}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="pr-0 md:border-r-[0.5px] md:border-[var(--hair)] md:pr-8">
          <PanelHead label="Root" index="01 / A" />
          <div className="flex min-h-[60px] items-baseline">
            <NoteDisplay note={tonic} size={HERO_SIZE} />
          </div>
          <div className="mt-7 flex h-[26px] items-center gap-[6px]">
            {PITCH_CLASS_LAYOUT.map(({ pc, isSharp }) => {
              const candidate = pickTonicForPitchClass(pc, supportedTonics);
              const isActive = pc === tonicPitchClass;
              const isDisabled = candidate === null;

              const stateClass = isDisabled
                ? "bg-[var(--hair)] opacity-30"
                : isActive
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--hair)] group-hover:bg-[var(--text-2)]";

              return (
                <button
                  key={pc}
                  type="button"
                  disabled={isDisabled}
                  aria-label={
                    candidate
                      ? `Set root to ${candidate}`
                      : "Unavailable in this mode"
                  }
                  onClick={() => candidate && onTonicChange(candidate)}
                  className={`group relative flex w-[14px] cursor-pointer items-start bg-transparent p-0 ${
                    isSharp ? "h-[14px]" : "h-[26px]"
                  } ${isDisabled ? "cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`block transition-[background-color] duration-[var(--t)] ${
                      isSharp ? "h-[14px] w-[14px]" : "h-[26px] w-[14px]"
                    } ${stateClass}`}
                    style={{ borderRadius: "var(--radius)" }}
                  />
                  {candidate ? (
                    <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-[var(--text-2)] opacity-0 transition-opacity duration-[var(--t)] group-hover:opacity-100">
                      {formatNote(candidate)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <ReadoutLine className="mt-[26px]">
            <strong className="font-medium text-[var(--text-2)]">
              {scale.map(formatNote).join(" ")}
            </strong>
            <Dot />
            <span>Scale</span>
          </ReadoutLine>
        </div>

        <div className="mt-6 border-t border-[var(--hair)] pt-6 md:mt-0 md:border-l-0 md:border-t-0 md:pl-8 md:pt-0">
          <PanelHead label="Mode" index="01 / B" />
          <div className="flex min-h-[60px] items-baseline">
            <span
              className="font-bold leading-[0.95]"
              style={{ fontSize: `${HERO_SIZE}px`, letterSpacing: "-0.05em" }}
            >
              {descriptor.label}
            </span>
          </div>
          <div className="mt-7 flex h-[26px] flex-wrap gap-[6px]">
            {MUSIC_MODES.map((id) => {
              const desc = MODE_DESCRIPTORS[id];
              const isActive = id === mode;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onModeChange(id)}
                  aria-pressed={isActive}
                  className={`flex h-[26px] min-w-[40px] cursor-pointer items-center justify-center border-[0.5px] px-2 text-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] transition duration-[var(--t)] ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "border-[var(--hair)] text-[var(--text-3)] hover:border-[var(--text-2)] hover:text-[var(--text-2)]"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {desc.abbreviation}
                </button>
              );
            })}
          </div>
          <ReadoutLine className="mt-[26px]">
            <strong className="font-medium text-[var(--text-2)]">
              {descriptor.mood}
            </strong>
            <Dot />
            <span>{descriptor.flavor}</span>
          </ReadoutLine>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function PanelHead({ label, index }: { label: string; index: string }) {
  return (
    <div className="mb-[18px] flex items-baseline gap-[10px]">
      <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
        {index}
      </span>
      <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
        {label}
      </span>
    </div>
  );
}

function ReadoutLine({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true">·</span>;
}
