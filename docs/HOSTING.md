# Hosting

Rechorder is exported as a static site. There is no server runtime, database, auth layer, or environment variable required for normal use.

## Build

```bash
npm ci
npm run ci
```

The static site is written to `out/`.

## Provider Settings

Use these settings on static hosts such as Netlify, Cloudflare Pages, Vercel static output, GitHub Pages, or any plain web server:

- Build command: `npm run build`
- Output directory: `out`
- Node version: 20.9.0 or newer
- Environment variables: none

## Requirements

Serve the app over HTTPS in production. Clipboard export/copy flows are browser APIs and are most reliable in secure contexts.

IndexedDB data is local to the current browser profile. Users should export their library JSON if they want backups or manual sync between devices.

## Subpath Hosting

Prefer hosting at a domain root, for example `https://rechorder.example.com/`.

If hosting under a subpath, for example `https://example.com/rechorder/`, configure `basePath` and `assetPrefix` in `next.config.ts` before building.

## Smoke Test

After deploy:

- Open the app on the production URL.
- Create and save a take.
- Reload the page and confirm the take is still listed.
- Export the library JSON.
- Import the JSON in another browser profile and load the take.
