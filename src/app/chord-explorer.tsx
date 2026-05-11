"use client";

import { useState } from "react";

import {
  CHORD_TYPES,
  type ChordType,
  getDiatonicChords,
  getScale,
  getSupportedTonics,
  MUSIC_MODES,
  type MusicMode,
} from "@/lib/music/chords";
import { getCenteredRootFloorKey } from "@/lib/music/keyboard";
import { PianoKeyboard } from "./piano-keyboard";

const MODE_LABELS: Record<MusicMode, string> = {
  major: "Major",
  natural_minor: "Nat. Minor",
};

const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  triads: "Triads",
  sevenths: "Sevenths",
};

export function ChordExplorer() {
  const [mode, setMode] = useState<MusicMode>("major");
  const [tonic, setTonic] = useState("C");
  const [chordType, setChordType] = useState<ChordType>("triads");
  const [selectedDegree, setSelectedDegree] = useState(1);

  const scale = getScale(tonic, mode);
  const chords = getDiatonicChords({ tonic, mode, chordType });
  const selectedChord = chords.find((chord) => chord.degree === selectedDegree) ?? chords[0];
  const rootFloorKey = getCenteredRootFloorKey(
    tonic,
    chords.map((chord) => chord.notes),
  );

  function selectMode(nextMode: MusicMode) {
    setMode(nextMode);
    setTonic(getSupportedTonics(nextMode)[0]);
    setSelectedDegree(1);
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr]">
      <div className="border-b-2 border-[#171512] p-2 sm:p-3">
        <div className="flex flex-wrap items-end gap-2">
          <ControlGroup label="Mode">
            <SegmentedControl
              options={MUSIC_MODES.map((value) => ({ value, label: MODE_LABELS[value] }))}
              value={mode}
              onChange={selectMode}
            />
          </ControlGroup>

          <ControlGroup label="Key">
            <select
              className="box-border h-9 w-48 appearance-none border-2 border-[#171512] bg-[#fffaf0] px-2 font-mono text-[10px] uppercase leading-none tracking-[0.08em] outline-none focus:bg-white"
              value={tonic}
              onChange={(event) => setTonic(event.target.value)}
            >
              {getSupportedTonics(mode).map((note) => (
                <option value={note} key={note}>
                  {note} {MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </ControlGroup>

          <ControlGroup label="Chord Mode">
            <SegmentedControl
              options={CHORD_TYPES.map((value) => ({ value, label: CHORD_TYPE_LABELS[value] }))}
              value={chordType}
              onChange={setChordType}
            />
          </ControlGroup>

          <div className="min-w-48 flex-1 border-2 border-[#171512] px-2 py-1.5">
            <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">Scale</span>
            <strong className="mt-0.5 block whitespace-nowrap text-sm tracking-[-0.04em]">{scale.join(" ")}</strong>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 content-between gap-4 p-3 sm:p-4">
        <div>
          <div className="mb-4 border-2 border-[#171512] bg-[#fffaf0] p-3">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">Selected Chord</span>
                <strong className="mt-0.5 block text-2xl leading-none tracking-[-0.06em]">{selectedChord.chordName}</strong>
              </div>
              <span className="font-mono text-[10px] tracking-[0.12em] text-[#6f675b]">
                {selectedChord.romanNumeral} / {selectedChord.notes.join(" ")}
              </span>
            </div>
            <PianoKeyboard activeNotes={selectedChord.notes} rootFloorKey={rootFloorKey} />
          </div>

          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span>Available Chords</span>
            <span>
              {tonic} {MODE_LABELS[mode]}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {chords.map((chord) => (
              <button
                className={`w-32 shrink-0 border-2 border-[#171512] px-2.5 py-2 text-left transition hover:-translate-y-0.5 hover:bg-white focus:-translate-y-0.5 focus:bg-white focus:outline-none ${
                  selectedChord.degree === chord.degree ? "bg-white shadow-[3px_3px_0_#171512]" : "bg-[#f2eee6]"
                }`}
                key={`${chord.degree}-${chord.romanNumeral}`}
                type="button"
                onClick={() => setSelectedDegree(chord.degree)}
              >
                <span className="font-mono text-[9px] tracking-[0.12em]">{chord.romanNumeral}</span>
                <span className="mt-1 block text-xl font-semibold leading-none tracking-[-0.06em]">{chord.chordName}</span>
                <span className="mt-1 block font-mono text-[9px] leading-tight tracking-[0.08em] text-[#6f675b]">
                  {chord.notes.join(" ")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-2 border-[#171512] bg-[#171512] p-3 text-[#fffaf0]">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span>Sequence Slots</span>
            <span>Next Slice</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="min-h-14 border-2 border-[#fffaf0] p-2" key={index}>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Slot {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type ControlGroupProps = {
  label: string;
  children: React.ReactNode;
};

function ControlGroup({ label, children }: ControlGroupProps) {
  return (
    <label className="grid gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">{label}</span>
      {children}
    </label>
  );
}

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="box-border inline-flex h-9 border-2 border-[#171512]">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            className={`h-full whitespace-nowrap px-2.5 font-mono text-[9px] uppercase leading-none tracking-normal transition ${
              isSelected ? "bg-[#171512] text-[#fffaf0]" : "bg-[#fffaf0] hover:bg-white"
            }`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
