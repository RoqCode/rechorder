"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  type ChordType,
  type DiatonicChord,
  getDiatonicChords,
  getScale,
  getSupportedTonics,
  MODE_DESCRIPTORS,
  type MusicMode,
} from "@/lib/music/chords";
import {
  type AudioArt,
  getChordPlaybackDuration,
  playChordPreview,
} from "@/lib/audio/chord-audio";
import { getCenteredRootFloorKey } from "@/lib/music/keyboard";

import { AudioControls } from "./audio-controls";
import { ChordGrid } from "./chord-grid";
import { LibrarySidebar } from "./library-sidebar";
import { PianoKeyboard } from "./piano-keyboard";
import {
  createProgression,
  deleteProgression,
  listProgressions,
  type SavedProgression,
  updateProgression,
} from "./progression-actions";
import { ProgressionSequence } from "./progression-sequence";
import { Selectors } from "./selectors";

const NOTE_PITCH_CLASSES: Record<string, number> = {
  C: 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

type KeyboardDisplayMode = "scale" | "chord";

export function ChordExplorer() {
  const [mode, setMode] = useState<MusicMode>("ionian");
  const [tonic, setTonic] = useState("C");
  const [chordType, setChordType] = useState<ChordType>("triads");
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [keyboardDisplayMode, setKeyboardDisplayMode] = useState<KeyboardDisplayMode>("scale");
  const [progression, setProgression] = useState<DiatonicChord[]>([]);
  const [library, setLibrary] = useState<SavedProgression[]>([]);
  const [progressionName, setProgressionName] = useState("");
  const [progressionNotes, setProgressionNotes] = useState("");
  const [loadedProgressionId, setLoadedProgressionId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [playingProgressionIndex, setPlayingProgressionIndex] = useState<number | null>(null);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(85);
  const [tempo, setTempo] = useState(100);
  const [audioArt, setAudioArt] = useState<AudioArt>("piano");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTimeoutsRef = useRef<number[]>([]);
  const playbackOscillatorsRef = useRef<OscillatorNode[]>([]);

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
  const tonicGlyph = formatTonicGlyph(tonic);
  const keyLabel = `${tonicGlyph} ${modeDescriptor.label}`;
  const canSave =
    progression.length > 0 && progressionName.trim().length > 0;

  useEffect(() => {
    startTransition(async () => {
      try {
        setLibrary(await listProgressions());
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load library");
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach(window.clearTimeout);
      playbackTimeoutsRef.current = [];
      playbackOscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // already finished
        }
      });
      playbackOscillatorsRef.current = [];
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (event.key >= "1" && event.key <= "7") {
        const index = Number(event.key) - 1;
        if (index < chords.length) {
          const chord = chords[index];
          previewChord(chord);
        }
      } else if (event.key === "Backspace" && progression.length > 0) {
        removeChord(progression.length - 1);
      } else if (event.key === "Escape") {
        setSelectedDegree(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chords, progression.length]);

  function handleTonicChange(nextTonic: string) {
    setTonic(nextTonic);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
  }

  function handleModeChange(nextMode: MusicMode) {
    setMode(nextMode);
    setKeyboardDisplayMode("scale");
    setSelectedDegree(null);
    // Try to keep the same pitch class for the tonic when switching modes.
    const supported = getSupportedTonics(nextMode);
    const targetPc = NOTE_PITCH_CLASSES[tonic];
    const sameClass = supported.find((candidate) => NOTE_PITCH_CLASSES[candidate] === targetPc);
    if (sameClass) {
      setTonic(sameClass);
    } else {
      setTonic(supported[0]);
    }
  }

  function previewChord(chord: DiatonicChord) {
    setKeyboardDisplayMode("chord");
    setSelectedDegree(chord.degree);
    playChord(chord);
  }

  function appendChord(chord: DiatonicChord) {
    setKeyboardDisplayMode("chord");
    setSelectedDegree(chord.degree);
    addChord(chord);
    playChord(chord);
  }

  function playChord(chord: DiatonicChord) {
    playChordPreview({
      audioContext: getAudioContext(),
      chord,
      rootFloorKey,
      settings: { isMuted, volume, tempo, audioArt },
    });
  }

  function getAudioContext() {
    audioContextRef.current ??= new AudioContext();
    return audioContextRef.current;
  }

  function clearPlaybackTimers() {
    playbackTimeoutsRef.current.forEach(window.clearTimeout);
    playbackTimeoutsRef.current = [];
  }

  function stopPlaybackOscillators() {
    playbackOscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // already finished
      }
    });
    playbackOscillatorsRef.current = [];
  }

  function toggleProgressionPlayback() {
    if (isPlayingProgression) {
      stopProgressionPlayback();
      return;
    }

    startProgressionPlayback();
  }

  function startProgressionPlayback() {
    if (progression.length === 0) return;

    clearPlaybackTimers();
    setIsPlayingProgression(true);

    if (isMuted) {
      setIsMuted(false);
    }

    const audioContext = getAudioContext();
    const settings = { isMuted: false, volume, tempo, audioArt };
    const chordDuration = getChordPlaybackDuration(settings);
    const cycleDuration = progression.length * chordDuration;

    function scheduleCycle(cycleStartTime: number) {
      progression.forEach((chord, index) => {
        const chordStartTime = cycleStartTime + index * chordDuration;
        playbackOscillatorsRef.current.push(
          ...playChordPreview({
            audioContext,
            chord,
            rootFloorKey,
            settings,
            startTime: chordStartTime,
          }),
        );

        playbackTimeoutsRef.current.push(
          window.setTimeout(
            () => {
              setPlayingProgressionIndex(index);
              setKeyboardDisplayMode("chord");
              setSelectedDegree(chord.degree);
            },
            Math.max(0, (chordStartTime - audioContext.currentTime) * 1000),
          ),
        );
      });

      playbackTimeoutsRef.current.push(
        window.setTimeout(
          () => {
            setPlayingProgressionIndex(null);
            if (isLooping) {
              scheduleCycle(audioContext.currentTime + 0.05);
              return;
            }
            setIsPlayingProgression(false);
            playbackOscillatorsRef.current = [];
          },
          Math.max(0, (cycleStartTime + cycleDuration - audioContext.currentTime) * 1000),
        ),
      );
    }

    scheduleCycle(audioContext.currentTime + 0.05);
  }

  function stopProgressionPlayback() {
    clearPlaybackTimers();
    stopPlaybackOscillators();
    setIsPlayingProgression(false);
    setPlayingProgressionIndex(null);
  }

  function addChord(chord: DiatonicChord) {
    stopProgressionPlayback();
    setProgression((current) => [...current, chord]);
  }

  function clearProgression() {
    stopProgressionPlayback();
    setProgression([]);
  }

  function removeChord(index: number) {
    stopProgressionPlayback();
    setProgression((current) => current.filter((_, i) => i !== index));
  }

  function reorderChord(fromIndex: number, toIndex: number) {
    stopProgressionPlayback();
    setProgression((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function saveProgression() {
    startTransition(async () => {
      try {
        const input = {
          name: progressionName.trim(),
          tonic,
          mode,
          chordType,
          chords: progression,
          notes: progressionNotes.trim(),
        };

        const saved = loadedProgressionId
          ? await updateProgression({ ...input, id: loadedProgressionId })
          : await createProgression(input);

        setLoadedProgressionId(saved.id);
        setLibrary(await listProgressions());
        setStatusMessage(loadedProgressionId ? "Updated" : "Saved");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not save progression");
      }
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
    stopProgressionPlayback();
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
    startTransition(async () => {
      try {
        await deleteProgression(id);
        setLibrary(await listProgressions());
        if (loadedProgressionId === id) {
          setLoadedProgressionId(null);
        }
        setDeleteConfirmationId(null);
        setStatusMessage("Deleted");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not delete progression");
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
    ? `${selectedChord.chordName.replace("dim", "°")} · ${selectedChord.notes.map(formatTonicGlyph).join(" ")}`
    : `${keyLabel} · ${scale.map(formatTonicGlyph).join(" ")}`;
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
            onChangeChordType={setChordType}
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
            playingIndex={playingProgressionIndex}
            keyLabel={keyLabel}
            isPlaying={isPlayingProgression}
            isLooping={isLooping}
            copyMessage={copyMessage}
            onRemove={removeChord}
            onReorder={reorderChord}
            onTogglePlayback={toggleProgressionPlayback}
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
              onMutedChange={setIsMuted}
              onVolumeChange={setVolume}
              onTempoChange={setTempo}
              onAudioArtChange={setAudioArt}
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

function formatTonicGlyph(note: string) {
  return note.replace("##", "𝄪").replace("bb", "𝄫").replace("#", "♯").replace("b", "♭");
}
