import type { DiatonicChord } from "./chords";

export type ProgressionTemplate = {
  id: string;
  name: string;
  description: string;
  degrees: number[];
};

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    id: "axis",
    name: "Axis",
    description: "Balanced four-chord loop",
    degrees: [1, 5, 6, 4],
  },
  {
    id: "cadence",
    name: "Cadence",
    description: "Classic pull back home",
    degrees: [2, 5, 1],
  },
  {
    id: "modal-drift",
    name: "Modal Drift",
    description: "Rooted, open, less resolved",
    degrees: [1, 7, 4, 1],
  },
  {
    id: "minor-fall",
    name: "Minor Fall",
    description: "Descending cinematic shape",
    degrees: [1, 6, 3, 7],
  },
  {
    id: "plagal",
    name: "Plagal",
    description: "Soft IV to I return",
    degrees: [1, 4, 1, 5],
  },
];

export function applyProgressionTemplate(template: ProgressionTemplate, chords: DiatonicChord[]) {
  return template.degrees.map((degree) => {
    const chord = chords.find((candidate) => candidate.degree === degree);

    if (!chord) {
      throw new Error(`Template degree ${degree} is not available`);
    }

    return { ...chord, inversion: 0 } satisfies DiatonicChord;
  });
}
