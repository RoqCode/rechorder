import type { ChordType, MusicMode } from "@/lib/music/chords";
import type { SavedProgression } from "./progression-actions";

const MODE_LABELS: Record<MusicMode, string> = {
  major: "Major",
  natural_minor: "Nat. Minor",
};

const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  triads: "Triads",
  sevenths: "Sevenths",
};

type ProgressionLibraryProps = {
  library: SavedProgression[];
  deleteConfirmationId: string | null;
  isPending: boolean;
  onLoad: (savedProgression: SavedProgression) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDelete: (id: string) => void;
};

export function ProgressionLibrary({
  library,
  deleteConfirmationId,
  isPending,
  onLoad,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}: ProgressionLibraryProps) {
  return (
    <div className="border-2 border-[#171512] bg-[#fffaf0] p-3 text-[#171512]">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
        <span>Library</span>
        <span>{library.length} takes</span>
      </div>
      <div className="grid gap-2">
        {library.length === 0 ? (
          <div className="border-2 border-dashed border-[#171512] px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f675b]">
            No saved takes yet
          </div>
        ) : (
          library.map((savedProgression) => {
            const isConfirmingDelete = deleteConfirmationId === savedProgression.id;

            return (
              <div className="relative border-2 border-[#171512] p-2" key={savedProgression.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <strong className="block text-lg leading-none tracking-[-0.06em]">{savedProgression.name}</strong>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">
                      {savedProgression.tonic} {MODE_LABELS[savedProgression.mode]} | {CHORD_TYPE_LABELS[savedProgression.chordType]}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] hover:bg-[#171512] hover:text-[#fffaf0]"
                      type="button"
                      onClick={() => onLoad(savedProgression)}
                    >
                      Load
                    </button>
                    <button
                      className="border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] hover:bg-[#171512] hover:text-[#fffaf0]"
                      type="button"
                      aria-expanded={isConfirmingDelete}
                      onClick={() => onRequestDelete(savedProgression.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {isConfirmingDelete ? (
                  <div className="absolute top-10 right-2 z-10 w-52 border-2 border-[#171512] bg-[#fffaf0] p-2 shadow-[3px_3px_0_#171512]">
                    <p className="font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-[#6f675b]">Delete this take permanently?</p>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button
                        className="border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] hover:bg-white"
                        type="button"
                        onClick={onCancelDelete}
                      >
                        Cancel
                      </button>
                      <button
                        className="border-2 border-[#171512] bg-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#fffaf0] hover:bg-[#f05a28] hover:text-[#171512] disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        disabled={isPending}
                        onClick={() => onDelete(savedProgression.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] tracking-[0.1em] text-[#6f675b]">
                  <span>{savedProgression.chords.map((chord) => chord.romanNumeral).join(" - ")}</span>
                  <span>{savedProgression.chords.map((chord) => chord.chordName).join(" - ")}</span>
                </div>
                {savedProgression.notes ? <p className="mt-2 text-xs leading-5 text-[#6f675b]">{savedProgression.notes}</p> : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
