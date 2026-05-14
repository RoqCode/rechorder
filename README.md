# Rechorder

Rechorder is a local harmony sketchpad for exploring piano-focused chord progressions.

Saved takes are stored in the browser with IndexedDB. Use the library export action to back up or manually sync takes between browsers/devices.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Hosting

Run `npm run build` and deploy the generated `out/` directory to any static host. See `docs/HOSTING.md` for provider settings and smoke tests.

## Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a static production export in `out/`.
- `npm run preview` serves the static export locally.
- `npm run start` serves the static export locally.
- `npm run lint` runs ESLint.
- `npm run typecheck` checks TypeScript types.
- `npm run test` runs the Vitest suite.
- `npm run ci` runs lint, typecheck, tests, and build.
