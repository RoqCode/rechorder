"use client";

import { useEffect, useState, useTransition } from "react";

import type { AudioArt, PlaybackStyle } from "@/lib/audio/chord-audio";
import type { ChordType, DiatonicChord, MusicMode } from "@/lib/music/chords";
import type { SavedProgression } from "@/lib/progressions/progression-schema";
import {
  createProgressionExport,
  deleteSavedProgression,
  importSavedProgressions,
  insertProgression,
  listSavedProgressions,
  parseProgressionExport,
  updateSavedProgression,
} from "@/lib/progressions/progression-repository";

type SaveProgressionInput = {
  id: string | null;
  name: string;
  tonic: string;
  mode: MusicMode;
  chordType: ChordType;
  chords: DiatonicChord[];
  notes: string;
  tempo: number;
  audioArt: AudioArt;
  playbackStyle: PlaybackStyle;
  ambience: number;
};

export function useProgressionLibrary() {
  const [library, setLibrary] = useState<SavedProgression[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        setLibrary(await listSavedProgressions());
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load library");
      }
    });
  }, []);

  function saveProgression(input: SaveProgressionInput, onSaved: (saved: SavedProgression) => void) {
    startTransition(async () => {
      try {
        const saved = input.id
          ? await updateSavedProgression({ ...input, id: input.id })
          : await insertProgression(input);

        onSaved(saved);
        setLibrary(await listSavedProgressions());
        setStatusMessage(input.id ? "Updated" : "Saved");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not save progression");
      }
    });
  }

  function removeProgression(id: string, onDeleted: () => void) {
    startTransition(async () => {
      try {
        await deleteSavedProgression(id);
        setLibrary(await listSavedProgressions());
        onDeleted();
        setDeleteConfirmationId(null);
        setStatusMessage("Deleted");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not delete progression");
      }
    });
  }

  function exportLibrary() {
    try {
      const exportData = createProgressionExport(library);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rechorder-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMessage("Exported");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not export library");
    }
  }

  function importLibrary(file: File) {
    startTransition(async () => {
      try {
        const importedCount = await importSavedProgressions(
          parseProgressionExport(await file.text()),
        );
        setLibrary(await listSavedProgressions());
        setStatusMessage(`Imported ${importedCount} ${importedCount === 1 ? "take" : "takes"}`);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not import library");
      }
    });
  }

  return {
    library,
    statusMessage,
    setStatusMessage,
    deleteConfirmationId,
    setDeleteConfirmationId,
    isPending,
    saveProgression,
    removeProgression,
    exportLibrary,
    importLibrary,
  };
}
