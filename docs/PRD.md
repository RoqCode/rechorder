# Rechorder PRD

## Overview

Rechorder is a local-network web app for playful chord exploration. It helps users find, inspect, arrange, and save good-sounding chord progressions without turning the experience into a dry music theory lesson.

The app focuses on piano-oriented visual exploration: users select a key, see the available diatonic chords, inspect their notes on a compact keyboard, build a progression, and save it to a shared local database.

## Product Positioning

Rechorder is a harmony sketchpad, not a music theory tutor.

The primary goal is fast, low-friction exploration. Learning happens passively through repeated exposure to keys, chord names, roman numerals, note names, and piano shapes.

## Goals

- Let users explore chords within a selected key and mode.
- Show each chord as roman numeral, chord name, note names, and piano keys.
- Let users audition individual chords and play back full progressions.
- Let users build a chord progression from available chords.
- Let users save and revisit progressions in a local library.
- Keep the interface minimal, tactile, and visually calm.

## Non-Goals

- No account system or user management.
- No cloud sync.
- No full music theory curriculum.
- No borrowed chords, secondary dominants, or modulation across keys.
- No MIDI input/output in the MVP.

## Target User

The initial user is a web developer and beginner musician who wants to explore harmony through piano shapes rather than notation-heavy theory.

The user knows little music theory, prefers English note names, and wants an app that feels exploratory instead of educationally rigid.

## Core User Flow

1. The user opens Rechorder in a browser on the local network.
2. The user selects a root and a mode, for example `C Ionian` or `D Dorian`.
3. The app displays the diatonic chords for that root + mode.
4. The user toggles between triads and seventh chords.
5. The user clicks a chord to preview it (audio + highlighted piano keys) and add it to the progression.
6. The user reorders or removes chords inside the progression via drag-and-drop or click-to-remove.
7. The user plays back the full progression, optionally looped, at a chosen tempo and instrument timbre.
8. The user opens the library sidebar, names the progression, and saves it.
9. The user can reopen, update, or delete saved progressions from the sidebar.

## MVP Scope

### Key Selection

The user picks a key by combining a root (pitch class) and a mode.

Supported modes are the seven diatonic modes: `ionian`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `aeolian`, `locrian`. `ionian` is the conventional major, `aeolian` is the conventional natural minor; the others give the user direct access to modal harmony without leaving the diatonic system.

Roots are selectable via a 12-marker pitch-class strip. The marker resolves to the most idiomatic spelling for the active mode — for example clicking the marker between `C` and `D` yields `C#` in `lydian` and `Db` in `phrygian`. Spellings that would force double sharps or double flats in the scale are not offered as roots for that mode.

The app uses English note names only, for example `C`, `C#`, `Db`, `Fb`, and `Bb`. German note naming is not used.

Enharmonic spelling follows the selected key. A key that correctly contains `Cb` is not silently displayed as `B`. Accidentals and chord qualities are rendered with proper glyphs (`♯`, `♭`, `°`) in the UI, while the underlying data uses ASCII (`#`, `b`, `dim`) for storage stability.

### Chord Browser

For the selected key and mode, the app shows the seven diatonic chords as a horizontal grid of identical tiles. Each tile shows:

- Step number (`01`–`07`) in the top-left corner.
- Roman numeral in the top-right corner, with mode-specific accidentals (e.g. `♭III` in dorian, `♯iv°` in lydian).
- Chord name as the visual hero, with the root letter dominant and the quality suffix rendered smaller.

Clicking a tile both previews the chord (audio + keyboard highlight) and appends it to the progression. The dominant chord (`V` in major-flavored modes) carries a default accent border as a subtle harmonic cue.

The user can toggle between triads and seventh chords. Seventh chords are an alternate display mode, not a separate progression system in the MVP. Seventh roman numerals are derived from the triad roman plus the chord quality (for example `V7`, `iiø7`, `Imaj7`).

### Piano Visualization

The piano is rendered as a schematic two-octave keyboard. The visible range is chosen once per selected key and chord type so that every diatonic chord in that key fits inside the keyboard with the same downward-to-upward ordering. The placement does not shift between individual chords inside the same key, making chord shapes easy to compare.

Chord tones are highlighted with the functional accent color:

- White keys fill from the bottom upward to roughly 55% of their height.
- Black keys fill from the bottom upward to roughly 50% of their height.
- The root of the chord fills fully and carries a small `R` marker, so the harmonic anchor is always visible at a glance.

The keyboard is intentionally flat and schematic — no perspective, no shadows, no skeumorphic textures — so it reads as a readout rather than a decorative illustration.

### Progression Builder

Clicking a chord tile appends it to the progression. Inside the progression area, each chord renders as a chip showing its step number, chord name, and roman numeral.

Chips support:

- Click to remove.
- HTML5 drag-and-drop to reorder.
- Keyboard shortcuts: `1`–`7` append the corresponding scale-degree chord, `Backspace` removes the last chord, `Esc` clears the current selection.

The primary interaction model is visual selection and keyboard, not free-text roman numeral input. Text input can be considered later.

Progressions are bound to the selected root and mode. A saved progression in `C Ionian` is treated as a `C Ionian` progression, not as a generic transposable template.

### Audio Playback

Users can audition both individual chords and full progressions through the browser's Web Audio API. No external audio assets are required.

Audio controls live in the page footer and expose:

- Sound on / mute toggle (the app starts muted so users are not surprised by sound on first load).
- Volume slider.
- Tempo input in BPM (range 60–180).
- Instrument timbre (`PIA` piano, `PAD` pad, `ARP` arpeggio, `STR` strings).

Footer transport buttons control progression playback:

- `▶ Play` / `■ Stop` toggles playback.
- `↻ Loop` keeps the progression cycling until stopped.
- `Clear progression` empties the current sequence.
- `Copy as text` writes a plain-text summary (key, chord names, roman numerals) to the clipboard.

While a progression is playing, the currently sounding chord is highlighted in the chip strip, in the chord grid, and on the piano keyboard.

### Progression Library

Users can save progressions to a central local database. The library lives in a collapsible right-edge sidebar — by default it stays tucked away as a thin vertical strip so it never crowds the sketchpad, and slides open when the user wants to save, load, or browse takes.

The sidebar contains:

- A save form (take name, optional notes, Save/Update + New buttons).
- A list of saved takes, each showing key + mode + chord type, name, a compact roman-numeral summary, optional notes preview, and Load / Delete actions.

Saved progressions contain:

- Name
- Root tonic
- Mode (one of the seven diatonic modes)
- Chord type, either `triads` or `sevenths`
- Ordered chord sequence
- Optional notes
- Created timestamp
- Updated timestamp

The library is a simple list in the MVP. Tags, favorites, search, filtering, and rating are out of scope for the initial version.

## Visual Direction

The app is composed like an editorial page about a single piece of musical equipment — not styled like a SaaS dashboard. It reads as a confident piece of technical equipment, with Swiss-poster precision: quiet but not shy.

Reference direction:

- Dieter Rams / Braun-era industrial restraint (e.g. ET66 calculator, Regie 308).
- Teenage Engineering instrument minimalism (TP-7, OP-1) — flat schematic controls, fine technical labels, functional color coding.
- Swiss typographic tradition (Müller-Brockmann, Hofmann) — active whitespace, asymmetric composition, dramatic scale contrast.

Typographic philosophy (the design's primary visual carrier):

- **Dramatic scale contrast.** Every zone has a single hero element rendered at display size (48–80px) and supporting elements rendered tiny (10–12px). Nothing lives in the middle.
- **Asymmetric composition.** Within each zone, content aligns left and lets whitespace breathe to the right. The composition is weighted to one side, never centered.
- **Information as display.** Each piece of data is rendered as if it were a readout on a hardware panel rather than decoration on a layout.

Layout is a top-to-bottom flow through four numbered zones, each separated by a 1px `#1A1A1A` rule:

1. **Selectors** — root and mode, each as a hero glyph plus its selector strip.
2. **Diatonic chords** — seven equal tiles.
3. **Keyboard** — a two-octave schematic piano with accent fills.
4. **Progression** — an inset chip strip.

A collapsible library sidebar lives at the right edge. Above the four zones is a top bar with the wordmark and meta readouts (version, tuning, current key). Below them is a footer with the audio controls and the transport actions.

Palette (pure neutral grayscale plus a single functional accent — no warm tones, no gradients, no drop shadows, no glassmorphism):

- Background `#F5F5F5`
- Surface `#FFFFFF`
- Inset surface (progression bed) `#E8E8E8`
- Deep surface (black keys) `#1A1A1A`
- Primary text `#0A0A0A`, secondary `#5C5C5C`, tertiary `#9A9A9A`
- Hairlines `#D4D4D4` at 0.5px; zone rules `#1A1A1A` at 1px
- Functional accent `#FF6A1F` with muted background `#FFEFE6`

Type pairing:

- Primary sans-serif: Inter (400, 500, 600).
- Monospace for readouts and labels: JetBrains Mono.

Product language:

- `take` (a saved progression)
- `sequence` (the live progression being built)
- `library` (the sidebar holding all takes)

The UI is desktop-first but responsive down to phone widths.

## Technical Direction

### Stack

- Framework: Next.js
- Database: PostgreSQL
- ORM: Drizzle
- Deployment target: local network hosting
- Runtime packaging: Docker Compose for app and database

PostgreSQL is preferred over SQLite because the app is intended to be used from multiple devices on the local network. A server-side database avoids browser-local data silos and handles concurrent access more predictably.

### Architecture

The app should use a server-backed persistence model.

The browser is only the client. Saved progressions live in the central database, so multiple devices can access the same library.

The first version does not need authentication if it is hosted only inside a trusted local network.

## Data Model Draft

### Progression

```ts
type Progression = {
  id: string
  name: string
  tonic: string
  mode:
    | 'ionian'
    | 'dorian'
    | 'phrygian'
    | 'lydian'
    | 'mixolydian'
    | 'aeolian'
    | 'locrian'
  chordType: 'triads' | 'sevenths'
  chords: ProgressionChord[]
  notes: string | null
  createdAt: string
  updatedAt: string
}
```

Legacy progressions stored under the previous two-mode model are migrated automatically: `major → ionian`, `natural_minor → aeolian`. The migration lives in `drizzle/0001_expand_mode_enum.sql`.

### ProgressionChord

```ts
type ProgressionChord = {
  degree: number
  romanNumeral: string
  chordName: string
  notes: string[]
}
```

The stored chord sequence may duplicate derived data such as `chordName` and `notes` for simplicity and historical stability. If the chord engine changes later, old saved progressions should still display as originally saved unless an explicit migration is introduced.

## Open Questions

- Should saved progressions allow duplicate names?
- Should a progression be editable in place, or should editing create a new version/take?
- Should deletion be permanent in the MVP?
- Should the app expose import/export early to avoid local database lock-in?

## Future Ideas

- Inversions and voicings.
- MIDI input or output.
- Progression tags and favorites.
- Search and filtering in the library.
- Transpose saved progressions into other keys (or modes).
- Borrowed chords and modal mixture across modes.
- Secondary dominants.
- Additional non-diatonic scales (harmonic minor, melodic minor, bebop, blues).
- Per-take instrument timbre stored with the progression.
- Lightweight explanations for common harmonic movements.
