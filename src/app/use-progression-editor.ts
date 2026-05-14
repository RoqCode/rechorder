"use client";

import { useState } from "react";

import type { ChordInversion, DiatonicChord } from "@/lib/music/chords";
import {
  applyProgressionTemplate,
  type ProgressionTemplate,
} from "@/lib/music/progression-templates";

type UseProgressionEditorInput = {
  chords: DiatonicChord[];
  setStatusMessage: (message: string) => void;
};

export function useProgressionEditor({
  chords,
  setStatusMessage,
}: UseProgressionEditorInput) {
  const [progression, setProgression] = useState<DiatonicChord[]>([]);
  const [activeProgressionIndex, setActiveProgressionIndex] = useState<
    number | null
  >(null);

  function appendChord(chord: DiatonicChord) {
    const nextChord = { ...chord, inversion: chord.inversion ?? 0 };
    setProgression((current) => {
      setActiveProgressionIndex(current.length);
      return [...current, nextChord];
    });
    return nextChord;
  }

  function clearProgression() {
    setProgression([]);
    setActiveProgressionIndex(null);
  }

  function removeChord(index: number) {
    const isRemovingActiveChord = activeProgressionIndex === index;
    setProgression((current) => current.filter((_, i) => i !== index));
    setActiveProgressionIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
    return isRemovingActiveChord;
  }

  function reorderChord(fromIndex: number, toIndex: number) {
    setProgression((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setActiveProgressionIndex((current) => {
      if (current === null) return null;
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && current <= toIndex) return current - 1;
      if (toIndex <= current && current < fromIndex) return current + 1;
      return current;
    });
  }

  function replaceWithTemplate(template: ProgressionTemplate) {
    const nextProgression = applyProgressionTemplate(template, chords);
    setProgression(nextProgression);
    setActiveProgressionIndex(0);
    setStatusMessage(`Loaded ${template.name}`);
    return nextProgression;
  }

  function focusProgressionChord(index: number) {
    const chord = progression[index];
    if (!chord) return null;

    setActiveProgressionIndex(index);
    return chord;
  }

  function changeChordInversion(index: number, inversion: ChordInversion) {
    const chord = progression[index];
    const updatedChord = chord ? { ...chord, inversion } : null;
    setProgression((current) =>
      current.map((chord, i) =>
        i === index ? { ...chord, inversion } : chord,
      ),
    );
    if (updatedChord) setActiveProgressionIndex(index);
    return updatedChord;
  }

  function loadProgression(nextProgression: DiatonicChord[]) {
    setProgression(nextProgression);
    setActiveProgressionIndex(nextProgression.length > 0 ? 0 : null);
  }

  return {
    progression,
    activeProgressionIndex,
    setActiveProgressionIndex,
    appendChord,
    clearProgression,
    removeChord,
    reorderChord,
    replaceWithTemplate,
    focusProgressionChord,
    changeChordInversion,
    loadProgression,
  };
}
