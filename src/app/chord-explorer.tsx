"use client";

import { useMemo, useState } from "react";

import {
  type ChordType,
  type ChordInversion,
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
import { getCenteredRootFloorKey, getVoicedNotes } from "@/lib/music/keyboard";
import type { ProgressionTemplate } from "@/lib/music/progression-templates";
import type { SavedProgression } from "@/lib/progressions/progression-schema";

import { AudioControls } from "./audio-controls";
import { ChordGrid } from "./chord-grid";
import { CollapsibleSection } from "./collapsible-section";
import { LibrarySidebar } from "./library-sidebar";
import { PianoKeyboard } from "./piano-keyboard";
import { ProgressionSequence } from "./progression-sequence";
import { ProgressionTemplates } from "./progression-templates";
import { Selectors } from "./selectors";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { useProgressionEditor } from "./use-progression-editor";
import { useProgressionLibrary } from "./use-progression-library";
import { useProgressionPlayback } from "./use-progression-playback";

type KeyboardDisplayMode = "scale" | "chord";
type SectionId =
  | "selectors"
  | "chords"
  | "templates"
  | "keyboard"
  | "progression";

export function ChordExplorer() {
  const [mode, setMode] = useState<MusicMode>("ionian");
  const [tonic, setTonic] = useState("C");
  const [chordType, setChordType] = useState<ChordType>("triads");
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [focusedChord, setFocusedChord] = useState<DiatonicChord | null>(null);
  const [keyboardDisplayMode, setKeyboardDisplayMode] =
    useState<KeyboardDisplayMode>("scale");
  const [progressionName, setProgressionName] = useState("");
  const [progressionNotes, setProgressionNotes] = useState("");
  const [loadedProgressionId, setLoadedProgressionId] = useState<string | null>(
    null,
  );
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(85);
  const [ambience, setAmbience] = useState(18);
  const [tempo, setTempo] = useState(100);
  const [audioArt, setAudioArt] = useState<AudioArt>("piano");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<SectionId>>(
    new Set(),
  );
  const [copyMessage, setCopyMessage] = useState("");
  const {
    library,
    statusMessage,
    setStatusMessage,
    deleteConfirmationId,
    setDeleteConfirmationId,
    isPending,
    saveProgression: persistProgression,
    removeProgression: removePersistedProgression,
    exportLibrary,
    importLibrary,
  } = useProgressionLibrary();

  const chords = useMemo(
    () => getDiatonicChords({ tonic, mode, chordType }),
    [tonic, mode, chordType],
  );
  const scale = useMemo(() => getScale(tonic, mode), [tonic, mode]);
  const selectedChord =
    focusedChord ??
    (selectedDegree !== null
      ? (chords.find((c) => c.degree === selectedDegree) ?? null)
      : null);
  const rootFloorKey = useMemo(
    () =>
      getCenteredRootFloorKey(
        tonic,
        chords.map((chord) => chord.notes),
      ),
    [tonic, chords],
  );
  const modeDescriptor = MODE_DESCRIPTORS[mode];
  const tonicGlyph = formatNote(tonic);
  const keyLabel = `${tonicGlyph} ${modeDescriptor.label}`;
  const {
    progression,
    activeProgressionIndex,
    setActiveProgressionIndex,
    appendChord: appendProgressionChord,
    clearProgression: clearProgressionState,
    removeChord: removeProgressionChord,
    reorderChord: reorderProgressionChord,
    replaceWithTemplate: replaceProgressionWithTemplate,
    focusProgressionChord: selectProgressionChord,
    changeChordInversion: updateProgressionChordInversion,
    loadProgression,
  } = useProgressionEditor({
    chords,
    setStatusMessage,
  });
  const canSave = progression.length > 0 && progressionName.trim().length > 0;
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
    settings: { isMuted, volume, tempo, audioArt, ambience },
    onMutedChange: setIsMuted,
    onChordFocus: focusChord,
  });

  useKeyboardShortcuts({
    chords,
    progressionLength: progression.length,
    onPreviewChord: previewChord,
    onRemoveLastChord: () => removeChord(progression.length - 1),
    onClearFocus: clearChordFocus,
  });

  function handleTonicChange(nextTonic: string) {
    stopPlayback();
    setTonic(nextTonic);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
    setFocusedChord(null);
    setActiveProgressionIndex(null);
  }

  function handleModeChange(nextMode: MusicMode) {
    stopPlayback();
    setMode(nextMode);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
    setFocusedChord(null);
    setActiveProgressionIndex(null);
    // Try to keep the same pitch class for the tonic when switching modes.
    const supported = getSupportedTonics(nextMode);
    const targetPc = getPitchClass(tonic);
    const sameClass = supported.find(
      (candidate) => getPitchClass(candidate) === targetPc,
    );
    if (sameClass) {
      setTonic(sameClass);
    } else {
      setTonic(supported[0]);
    }
  }

  function handleChordTypeChange(nextChordType: ChordType) {
    stopPlayback();
    setChordType(nextChordType);
    setFocusedChord(null);
    setActiveProgressionIndex(null);
  }

  function handleMutedChange(nextIsMuted: boolean) {
    stopPlayback();
    setIsMuted(nextIsMuted);
  }

  function handleVolumeChange(nextVolume: number) {
    stopPlayback();
    setVolume(nextVolume);
  }

  function handleAmbienceChange(nextAmbience: number) {
    stopPlayback();
    setAmbience(nextAmbience);
  }

  function handleTempoChange(nextTempo: number) {
    stopPlayback();
    setTempo(nextTempo);
  }

  function handleAudioArtChange(nextAudioArt: AudioArt) {
    stopPlayback();
    setAudioArt(nextAudioArt);
  }

  function toggleSection(section: SectionId) {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function previewChord(chord: DiatonicChord) {
    setActiveProgressionIndex(null);
    focusChord(chord);
    playChord(chord);
  }

  function appendChord(chord: DiatonicChord) {
    stopPlayback();
    const nextChord = appendProgressionChord(chord);
    focusChord(nextChord);
    playChord(nextChord);
  }

  function focusChord(chord: DiatonicChord) {
    setKeyboardDisplayMode("chord");
    setSelectedDegree(chord.degree);
    setFocusedChord(chord);
  }

  function clearChordFocus() {
    setSelectedDegree(null);
    setFocusedChord(null);
    setActiveProgressionIndex(null);
  }

  function clearProgression() {
    stopPlayback();
    clearProgressionState();
    clearChordFocus();
  }

  function removeChord(index: number) {
    stopPlayback();
    if (removeProgressionChord(index)) {
      clearChordFocus();
    }
  }

  function reorderChord(fromIndex: number, toIndex: number) {
    stopPlayback();
    reorderProgressionChord(fromIndex, toIndex);
  }

  function replaceWithTemplate(template: ProgressionTemplate) {
    stopPlayback();
    const nextProgression = replaceProgressionWithTemplate(template);
    focusChord(nextProgression[0]);
    setLoadedProgressionId(null);
  }

  function focusProgressionChord(index: number) {
    const chord = selectProgressionChord(index);
    if (!chord) return;

    focusChord(chord);
    playChord(chord);
  }

  function changeChordInversion(
    index: number,
    inversion: ChordInversion,
  ) {
    stopPlayback();
    const updatedChord = updateProgressionChordInversion(index, inversion);
    if (!updatedChord) return;

    focusChord(updatedChord);
    playChord(updatedChord);
  }

  function saveProgression() {
    persistProgression(
      {
        id: loadedProgressionId,
        name: progressionName.trim(),
        tonic,
        mode,
        chordType,
        chords: progression,
        notes: progressionNotes.trim(),
      },
      (saved) => {
        setLoadedProgressionId(saved.id);
      },
    );
  }

  function startNewTake() {
    clearProgression();
    setProgressionName("");
    setProgressionNotes("");
    setLoadedProgressionId(null);
    setActiveProgressionIndex(null);
    setStatusMessage("New take");
  }

  function loadSavedProgression(saved: SavedProgression) {
    stopPlayback();
    setTonic(saved.tonic);
    setMode(saved.mode);
    setChordType(saved.chordType);
    loadProgression(saved.chords);
    setProgressionName(saved.name);
    setProgressionNotes(saved.notes ?? "");
    setLoadedProgressionId(saved.id);
    setSelectedDegree(saved.chords[0]?.degree ?? null);
    setFocusedChord(saved.chords[0] ?? null);
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

  const keyboardReadout =
    keyboardDisplayMode === "chord" && selectedChord
      ? `${selectedChord.chordName.replace("dim", "°")} · ${getVoicedNotes(
          selectedChord.notes,
          selectedChord.inversion ?? 0,
        )
          .map(formatNote)
          .join(" ")}`
      : `${keyLabel} · ${scale.map(formatNote).join(" ")}`;
  const keyboardNotes =
    keyboardDisplayMode === "chord" ? (selectedChord?.notes ?? []) : scale;
  const savedTakeCount = String(library.length).padStart(3, "0");

  return (
    <div className="flex min-h-screen">
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8 md:px-14">
          {/* TOP BAR */}
          <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--rule)] py-5 sm:py-7">
            <div>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-[18px] w-[18px] place-items-center bg-[var(--accent)] font-mono text-[10px] font-medium leading-none text-[var(--text)]"
                ></span>
                <div className="text-[28px] font-semibold leading-[0.9] tracking-[-0.045em] sm:text-[34px]">
                  Rechorder
                </div>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[var(--text-3)]">
                Harmony Sketchpad · {savedTakeCount}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
              <span
                className="border-[0.5px] border-[var(--hair)] px-2 py-[6px]"
                style={{ borderRadius: "var(--radius)" }}
              >
                <span className="text-[var(--text-2)]">v</span> 0.1
              </span>
              <span
                className="border-[0.5px] border-[var(--hair)] px-2 py-[6px]"
                style={{ borderRadius: "var(--radius)" }}
              >
                <span className="text-[var(--text-2)]">Tuning</span> A=440
              </span>
              <span
                className="border-[0.5px] border-[var(--hair)] px-2 py-[6px]"
                style={{ borderRadius: "var(--radius)" }}
              >
                <span className="text-[var(--text-2)]">Key</span> {keyLabel}
              </span>
            </div>
          </header>

          {/* ZONE 1 */}
          <Selectors
            tonic={tonic}
            mode={mode}
            isCollapsed={collapsedSections.has("selectors")}
            onTonicChange={handleTonicChange}
            onModeChange={handleModeChange}
            onToggleCollapse={() => toggleSection("selectors")}
          />

          {/* ZONE 2 */}
          <ChordGrid
            chords={chords}
            mode={mode}
            selectedDegree={selectedDegree}
            chordType={chordType}
            isCollapsed={collapsedSections.has("chords")}
            onPreviewChord={previewChord}
            onAddChord={appendChord}
            onChangeChordType={handleChordTypeChange}
            onToggleCollapse={() => toggleSection("chords")}
          />

          <ProgressionTemplates
            isCollapsed={collapsedSections.has("templates")}
            onApplyTemplate={replaceWithTemplate}
            onToggleCollapse={() => toggleSection("templates")}
          />

          {/* ZONE 3 */}
          <CollapsibleSection
            index="04"
            title="Keyboard"
            readout={keyboardReadout}
            isCollapsed={collapsedSections.has("keyboard")}
            onToggle={() => toggleSection("keyboard")}
          >
            <PianoKeyboard
              activeNotes={keyboardNotes}
              alternateNotes={keyboardNotes}
              rootFloorKey={rootFloorKey}
              rootNote={
                keyboardDisplayMode === "chord"
                  ? selectedChord?.notes[0]
                  : tonic
              }
              inversion={
                keyboardDisplayMode === "chord"
                  ? (selectedChord?.inversion ?? 0)
                  : 0
              }
            />
          </CollapsibleSection>

          {/* ZONE 4 */}
          <ProgressionSequence
            progression={progression}
            activeIndex={activeProgressionIndex}
            playingIndex={playingIndex}
            keyLabel={keyLabel}
            isPlaying={isPlaying}
            isLooping={isLooping}
            isCollapsed={collapsedSections.has("progression")}
            copyMessage={copyMessage}
            onRemove={removeChord}
            onReorder={reorderChord}
            onFocusChord={focusProgressionChord}
            onChangeInversion={changeChordInversion}
            onTogglePlayback={togglePlayback}
            onToggleLoop={() => setIsLooping((current) => !current)}
            onToggleCollapse={() => toggleSection("progression")}
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
              ambience={ambience}
              onMutedChange={handleMutedChange}
              onVolumeChange={handleVolumeChange}
              onTempoChange={handleTempoChange}
              onAudioArtChange={handleAudioArtChange}
              onAmbienceChange={handleAmbienceChange}
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
        onExport={exportLibrary}
        onImport={importLibrary}
      />
    </div>
  );
}
