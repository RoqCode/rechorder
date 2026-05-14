"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { formatNote, MODE_DESCRIPTORS } from "@/lib/music/chords";
import type { SavedProgression } from "@/lib/progressions/progression-schema";
import { CHORD_TYPE_LABELS } from "./chord-type-labels";

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
  onExport: () => void;
  onImport: (file: File) => void;
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
  onExport,
  onImport,
}: LibrarySidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isMobileDrawer, setIsMobileDrawer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const updateIsMobileDrawer = () => setIsMobileDrawer(query.matches);

    updateIsMobileDrawer();
    query.addEventListener("change", updateIsMobileDrawer);
    return () => query.removeEventListener("change", updateIsMobileDrawer);
  }, []);

  useEffect(() => {
    if (isOpen && isMobileDrawer) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      sidebarRef.current?.focus();
    } else if (!isOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen, isMobileDrawer]);

  function handleSidebarKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onToggle();
      return;
    }

    if (event.key !== "Tab" || !isMobileDrawer) return;

    const candidates = sidebarRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const focusable = Array.from(candidates ?? []).filter(isFocusable);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close library"
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-[rgba(0,0,0,0.22)] sm:hidden"
        />
      ) : null}
      <aside
        ref={sidebarRef}
        role={isOpen && isMobileDrawer ? "dialog" : "complementary"}
        aria-label="Progression library"
        aria-modal={isOpen && isMobileDrawer ? true : undefined}
        tabIndex={isOpen && isMobileDrawer ? -1 : undefined}
        onKeyDown={isOpen ? handleSidebarKeyDown : undefined}
        className={`fixed z-40 border-[var(--rule)] bg-[var(--bg)] transition-[bottom,width] duration-[var(--t)] max-sm:left-3 max-sm:right-3 max-sm:border sm:bottom-0 sm:left-0 sm:top-0 sm:border-r ${
          isOpen ? "max-sm:bottom-3 max-sm:top-3" : "max-sm:bottom-3 max-sm:h-12"
        }`}
        style={{ width: isOpen ? "min(340px, calc(100vw - 24px))" : "32px" }}
      >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse library" : "Expand library"}
        className={`absolute left-0 top-0 z-10 flex w-[32px] cursor-pointer items-start justify-center transition-colors duration-[var(--t)] hover:bg-[var(--inset)] ${
          isOpen ? "h-full pt-7" : "h-12 pt-3 sm:h-full sm:pt-7"
        }`}
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
          style={{ width: "calc(min(340px, calc(100vw - 24px)) - 32px)" }}
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

          {/* PORTABILITY */}
          <div className="grid gap-2 border-b border-[var(--hair)] pb-6">
            <div className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
              Portability
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={library.length === 0 || isPending}
                onClick={onExport}
                className="h-8 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--text)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-3)]"
                style={{ borderRadius: "var(--radius)" }}
              >
                Export
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => importInputRef.current?.click()}
                className="h-8 cursor-pointer border-[0.5px] border-[var(--hair)] bg-transparent px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)] transition duration-[var(--t)] hover:border-[var(--text)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-3)]"
                style={{ borderRadius: "var(--radius)" }}
              >
                Import
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.currentTarget.value = "";
              }}
            />
            <p className="font-mono text-[10px] leading-[1.45] tracking-[0.02em] text-[var(--text-3)]">
              Local browser data. Export JSON for backup or manual sync.
            </p>
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
    </>
  );
}

function isFocusable(element: HTMLElement) {
  return element.offsetParent !== null && element.tabIndex >= 0;
}

function CollapsedLabel({ count }: { count: number }) {
  return (
    <>
      <span
        className="origin-center whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-3)] max-sm:hidden"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Library · {count} {count === 1 ? "Take" : "Takes"}
      </span>
      <span className="font-mono text-[13px] leading-none text-[var(--text-3)] sm:hidden">▸</span>
    </>
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
