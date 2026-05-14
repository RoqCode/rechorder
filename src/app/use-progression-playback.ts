"use client";

import { useEffect, useRef, useState } from "react";

import {
  type AudioArt,
  getChordPlaybackDuration,
  playChordPreview,
} from "@/lib/audio/chord-audio";
import type { DiatonicChord } from "@/lib/music/chords";

type PlaybackSettings = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
};

type UseProgressionPlaybackInput = {
  progression: DiatonicChord[];
  rootFloorKey: string;
  settings: PlaybackSettings;
  onMutedChange: (isMuted: boolean) => void;
  onChordFocus: (chord: DiatonicChord) => void;
};

export function useProgressionPlayback({
  progression,
  rootFloorKey,
  settings,
  onMutedChange,
  onChordFocus,
}: UseProgressionPlaybackInput) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const isLoopingRef = useRef(isLooping);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopOscillators();
    };
  }, []);

  function getAudioContext() {
    audioContextRef.current ??= new AudioContext();
    return audioContextRef.current;
  }

  function clearTimers() {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];
  }

  function stopOscillators() {
    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // already finished
      }
    });
    oscillatorsRef.current = [];
  }

  function playChord(chord: DiatonicChord) {
    playChordPreview({
      audioContext: getAudioContext(),
      chord,
      rootFloorKey,
      settings,
    });
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    startPlayback();
  }

  function startPlayback() {
    if (progression.length === 0) return;

    clearTimers();
    stopOscillators();
    setIsPlaying(true);

    if (settings.isMuted) {
      onMutedChange(false);
    }

    const audioContext = getAudioContext();
    const playbackSettings = { ...settings, isMuted: false };
    const chordDuration = getChordPlaybackDuration(playbackSettings);
    const cycleDuration = progression.length * chordDuration;

    function scheduleCycle(cycleStartTime: number) {
      progression.forEach((chord, index) => {
        const chordStartTime = cycleStartTime + index * chordDuration;
        oscillatorsRef.current.push(
          ...playChordPreview({
            audioContext,
            chord,
            rootFloorKey,
            settings: playbackSettings,
            startTime: chordStartTime,
          }),
        );

        timeoutsRef.current.push(
          window.setTimeout(
            () => {
              setPlayingIndex(index);
              onChordFocus(chord);
            },
            Math.max(0, (chordStartTime - audioContext.currentTime) * 1000),
          ),
        );
      });

      timeoutsRef.current.push(
        window.setTimeout(
          () => {
            setPlayingIndex(null);
            if (isLoopingRef.current) {
              scheduleCycle(audioContext.currentTime + 0.05);
              return;
            }
            setIsPlaying(false);
          },
          Math.max(0, (cycleStartTime + cycleDuration - audioContext.currentTime) * 1000),
        ),
      );
    }

    scheduleCycle(audioContext.currentTime + 0.05);
  }

  function stopPlayback() {
    clearTimers();
    stopOscillators();
    setIsPlaying(false);
    setPlayingIndex(null);
  }

  return {
    playingIndex,
    isPlaying,
    isLooping,
    setIsLooping,
    playChord,
    togglePlayback,
    stopPlayback,
  };
}
