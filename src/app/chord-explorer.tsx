"use client";

import { useEffect, useState, useTransition } from "react";

import {
  CHORD_TYPES,
  type ChordType,
  type DiatonicChord,
  getDiatonicChords,
  getScale,
  getSupportedTonics,
  MUSIC_MODES,
  type MusicMode,
} from "@/lib/music/chords";
import { getCenteredRootFloorKey } from "@/lib/music/keyboard";
import { PianoKeyboard } from "./piano-keyboard";
import { createProgression, deleteProgression, listProgressions, type SavedProgression, updateProgression } from "./progression-actions";

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
  const [progression, setProgression] = useState<DiatonicChord[]>([]);
  const [library, setLibrary] = useState<SavedProgression[]>([]);
  const [progressionName, setProgressionName] = useState("");
  const [progressionNotes, setProgressionNotes] = useState("");
  const [loadedProgressionId, setLoadedProgressionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const scale = getScale(tonic, mode);
  const chords = getDiatonicChords({ tonic, mode, chordType });
  const selectedChord = chords.find((chord) => chord.degree === selectedDegree) ?? chords[0];
  const rootFloorKey = getCenteredRootFloorKey(
    tonic,
    chords.map((chord) => chord.notes),
  );

  useEffect(() => {
    startTransition(async () => {
      try {
        setLibrary(await listProgressions());
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load library");
      }
    });
  }, []);

  function selectMode(nextMode: MusicMode) {
    setMode(nextMode);
    setTonic(getSupportedTonics(nextMode)[0]);
    setSelectedDegree(1);
  }

  function addChord(chord: DiatonicChord) {
    setProgression((currentProgression) => [...currentProgression, chord]);
  }

  function removeChord(indexToRemove: number) {
    setProgression((currentProgression) => currentProgression.filter((_, index) => index !== indexToRemove));
  }

  function moveChord(indexToMove: number, direction: -1 | 1) {
    setProgression((currentProgression) => {
      const targetIndex = indexToMove + direction;

      if (targetIndex < 0 || targetIndex >= currentProgression.length) {
        return currentProgression;
      }

      const nextProgression = [...currentProgression];
      [nextProgression[indexToMove], nextProgression[targetIndex]] = [nextProgression[targetIndex], nextProgression[indexToMove]];

      return nextProgression;
    });
  }

  function saveProgression() {
    startTransition(async () => {
      try {
        const input = {
          name: progressionName,
          tonic,
          mode,
          chordType,
          chords: progression,
          notes: progressionNotes,
        };

        const savedProgression = loadedProgressionId
          ? await updateProgression({ ...input, id: loadedProgressionId })
          : await createProgression(input);

        setLoadedProgressionId(savedProgression.id);
        setLibrary(await listProgressions());
        setStatusMessage(loadedProgressionId ? "Updated" : "Saved");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not save progression");
      }
    });
  }

  function startNewProgression() {
    setProgression([]);
    setProgressionName("");
    setProgressionNotes("");
    setLoadedProgressionId(null);
    setStatusMessage("New take");
  }

  function loadProgression(savedProgression: SavedProgression) {
    setTonic(savedProgression.tonic);
    setMode(savedProgression.mode);
    setChordType(savedProgression.chordType);
    setProgression(savedProgression.chords);
    setProgressionName(savedProgression.name);
    setProgressionNotes(savedProgression.notes ?? "");
    setLoadedProgressionId(savedProgression.id);
    setSelectedDegree(savedProgression.chords[0]?.degree ?? 1);
    setStatusMessage("Loaded");
  }

  function removeSavedProgression(id: string) {
    startTransition(async () => {
      try {
        await deleteProgression(id);
        setLibrary(await listProgressions());
        if (loadedProgressionId === id) {
          setLoadedProgressionId(null);
        }
        setStatusMessage("Deleted");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not delete progression");
      }
    });
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
              <div
                className={`relative w-32 shrink-0 border-2 border-[#171512] transition hover:-translate-y-0.5 hover:bg-white ${
                  selectedChord.degree === chord.degree ? "bg-white shadow-[3px_3px_0_#171512]" : "bg-[#f2eee6]"
                }`}
                key={`${chord.degree}-${chord.romanNumeral}`}
              >
                <button
                  className="block w-full px-2.5 py-2 pr-9 text-left focus:bg-white focus:outline-none"
                  type="button"
                  onClick={() => setSelectedDegree(chord.degree)}
                >
                  <span className="font-mono text-[9px] tracking-[0.12em]">{chord.romanNumeral}</span>
                  <span className="mt-1 block text-xl font-semibold leading-none tracking-[-0.06em]">{chord.chordName}</span>
                  <span className="mt-1 block font-mono text-[9px] leading-tight tracking-[0.08em] text-[#6f675b]">
                    {chord.notes.join(" ")}
                  </span>
                </button>
                <button
                  className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center border-2 border-[#171512] bg-[#fffaf0] font-mono text-[12px] leading-none transition hover:bg-[#f05a28] focus:bg-[#f05a28] focus:outline-none"
                  type="button"
                  aria-label={`Add ${chord.chordName} to sequence`}
                  onClick={() => addChord(chord)}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-[#171512] bg-[#171512] p-3 text-[#fffaf0]">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span>{loadedProgressionId ? "Loaded Take" : "Sequence Slots"}</span>
            <div className="flex gap-3">
              <button
                className="text-[#fffaf0] underline decoration-[#f05a28] underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={progression.length === 0}
                onClick={() => setProgression([])}
              >
                Clear
              </button>
              <button className="text-[#fffaf0] underline decoration-[#f05a28] underline-offset-4" type="button" onClick={startNewProgression}>
                New
              </button>
            </div>
          </div>
          <div className="flex min-h-14 flex-wrap gap-2">
            {progression.length === 0 ? (
              <div className="flex min-h-14 flex-1 items-center justify-center border-2 border-dashed border-[#fffaf0] px-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#bfb7aa]">
                Add chords with +
              </div>
            ) : (
              progression.map((chord, index) => (
                <div className="relative min-h-16 min-w-32 border-2 border-[#fffaf0] p-2 pr-7" key={`${chord.degree}-${index}`}>
                  <button
                    className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center border border-[#fffaf0] font-mono text-[10px] leading-none hover:bg-[#fffaf0] hover:text-[#171512]"
                    type="button"
                    aria-label={`Remove ${chord.chordName} from sequence`}
                    onClick={() => removeChord(index)}
                  >
                    x
                  </button>
                  <span className="block font-mono text-[10px] tracking-[0.2em] text-[#bfb7aa]">
                    {index + 1} | {chord.romanNumeral}
                  </span>
                  <strong className="mt-1 block text-lg leading-none tracking-[-0.06em]">{chord.chordName}</strong>
                  <span className="mt-1 block font-mono text-[9px] leading-tight tracking-[0.08em] text-[#bfb7aa]">
                    {chord.notes.join(" ")}
                  </span>
                  <div className="mt-2 flex gap-1">
                    <button
                      className="flex h-5 w-6 items-center justify-center border border-[#fffaf0] font-mono text-[10px] leading-none hover:bg-[#fffaf0] hover:text-[#171512] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#fffaf0]"
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move ${chord.chordName} left`}
                      onClick={() => moveChord(index, -1)}
                    >
                      &lt;
                    </button>
                    <button
                      className="flex h-5 w-6 items-center justify-center border border-[#fffaf0] font-mono text-[10px] leading-none hover:bg-[#fffaf0] hover:text-[#171512] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#fffaf0]"
                      type="button"
                      disabled={index === progression.length - 1}
                      aria-label={`Move ${chord.chordName} right`}
                      onClick={() => moveChord(index, 1)}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {progression.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#bfb7aa]">
              <span>{progression.map((chord) => chord.romanNumeral).join(" - ")}</span>
              <span>{progression.map((chord) => chord.chordName).join(" - ")}</span>
            </div>
          ) : null}
          <div className="mt-3 grid gap-2 border-t border-[#fffaf0]/30 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              className="h-9 border-2 border-[#fffaf0] bg-[#171512] px-2 font-mono text-[10px] tracking-[0.08em] text-[#fffaf0] outline-none placeholder:text-[#bfb7aa] focus:bg-[#26231f]"
              value={progressionName}
              placeholder="Take name"
              onChange={(event) => setProgressionName(event.target.value)}
            />
            <input
              className="h-9 border-2 border-[#fffaf0] bg-[#171512] px-2 font-mono text-[10px] tracking-[0.08em] text-[#fffaf0] outline-none placeholder:text-[#bfb7aa] focus:bg-[#26231f]"
              value={progressionNotes}
              placeholder="Notes"
              onChange={(event) => setProgressionNotes(event.target.value)}
            />
            <button
              className="h-9 border-2 border-[#fffaf0] px-3 font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-[#fffaf0] hover:text-[#171512] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#fffaf0]"
              type="button"
              disabled={isPending || progression.length === 0 || progressionName.trim().length === 0}
              onClick={saveProgression}
            >
              {loadedProgressionId ? "Update" : "Save"}
            </button>
          </div>
          {statusMessage ? <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#bfb7aa]">{statusMessage}</p> : null}
        </div>

        <div className="border-2 border-[#171512] bg-[#fffaf0] p-3 text-[#171512]">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span>Library</span>
            <span>{library.length} takes</span>
          </div>
          <div className="grid gap-2">
            {library.length === 0 ? (
              <div className="border-2 border-dashed border-[#171512] px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f675b]">
                No saved takes yet
              </div>
            ) : (
              library.map((savedProgression) => (
                <div className="border-2 border-[#171512] p-2" key={savedProgression.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <strong className="block text-lg leading-none tracking-[-0.06em]">{savedProgression.name}</strong>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">
                        {savedProgression.tonic} {MODE_LABELS[savedProgression.mode]} | {CHORD_TYPE_LABELS[savedProgression.chordType]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] hover:bg-[#171512] hover:text-[#fffaf0]"
                        type="button"
                        onClick={() => loadProgression(savedProgression)}
                      >
                        Load
                      </button>
                      <button
                        className="border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] hover:bg-[#171512] hover:text-[#fffaf0]"
                        type="button"
                        onClick={() => removeSavedProgression(savedProgression.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] tracking-[0.1em] text-[#6f675b]">
                    <span>{savedProgression.chords.map((chord) => chord.romanNumeral).join(" - ")}</span>
                    <span>{savedProgression.chords.map((chord) => chord.chordName).join(" - ")}</span>
                  </div>
                  {savedProgression.notes ? <p className="mt-2 text-xs leading-5 text-[#6f675b]">{savedProgression.notes}</p> : null}
                </div>
              ))
            )}
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
