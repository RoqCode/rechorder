"use client";

import {
  type ProgressionInput,
  progressionExportSchema,
  progressionInputSchema,
  type ProgressionExport,
  savedProgressionSchema,
  type SavedProgression,
  type UpdateProgressionInput,
  updateProgressionInputSchema,
  validateProgressionInput,
} from "./progression-schema";

const DB_NAME = "rechorder";
const DB_VERSION = 1;
const STORE_NAME = "progressions";

let dbPromise: Promise<IDBDatabase> | null = null;

export async function listSavedProgressions() {
  const db = await openDatabase();
  const rows = await requestToPromise<unknown[]>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(),
  );

  return rows
    .map((row) => savedProgressionSchema.parse(row))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function insertProgression(input: ProgressionInput) {
  const parsedInput = validateProgressionInput(
    progressionInputSchema.parse(input),
  );
  const now = new Date().toISOString();
  const progression = savedProgressionSchema.parse({
    id: crypto.randomUUID(),
    name: parsedInput.name,
    tonic: parsedInput.tonic,
    mode: parsedInput.mode,
    chordType: parsedInput.chordType,
    chords: parsedInput.chords,
    notes: parsedInput.notes || null,
    tempo: parsedInput.tempo,
    audioArt: parsedInput.audioArt,
    playbackStyle: parsedInput.playbackStyle,
    ambience: parsedInput.ambience,
    createdAt: now,
    updatedAt: now,
  });

  await putProgression(progression);

  return progression;
}

export async function updateSavedProgression(input: UpdateProgressionInput) {
  const parsedInput = validateProgressionInput(
    updateProgressionInputSchema.parse(input),
  );
  const existing = await getProgression(parsedInput.id);
  if (!existing) {
    throw new Error("Progression not found");
  }

  const progression = savedProgressionSchema.parse({
    ...existing,
    name: parsedInput.name,
    tonic: parsedInput.tonic,
    mode: parsedInput.mode,
    chordType: parsedInput.chordType,
    chords: parsedInput.chords,
    notes: parsedInput.notes || null,
    tempo: parsedInput.tempo,
    audioArt: parsedInput.audioArt,
    playbackStyle: parsedInput.playbackStyle,
    ambience: parsedInput.ambience,
    updatedAt: new Date().toISOString(),
  });

  await putProgression(progression);

  return progression;
}

export async function deleteSavedProgression(id: string) {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(id);
  await transactionDone(transaction);
}

export function createProgressionExport(
  progressions: SavedProgression[],
): ProgressionExport {
  return progressionExportSchema.parse({
    app: "rechorder",
    version: 1,
    exportedAt: new Date().toISOString(),
    progressions,
  });
}

export async function importSavedProgressions(
  exportData: ProgressionExport,
) {
  const parsedExport = progressionExportSchema.parse(exportData);
  const now = new Date().toISOString();
  const imported = parsedExport.progressions.map((progression) => {
    const parsedInput = validateProgressionInput(
      progressionInputSchema.parse({
        name: progression.name,
        tonic: progression.tonic,
        mode: progression.mode,
        chordType: progression.chordType,
        chords: progression.chords,
        notes: progression.notes ?? "",
        tempo: progression.tempo,
        audioArt: progression.audioArt,
        playbackStyle: progression.playbackStyle,
        ambience: progression.ambience,
      }),
    );

    return savedProgressionSchema.parse({
      id: crypto.randomUUID(),
      name: parsedInput.name,
      tonic: parsedInput.tonic,
      mode: parsedInput.mode,
      chordType: parsedInput.chordType,
      chords: parsedInput.chords,
      notes: parsedInput.notes || null,
      tempo: parsedInput.tempo,
      audioArt: parsedInput.audioArt,
      playbackStyle: parsedInput.playbackStyle,
      ambience: parsedInput.ambience,
      createdAt: now,
      updatedAt: now,
    });
  });

  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  imported.forEach((progression) => store.put(progression));
  await transactionDone(transaction);

  return imported.length;
}

export function parseProgressionExport(text: string) {
  return progressionExportSchema.parse(JSON.parse(text));
}

async function getProgression(id: string) {
  const db = await openDatabase();
  const row = await requestToPromise<unknown | undefined>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id),
  );

  return row ? savedProgressionSchema.parse(row) : null;
}

async function putProgression(progression: SavedProgression) {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put(savedProgressionSchema.parse(progression));
  await transactionDone(transaction);
}

function openDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      function rejectOpen(error: unknown) {
        dbPromise = null;
        reject(error);
      }

      if (!globalThis.indexedDB) {
        rejectOpen(new Error("IndexedDB is not available in this browser"));
        return;
      }

      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (error) {
        rejectOpen(error);
        return;
      }

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };

      request.onerror = () => rejectOpen(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}
