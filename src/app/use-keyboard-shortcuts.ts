"use client";

import { useEffect, useRef } from "react";

import type { DiatonicChord } from "@/lib/music/chords";

type UseKeyboardShortcutsInput = {
  chords: DiatonicChord[];
  progressionLength: number;
  onPreviewChord: (chord: DiatonicChord) => void;
  onRemoveLastChord: () => void;
  onClearFocus: () => void;
};

export function useKeyboardShortcuts({
  chords,
  progressionLength,
  onPreviewChord,
  onRemoveLastChord,
  onClearFocus,
}: UseKeyboardShortcutsInput) {
  const previewChordRef = useRef(onPreviewChord);
  const removeLastChordRef = useRef(onRemoveLastChord);
  const clearFocusRef = useRef(onClearFocus);

  useEffect(() => {
    previewChordRef.current = onPreviewChord;
    removeLastChordRef.current = onRemoveLastChord;
    clearFocusRef.current = onClearFocus;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;

      if (event.key >= "1" && event.key <= "7") {
        const index = Number(event.key) - 1;
        if (index < chords.length) {
          event.preventDefault();
          previewChordRef.current(chords[index]);
        }
      } else if (event.key === "Backspace" && progressionLength > 0) {
        event.preventDefault();
        removeLastChordRef.current();
      } else if (event.key === "Escape") {
        event.preventDefault();
        clearFocusRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chords, progressionLength]);
}
