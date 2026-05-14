import { parseChordDisplay, parseNoteDisplay } from "@/lib/music/chords";

type ChordDisplayProps = {
  chordName: string;
  /** Pixel font-size of the chord letter. Accidental and quality scale relative to it. */
  size: number;
  /** Weight of the letter glyph. Accidental sits one step lighter,
   *  quality two steps lighter — preserves the original hierarchy. */
  weight?: number;
  className?: string;
};

/** Renders a chord name like "F#m7" with the design's signature scale shift:
 *  the letter sits at full size, accidentals at ~70%, qualities at ~44%. */
export function ChordDisplay({
  chordName,
  size,
  weight = 500,
  className,
}: ChordDisplayProps) {
  const { letter, accidental, quality } = parseChordDisplay(chordName);
  const accidentalSize = Math.round(size * 0.7);
  const accidentalOffset = Math.round(size * 0.075);
  const qualitySize = Math.max(11, Math.round(size * 0.44));
  const qualityOffset = Math.round(size * 0.04);
  const accidentalWeight = Math.max(400, weight - 100);
  const qualityWeight = Math.max(400, weight - 200);

  return (
    <span
      className={`inline-flex items-baseline leading-[0.95] ${className ?? ""}`}
    >
      <span style={{ fontSize: `${size}px`, fontWeight: weight, letterSpacing: "-0.015em" }}>
        {letter}
      </span>
      {accidental ? (
        <span
          aria-hidden="true"
          style={{
            fontSize: `${accidentalSize}px`,
            fontWeight: accidentalWeight,
            transform: `translateY(-${accidentalOffset}px)`,
            marginLeft: "-1px",
          }}
        >
          {accidental}
        </span>
      ) : null}
      {quality ? (
        <span
          style={{
            fontSize: `${qualitySize}px`,
            fontWeight: qualityWeight,
            marginLeft: `${qualityOffset}px`,
            color: "var(--text-2)",
            letterSpacing: 0,
          }}
        >
          {quality}
        </span>
      ) : null}
    </span>
  );
}

type NoteDisplayProps = {
  note: string;
  size: number;
  weight?: number;
  className?: string;
};

/** Renders a bare note glyph like "F#" — used for the root hero. */
export function NoteDisplay({
  note,
  size,
  weight = 600,
  className,
}: NoteDisplayProps) {
  const { letter, accidental } = parseNoteDisplay(note);
  const accidentalSize = Math.round(size * 0.7);
  const accidentalOffset = Math.round(size * 0.075);

  return (
    <span
      className={`inline-flex items-baseline leading-[0.95] ${className ?? ""}`}
      style={{ fontWeight: weight }}
    >
      <span style={{ fontSize: `${size}px`, letterSpacing: "-0.02em" }}>
        {letter}
      </span>
      {accidental ? (
        <span
          aria-hidden="true"
          style={{
            fontSize: `${accidentalSize}px`,
            fontWeight: 500,
            transform: `translateY(-${accidentalOffset}px)`,
            marginLeft: "-2px",
          }}
        >
          {accidental}
        </span>
      ) : null}
    </span>
  );
}
