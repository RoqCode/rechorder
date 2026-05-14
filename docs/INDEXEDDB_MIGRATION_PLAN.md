# IndexedDB Migration Plan

Status: implemented as the primary persistence path.

## Goal

Move Rechorder from server-backed PostgreSQL persistence to browser-local IndexedDB persistence with JSON import/export.

The app should become easy to publish as a public web app without accounts, auth, database hosting, or server-side mutation endpoints. Saved takes live in the user's browser. Import/export becomes the backup and manual sync mechanism.

## Decision

Use IndexedDB if Rechorder is primarily a single-user sketchpad and automatic cross-device sync is not required.

Keep PostgreSQL only if multiple devices must share the same live library without manual import/export.

For the current product direction, IndexedDB is the better fit: it removes the biggest hosting/security surface while preserving the core sketchpad experience.

## Current Useful Boundaries

- `src/lib/progressions/progression-schema.ts` already contains reusable Progression schemas and validation.
- `src/lib/progressions/progression-repository.ts` is the IndexedDB repository.
- `src/app/use-progression-library.ts` is the client integration point for list/save/update/delete/import/export.

## Phase 1: Define Browser Persistence API

Create a client-only repository with the same conceptual operations as the current server-backed repository:

```ts
listSavedProgressions(): Promise<SavedProgression[]>
insertProgression(input: ProgressionInput): Promise<SavedProgression>
updateSavedProgression(input: UpdateProgressionInput): Promise<SavedProgression>
deleteSavedProgression(id: string): Promise<void>
```

Keep the existing `SavedProgression`, `ProgressionInput`, `UpdateProgressionInput`, and validation schemas from `src/lib/progressions/progression-schema.ts`.

Done when the IndexedDB repository can be tested independently without React or Next Server Actions.

## Phase 2: Implement IndexedDB Storage

Add a small IndexedDB wrapper, preferably without a heavy abstraction unless needed. A single database is enough:

- Database: `rechorder`
- Version: `1`
- Object store: `progressions`
- Key path: `id`
- Index: `createdAt`

Store `SavedProgression` objects directly after schema validation. Generate ids with `crypto.randomUUID()` and timestamps with `new Date().toISOString()`.

Done when list/create/update/delete work in browser tests or through a local manual UI flow.

## Phase 3: Switch Library Hook To Client Persistence

Update `src/app/use-progression-library.ts` so it imports the IndexedDB repository instead of `src/app/progression-actions.ts`.

Remove the Server Action dependency from the client library flow. Keep user-facing behavior unchanged:

- Load library on mount.
- Save creates a new take when no id is loaded.
- Save updates the loaded take when an id exists.
- Delete removes a take after confirmation.
- Status messages stay simple: `Saved`, `Updated`, `Deleted`, load/save errors.

Done when the existing Library sidebar works without a running database.

## Phase 4: Add Export

Add an export action in the Library sidebar.

Export format should be versioned from the start:

```ts
type RechorderExport = {
  app: "rechorder";
  version: 1;
  exportedAt: string;
  progressions: SavedProgression[];
};
```

The exported file should be a readable JSON file, for example `rechorder-export-2026-05-14.json`.

Done when a user can download all saved takes and the JSON validates against the export schema.

## Phase 5: Add Import

Add an import action in the Library sidebar.

Recommended first conflict strategy: import all takes as new local takes with fresh ids. This avoids surprising overwrites and keeps the implementation simple.

Import rules:

- Validate the outer export shape.
- Validate each `SavedProgression`.
- Assign new ids and fresh timestamps on import.
- Keep imported `name`, `tonic`, `mode`, `chordType`, `chords`, and `notes`.
- Show how many takes were imported.

Done when an exported file can be imported into a clean browser profile and all takes appear in the library.

## Phase 6: Remove Server Persistence

After IndexedDB import/export is stable, remove unused server persistence pieces:

- `src/app/progression-actions.ts`
- `src/lib/progressions/progression-repository.ts` if it remains Postgres-specific
- `src/db/*`
- `drizzle/*`
- Drizzle/Postgres dependencies and scripts from `package.json`
- Postgres service from `docker-compose.yml`
- `DATABASE_URL` docs and `.env.example` usage if no longer needed

Keep `src/lib/progressions/progression-schema.ts`; it remains the canonical data contract.

Done when `npm run ci` passes without a database and the README no longer instructs users to start Postgres.

## Phase 7: Publish-Friendly Cleanup

Update docs and deployment assumptions:

- README setup should no longer require Docker or `.env` for normal use.
- PRD technical direction should mention browser-local persistence.
- Add a short warning that browser data can be cleared by the user/browser and exports are the backup mechanism.
- Verify production build on the intended host.

Done when the app can be deployed as a public web app with no auth and no database.

## Testing Checklist

- Fresh browser: app starts with empty library.
- Create, update, load, and delete a take.
- Reload page: takes persist.
- Export all takes.
- Clear site data or use another browser profile.
- Import export file.
- Imported takes load and play correctly.
- Invalid import file shows a clear error and does not partially corrupt the library.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.

## Risks

- IndexedDB is per browser/profile/device, so there is no automatic sync.
- Browser/site-data cleanup can delete the local library.
- Private browsing modes may not persist data reliably.
- Import/export UX must be easy enough that backups actually happen.

## Estimated Effort

Minimal migration: 0.5-1 day.

Polished migration with import/export UX, docs, cleanup, and regression testing: 1.5-2 days.
