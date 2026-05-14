"use client";

import { formatNote, MODE_DESCRIPTORS } from "@/lib/music/chords";
import { CHORD_TYPE_LABELS } from "./chord-type-labels";
import type { SavedProgression } from "./progression-actions";

type LibrarySidebarProps = {
  library: SavedProgression[];
  isOpen: boolean;
  onToggle: () => void;

  // Save form state (lifted to parent so we can react to loaded progressions)
  name: string;
  notes: string;
  loadedProgressionId: string | null;
  canSave: boolean;
  isPending: boolean;
  statusMessage: string;
  onNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onNewTake: () => void;

  // Library actions
  deleteConfirmationId: string | null;
  onLoad: (progression: SavedProgression) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDelete: (id: string) => void;
};

export function LibrarySidebar({
  library,
  isOpen,
  onToggle,
  name,
  notes,
  loadedProgressionId,
  canSave,
  isPending,
  statusMessage,
  onNameChange,
  onNotesChange,
  onSave,
  onNewTake,
  deleteConfirmationId,
  onLoad,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}: LibrarySidebarProps) {
  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-40 border-r border-[var(--rule)] bg-[var(--bg)] transition-[width] duration-[var(--t)]"
      style={{ width: isOpen ? "min(340px, 100vw)" : "32px" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse library" : "Expand library"}
        className="absolute left-0 top-0 z-10 flex h-full w-[32px] cursor-pointer items-start justify-center pt-7 transition-colors duration-[var(--t)] hover:bg-[var(--inset)]"
      >
        {isOpen ? (
          <span className="font-mono text-[14px] leading-none text-[var(--text-3)]">◂</span>
        ) : (
          <CollapsedLabel count={library.length} />
        )}
      </button>

      {isOpen ? (
        <div
          className="ml-[32px] flex h-full flex-col gap-6 overflow-y-auto px-5 pb-10 pt-7"
          style={{ width: "calc(min(340px, 100vw) - 32px)" }}
        >
          {/* HEAD */}
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
              Library
            </span>
            <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
              {library.length} {library.length === 1 ? "Take" : "Takes"}
            </span>
          </div>

          {/* SAVE FORM */}
          <div className="grid gap-2 border-b border-[var(--hair)] pb-6">
            <input
              aria-label="Take name"
              className="h-9 border-[0.5px] border-[var(--hair)] bg-[var(--surface)] px-2 font-mono text-[11px] tracking-[0.04em] text-[var(--text)] outline-none placeholder:text-[var(--text-3)] focus:border-[var(--text-2)]"
              style={{ borderRadius: "var(--radius)" }}
              value={name}
              placeholder="Take name"
              onChange={(event) => onNameChange(event.target.value)}
            />
            <textarea
              aria-label="Notes"
              className="min-h-[60px] resize-none border-[0.5px] border-[var(--hair)] bg-[var(--surface)] px-2 py-2 font-mono text-[11px] leading-[1.45] tracking-[0.04em] text-[var(--text)] outline-none placeholder:text-[var(--text-3)] focus:border-[var(--text-2)]"
              style={{ borderRadius: "var(--radius)" }}
              value={notes}
              placeholder="Notes"
              onChange={(event) => onNotesChange(event.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canSave || isPending}
                onClick={onSave}
                className="h-9 flex-1 cursor-pointer border-[0.5px] border-[var(--text)] bg-[var(--text)] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--surface)] transition duration-[var(--t)] hover:bg-[var(--accent)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:border-[var(--hair)] disabled:bg-transparent disabled:text-[var(--text-3)]"
                style={{ borderRadius: "var(--radius)" }}
              >
                {loadedProgressionId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={onNewTake}
                className="h-9 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--text-2)] hover:text-[var(--text)]"
                style={{ borderRadius: "var(--radius)" }}
              >
                New
              </button>
            </div>
            {statusMessage ? (
              <p role="status" className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
                {statusMessage}
              </p>
            ) : null}
          </div>

          {/* LIST */}
          <div className="grid gap-3">
            {library.length === 0 ? (
              <div className="border-[0.5px] border-dashed border-[var(--hair)] px-3 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                — No takes yet —
              </div>
            ) : (
              library.map((take) => (
                <TakeRow
                  key={take.id}
                  take={take}
                  isLoaded={take.id === loadedProgressionId}
                  isConfirmingDelete={deleteConfirmationId === take.id}
                  isPending={isPending}
                  onLoad={() => onLoad(take)}
                  onRequestDelete={() => onRequestDelete(take.id)}
                  onCancelDelete={onCancelDelete}
                  onDelete={() => onDelete(take.id)}
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function CollapsedLabel({ count }: { count: number }) {
  return (
    <span
      className="origin-center whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)]"
      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
    >
      Library · {count} {count === 1 ? "Take" : "Takes"}
    </span>
  );
}

type TakeRowProps = {
  take: SavedProgression;
  isLoaded: boolean;
  isConfirmingDelete: boolean;
  isPending: boolean;
  onLoad: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
};

function TakeRow({
  take,
  isLoaded,
  isConfirmingDelete,
  isPending,
  onLoad,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}: TakeRowProps) {
  const mode = MODE_DESCRIPTORS[take.mode];
  const tonicGlyph = formatNote(take.tonic);

  return (
    <div
      className={`relative border-[0.5px] p-3 transition duration-[var(--t)] ${
        isLoaded
          ? "border-[var(--accent)] bg-[var(--accent-bg)]"
          : "border-[var(--hair)] bg-[var(--surface)]"
      }`}
      style={{ borderRadius: "var(--radius)" }}
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
        {tonicGlyph} {mode.label} · {CHORD_TYPE_LABELS[take.chordType]}
      </div>
      <div className="text-[22px] font-medium leading-[1.05] tracking-[-0.015em] text-[var(--text)]">
        {take.name}
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-[0.08em] text-[var(--text-3)]">
        {take.chords.map((chord) => chord.romanNumeral).join(" · ")}
      </div>
      {take.notes ? (
        <p className="mt-2 line-clamp-3 font-mono text-[10px] leading-[1.45] tracking-[0.02em] text-[var(--text-2)]">
          {take.notes}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onLoad}
          className="h-7 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--text)] hover:text-[var(--text)]"
          style={{ borderRadius: "var(--radius)" }}
        >
          Load
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          aria-expanded={isConfirmingDelete}
          className="h-7 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--text)] hover:text-[var(--text)]"
          style={{ borderRadius: "var(--radius)" }}
        >
          Delete
        </button>
      </div>
      {isConfirmingDelete ? (
        <div
          className="absolute right-2 top-12 z-10 w-[220px] border-[0.5px] border-[var(--text)] bg-[var(--surface)] p-3"
          style={{ borderRadius: "var(--radius)" }}
        >
          <p className="font-mono text-[10px] uppercase leading-[1.4] tracking-[0.10em] text-[var(--text-2)]">
            Delete this take permanently?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              className="h-7 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.10em] hover:border-[var(--text)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onDelete}
              className="h-7 cursor-pointer border-[0.5px] border-[var(--accent)] bg-[var(--accent)] px-2 font-mono text-[10px] uppercase tracking-[0.10em] text-white transition duration-[var(--t)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderRadius: "var(--radius)" }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
