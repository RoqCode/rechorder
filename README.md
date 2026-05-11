# Rechorder

Rechorder is a local harmony sketchpad for exploring piano-focused chord progressions.

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run db:generate` creates Drizzle migrations from `src/db/schema.ts`.
- `npm run db:migrate` applies migrations to the configured database.
- `npm run db:studio` opens Drizzle Studio.
