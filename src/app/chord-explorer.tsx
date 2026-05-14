"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type ChordType,
  type DiatonicChord,
  formatNote,
  getDiatonicChords,
  getPitchClass,
  getScale,
  getSupportedTonics,
  MODE_DESCRIPTORS,
  type MusicMode,
} from "@/lib/music/chords";
import { type AudioArt } from "@/lib/audio/chord-audio";
import { getCenteredRootFloorKey } from "@/lib/music/keyboard";

import { AudioControls } from "./audio-controls";
import { ChordGrid } from "./chord-grid";
import { LibrarySidebar } from "./library-sidebar";
import { PianoKeyboard } from "./piano-keyboard";
import { type SavedProgression } from "./progression-actions";
import { ProgressionSequence } from "./progression-sequence";
import { Selectors } from "./selectors";
import { useProgressionLibrary } from "./use-progression-library";
import { useProgressionPlayback } from "./use-progression-playback";

type KeyboardDisplayMode = "scale" | "chord";

export function ChordExplorer() {
  const [mode, setMode] = useState<MusicMode>("ionian");
  const [tonic, setTonic] = useState("C");
  const [chordType, setChordType] = useState<ChordType>("triads");
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [keyboardDisplayMode, setKeyboardDisplayMode] = useState<KeyboardDisplayMode>("scale");
  const [progression, setProgression] = useState<DiatonicChord[]>([]);
  const [progressionName, setProgressionName] = useState("");
  const [progressionNotes, setProgressionNotes] = useState("");
  const [loadedProgressionId, setLoadedProgressionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(85);
  const [tempo, setTempo] = useState(100);
  const [audioArt, setAudioArt] = useState<AudioArt>("piano");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const previewChordRef = useRef<(chord: DiatonicChord) => void>(() => {});
  const removeChordRef = useRef<(index: number) => void>(() => {});
  const {
    library,
    statusMessage,
    setStatusMessage,
    deleteConfirmationId,
    setDeleteConfirmationId,
    isPending,
    saveProgression: persistProgression,
    removeProgression: removePersistedProgression,
  } = useProgressionLibrary();

  const chords = useMemo(
    () => getDiatonicChords({ tonic, mode, chordType }),
    [tonic, mode, chordType],
  );
  const scale = useMemo(() => getScale(tonic, mode), [tonic, mode]);
  const selectedChord =
    selectedDegree !== null
      ? (chords.find((c) => c.degree === selectedDegree) ?? null)
      : null;
  const rootFloorKey = useMemo(
    () => getCenteredRootFloorKey(tonic, chords.map((chord) => chord.notes)),
    [tonic, chords],
  );
  const modeDescriptor = MODE_DESCRIPTORS[mode];
  const tonicGlyph = formatNote(tonic);
  const keyLabel = `${tonicGlyph} ${modeDescriptor.label}`;
  const canSave =
    progression.length > 0 && progressionName.trim().length > 0;
  const {
    playingIndex,
    isPlaying,
    isLooping,
    setIsLooping,
    playChord,
    togglePlayback,
    stopPlayback,
  } = useProgressionPlayback({
    progression,
    rootFloorKey,
    settings: { isMuted, volume, tempo, audioArt },
    onMutedChange: setIsMuted,
    onChordFocus: focusChord,
  });

  useEffect(() => {
    previewChordRef.current = previewChord;
    removeChordRef.current = removeChord;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (event.key >= "1" && event.key <= "7") {
        const index = Number(event.key) - 1;
        if (index < chords.length) {
          const chord = chords[index];
          previewChordRef.current(chord);
        }
      } else if (event.key === "Backspace" && progression.length > 0) {
        removeChordRef.current(progression.length - 1);
      } else if (event.key === "Escape") {
        setSelectedDegree(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chords, progression.length]);

  function handleTonicChange(nextTonic: string) {
    stopPlayback();
    setTonic(nextTonic);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
  }

  function handleModeChange(nextMode: MusicMode) {
    stopPlayback();
    setMode(nextMode);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
    // Try to keep the same pitch class for the tonic when switching modes.
    const supported = getSupportedTonics(nextMode);
    const targetPc = getPitchClass(tonic);
    const sameClass = supported.find((candidate) => getPitchClass(candidate) === targetPc);
    if (sameClass) {
      setTonic(sameClass);
    } else {
      setTonic(supported[0]);
    }
  }

  function handleChordTypeChange(nextChordType: ChordType) {
    stopPlayback();
    setChordType(nextChordType);
  }

  function handleMutedChange(nextIsMuted: boolean) {
    stopPlayback();
    setIsMuted(nextIsMuted);
  }

  function handleVolumeChange(nextVolume: number) {
    stopPlayback();
    setVolume(nextVolume);
  }

  function handleTempoChange(nextTempo: number) {
    stopPlayback();
    setTempo(nextTempo);
  }

  function handleAudioArtChange(nextAudioArt: AudioArt) {
    stopPlayback();
    setAudioArt(nextAudioArt);
  }

  function previewChord(chord: DiatonicChord) {
    focusChord(chord);
    playChord(chord);
  }

  function appendChord(chord: DiatonicChord) {
    focusChord(chord);
    addChord(chord);
    playChord(chord);
  }

  function focusChord(chord: DiatonicChord) {
    setKeyboardDisplayMode("chord");
    setSelectedDegree(chord.degree);
  }

  function addChord(chord: DiatonicChord) {
    stopPlayback();
    setProgression((current) => [...current, chord]);
  }

  function clearProgression() {
    stopPlayback();
    setProgression([]);
  }

  function removeChord(index: number) {
    stopPlayback();
    setProgression((current) => current.filter((_, i) => i !== index));
  }

  function reorderChord(fromIndex: number, toIndex: number) {
    stopPlayback();
    setProgression((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function saveProgression() {
    persistProgression({
      id: loadedProgressionId,
      name: progressionName.trim(),
      tonic,
      mode,
      chordType,
      chords: progression,
      notes: progressionNotes.trim(),
    }, (saved) => {
      setLoadedProgressionId(saved.id);
    });
  }

  function startNewTake() {
    clearProgression();
    setProgressionName("");
    setProgressionNotes("");
    setLoadedProgressionId(null);
    setStatusMessage("New take");
  }

  function loadSavedProgression(saved: SavedProgression) {
    stopPlayback();
    setTonic(saved.tonic);
    setMode(saved.mode);
    setChordType(saved.chordType);
    setProgression(saved.chords);
    setProgressionName(saved.name);
    setProgressionNotes(saved.notes ?? "");
    setLoadedProgressionId(saved.id);
    setSelectedDegree(saved.chords[0]?.degree ?? null);
    setKeyboardDisplayMode(saved.chords.length > 0 ? "chord" : "scale");
    setStatusMessage("Loaded");
  }

  function removeSavedProgression(id: string) {
    removePersistedProgression(id, () => {
      if (loadedProgressionId === id) {
        setLoadedProgressionId(null);
      }
    });
  }

  async function copyAsText() {
    if (progression.length === 0) return;
    const names = progression.map((c) => c.chordName).join(" – ");
    const romans = progression.map((c) => c.romanNumeral).join(" – ");
    const text = `${tonicGlyph} ${modeDescriptor.label}\n${names}\n${romans}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied");
      window.setTimeout(() => setCopyMessage(""), 1500);
    } catch {
      setCopyMessage("Copy failed");
      window.setTimeout(() => setCopyMessage(""), 1500);
    }
  }

  const keyboardReadout = keyboardDisplayMode === "chord" && selectedChord
    ? `${selectedChord.chordName.replace("dim", "°")} · ${selectedChord.notes.map(formatNote).join(" ")}`
    : `${keyLabel} · ${scale.map(formatNote).join(" ")}`;
  const keyboardNotes = keyboardDisplayMode === "chord" ? (selectedChord?.notes ?? []) : scale;

  return (
    <div className="flex min-h-screen">
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-14">
          {/* TOP BAR */}
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--rule)] py-7">
            <div className="flex items-baseline font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text)]">
              <span
                aria-hidden="true"
                className="mr-[10px] inline-block h-[6px] w-[6px] -translate-y-px bg-[var(--accent)]"
              />
              Rechorder · 001
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
              <span>
                <span className="text-[var(--text-2)]">v</span> 0.1
              </span>
              <span>
                <span className="text-[var(--text-2)]">Tuning</span> A=440
              </span>
              <span>
                <span className="text-[var(--text-2)]">Key</span> {keyLabel}
              </span>
            </div>
          </header>

          {/* ZONE 1 */}
          <Selectors
            tonic={tonic}
            mode={mode}
            onTonicChange={handleTonicChange}
            onModeChange={handleModeChange}
          />

          {/* ZONE 2 */}
          <ChordGrid
            chords={chords}
            mode={mode}
            selectedDegree={selectedDegree}
            chordType={chordType}
            onPreviewChord={previewChord}
            onAddChord={appendChord}
            onChangeChordType={handleChordTypeChange}
          />

          {/* ZONE 3 */}
          <section className="border-b border-[var(--rule)] py-9">
            <header className="mb-6 flex items-baseline gap-[10px]">
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
                03
              </span>
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
                Keyboard
              </span>
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
                {keyboardReadout}
              </span>
            </header>
            <PianoKeyboard
              activeNotes={keyboardNotes}
              alternateNotes={keyboardNotes}
              rootFloorKey={rootFloorKey}
              rootNote={keyboardDisplayMode === "chord" ? selectedChord?.notes[0] : tonic}
            />
          </section>

          {/* ZONE 4 */}
          <ProgressionSequence
            progression={progression}
            playingIndex={playingIndex}
            keyLabel={keyLabel}
            isPlaying={isPlaying}
            isLooping={isLooping}
            copyMessage={copyMessage}
            onRemove={removeChord}
            onReorder={reorderChord}
            onTogglePlayback={togglePlayback}
            onToggleLoop={() => setIsLooping((current) => !current)}
            onClear={clearProgression}
            onCopy={copyAsText}
          />

          {/* FOOTER */}
          <footer className="py-6">
            <AudioControls
              isMuted={isMuted}
              volume={volume}
              tempo={tempo}
              audioArt={audioArt}
              onMutedChange={handleMutedChange}
              onVolumeChange={handleVolumeChange}
              onTempoChange={handleTempoChange}
              onAudioArtChange={handleAudioArtChange}
            />
          </footer>
        </div>
      </main>

      <LibrarySidebar
        library={library}
        isOpen={isLibraryOpen}
        onToggle={() => setIsLibraryOpen((current) => !current)}
        name={progressionName}
        notes={progressionNotes}
        loadedProgressionId={loadedProgressionId}
        canSave={canSave}
        isPending={isPending}
        statusMessage={statusMessage}
        onNameChange={setProgressionName}
        onNotesChange={setProgressionNotes}
        onSave={saveProgression}
        onNewTake={startNewTake}
        deleteConfirmationId={deleteConfirmationId}
        onLoad={loadSavedProgression}
        onRequestDelete={setDeleteConfirmationId}
        onCancelDelete={() => setDeleteConfirmationId(null)}
        onDelete={removeSavedProgression}
      />
    </div>
  );
}
