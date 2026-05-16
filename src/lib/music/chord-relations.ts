import { getPitchClass, type DiatonicChord, type MusicMode } from "./chords";

export const CHORD_RELATION_LABELS = [
  "home",
  "strong pull",
  "soft return",
  "keeps moving",
  "smooth",
] as const;

export type ChordRelationLabel = (typeof CHORD_RELATION_LABELS)[number];

export type ChordRelation = {
  sourceDegree: number;
  targetDegree: number;
  label: ChordRelationLabel;
  description: string;
  score: number;
  sharedToneCount: number;
};

type GetChordRelationsInput = {
  source: DiatonicChord | null;
  candidates: DiatonicChord[];
  mode: MusicMode;
};

const MINOR_TONIC_MODES = new Set<MusicMode>([
  "dorian",
  "phrygian",
  "aeolian",
  "locrian",
]);

const LABEL_DESCRIPTIONS: Record<ChordRelationLabel, string> = {
  home: "Lands on the key center.",
  "strong pull": "Creates the clearest pull toward the next chord.",
  "soft return": "Returns home without the hard dominant edge.",
  "keeps moving": "Sets up forward motion instead of settling.",
  smooth: "Shares chord tones for an easy voice-led move.",
};

export function getChordRelations({
  source,
  candidates,
  mode,
}: GetChordRelationsInput) {
  const relations = new Map<number, ChordRelation>();
  if (!source) return relations;

  candidates.forEach((target) => {
    if (target.degree === source.degree) return;

    const relation = getBestRelation(source, target, mode);
    if (relation) relations.set(target.degree, relation);
  });

  return relations;
}

export function getTopChordRelations(
  relations: Map<number, ChordRelation>,
  limit = 3,
) {
  return [...relations.values()]
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return first.targetDegree - second.targetDegree;
    })
    .slice(0, limit);
}

function getBestRelation(
  source: DiatonicChord,
  target: DiatonicChord,
  mode: MusicMode,
) {
  const sharedToneCount = countSharedPitchClasses(source.notes, target.notes);
  const candidates: ChordRelation[] = [];

  if (target.degree === 1) {
    candidates.push(createRelation(source, target, "home", 68, sharedToneCount));
  }

  if (isStrongPull(source, target, mode)) {
    candidates.push(
      createRelation(source, target, "strong pull", 100, sharedToneCount),
    );
  }

  if (source.degree === 4 && target.degree === 1) {
    candidates.push(
      createRelation(source, target, "soft return", 86, sharedToneCount),
    );
  }

  if (isPredominantMove(source, target)) {
    candidates.push(
      createRelation(source, target, "keeps moving", 74, sharedToneCount),
    );
  }

  if (sharedToneCount >= getSmoothSharedToneThreshold(source)) {
    candidates.push(
      createRelation(
        source,
        target,
        "smooth",
        56 + sharedToneCount * 4,
        sharedToneCount,
      ),
    );
  }

  return candidates.sort((first, second) => second.score - first.score)[0] ?? null;
}

function isStrongPull(
  source: DiatonicChord,
  target: DiatonicChord,
  mode: MusicMode,
) {
  if (target.degree !== 1) return false;
  if (source.degree === 7) return true;

  // Major-flavored modes have the clearest V-to-I dominant pull. In minor modes,
  // the diatonic v is useful but weaker, so it falls back to the generic home tag.
  return source.degree === 5 && !MINOR_TONIC_MODES.has(mode);
}

function isPredominantMove(source: DiatonicChord, target: DiatonicChord) {
  return (
    (source.degree === 2 && target.degree === 5) ||
    (source.degree === 4 && target.degree === 5) ||
    (source.degree === 6 && target.degree === 2)
  );
}

function getSmoothSharedToneThreshold(chord: DiatonicChord) {
  return chord.notes.length >= 4 ? 2 : 1;
}

function countSharedPitchClasses(first: string[], second: string[]) {
  const firstPitchClasses = new Set(first.map(getPitchClass));
  return second.filter((note) => firstPitchClasses.has(getPitchClass(note))).length;
}

function createRelation(
  source: DiatonicChord,
  target: DiatonicChord,
  label: ChordRelationLabel,
  score: number,
  sharedToneCount: number,
): ChordRelation {
  return {
    sourceDegree: source.degree,
    targetDegree: target.degree,
    label,
    description: LABEL_DESCRIPTIONS[label],
    score,
    sharedToneCount,
  };
}
