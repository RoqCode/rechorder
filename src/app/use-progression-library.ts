"use client";

import { useEffect, useState, useTransition } from "react";

import type { ChordType, DiatonicChord, MusicMode } from "@/lib/music/chords";
import {
  createProgression,
  deleteProgression,
  listProgressions,
  type SavedProgression,
  updateProgression,
} from "./progression-actions";

type SaveProgressionInput = {
  id: string | null;
  name: string;
  tonic: string;
  mode: MusicMode;
  chordType: ChordType;
  chords: DiatonicChord[];
  notes: string;
};

export function useProgressionLibrary() {
  const [library, setLibrary] = useState<SavedProgression[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        setLibrary(await listProgressions());
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load library");
      }
    });
  }, []);

  function saveProgression(input: SaveProgressionInput, onSaved: (saved: SavedProgression) => void) {
    startTransition(async () => {
      try {
        const saved = input.id
          ? await updateProgression({ ...input, id: input.id })
          : await createProgression(input);

        onSaved(saved);
        setLibrary(await listProgressions());
        setStatusMessage(input.id ? "Updated" : "Saved");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not save progression");
      }
    });
  }

  function removeProgression(id: string, onDeleted: () => void) {
    startTransition(async () => {
      try {
        await deleteProgression(id);
        setLibrary(await listProgressions());
        onDeleted();
        setDeleteConfirmationId(null);
        setStatusMessage("Deleted");
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not delete progression");
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
  };
}
