# Rechorder PRD

## Overview

Rechorder is a local-network web app for playful chord exploration. It helps users find, inspect, arrange, and save good-sounding chord progressions without turning the experience into a dry music theory lesson.

The app focuses on piano-oriented visual exploration: users select a key, see the available diatonic chords, inspect their notes on a compact keyboard, build a progression, and save it to a shared local database.

## Product Positioning

Rechorder is a harmony sketchpad, not a music theory tutor.

The primary goal is fast, low-friction exploration. Learning happens passively through repeated exposure to keys, chord names, roman numerals, note names, and piano shapes.

## Goals

- Let users explore chords within a selected key.
- Show each chord as roman numeral, chord name, note names, and piano keys.
- Let users build a chord progression from available chords.
- Let users save and revisit progressions in a local library.
- Keep the interface minimal, tactile, and visually calm.

## Non-Goals

- No audio playback in the MVP.
- No account system or user management.
- No cloud sync.
- No full music theory curriculum.
- No advanced harmony features such as borrowed chords, modes, secondary dominants, or modulation.
- No MIDI input/output in the MVP.

## Target User

The initial user is a web developer and beginner musician who wants to explore harmony through piano shapes rather than notation-heavy theory.

The user knows little music theory, prefers English note names, and wants an app that feels exploratory instead of educationally rigid.

## Core User Flow

1. The user opens Rechorder in a browser on the local network.
2. The user selects a key and mode, for example `C major` or `A natural minor`.
3. The app displays the diatonic chords for that key.
4. The user toggles between triads and seventh chords.
5. The user inspects chords through roman numerals, chord names, note names, and highlighted piano keys.
6. The user clicks or drags chords into a progression sequence.
7. The user names the progression and saves it.
8. The user can reopen saved progressions from a simple library list.

## MVP Scope

### Key Selection

Users can select a key from supported major and natural minor keys.

The app uses English note names only, for example `C`, `C#`, `Db`, `Fb`, and `Bb`. German note naming is not used.

Enharmonic spelling should follow the selected key where feasible. For example, a key that correctly contains `Cb` should not silently display that note as `B`.

### Chord Browser

For the selected key, the app shows diatonic chords.

For major keys, the triad qualities are:

- `I` major
- `ii` minor
- `iii` minor
- `IV` major
- `V` major
- `vi` minor
- `vii°` diminished

For natural minor keys, the triad qualities are:

- `i` minor
- `ii°` diminished
- `III` major
- `iv` minor
- `v` minor
- `VI` major
- `VII` major

Users can toggle seventh chords. Seventh chords are an alternate display mode, not a separate progression system in the MVP.

Each chord card displays:

- Roman numeral, for example `IV`.
- Chord name, for example `F major` or `Fmaj7`.
- Note names, for example `F A C`.
- Piano visualization.

### Piano Visualization

The piano visualization uses a fixed keyboard range from `C3` through `C5`, plus the final `C` key at the end if represented as a 25-key layout.

This is intentionally fixed instead of starting each chord view at the chord root. A fixed range makes chord shapes easier to compare because the keyboard does not shift between chords.

Chord tones are highlighted on the keyboard. In the MVP, one octave placement is enough per chord tone, but the keyboard itself spans two octaves so chords near octave boundaries remain visually stable.

### Progression Builder

Users build a progression by clicking or dragging chords from the chord browser into a sequence area.

The progression displays both:

- Roman numeral sequence, for example `I - V - vi - IV`.
- Concrete chord sequence in the selected key, for example `C - G - Am - F`.

The primary interaction model is visual selection, not free-text roman numeral input. Text input can be considered later.

Progressions are bound to the selected key. A saved progression in `C major` is treated as a `C major` progression, not as a generic transposable template.

### Progression Library

Users can save progressions to a central local database.

Saved progressions contain:

- Name
- Key tonic
- Mode, either `major` or `natural_minor`
- Chord type mode, either `triads` or `sevenths`
- Ordered chord sequence
- Optional notes
- Created timestamp
- Updated timestamp

The library is a simple list in the MVP. Tags, favorites, search, filtering, and rating are out of scope for the initial version.

## Visual Direction

The design should feel like a clean musical tool rather than a content-heavy learning app.

Reference direction:

- Dieter Rams-style restraint
- Teenage Engineering-like instrument minimalism
- Warm off-white or light gray base
- High-contrast black typography
- Sparse accent color for selected states and active notes
- Strong grid alignment
- Tactile controls
- Progression builder inspired by recorder, sequencer, or hardware slots

Potential product language:

- `record`
- `take`
- `sequence`
- `slot`
- `library`

The UI should be desktop-first but responsive enough to use on smaller screens.

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
  mode: 'major' | 'natural_minor'
  chordType: 'triads' | 'sevenths'
  chords: ProgressionChord[]
  notes: string | null
  createdAt: string
  updatedAt: string
}
```

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

- Audio playback for individual chords and full progressions.
- Inversions and voicings.
- MIDI input or output.
- Progression tags and favorites.
- Search and filtering in the library.
- Transpose saved progressions into other keys.
- Borrowed chords and modal mixture.
- Secondary dominants.
- Modes beyond major and natural minor.
- Lightweight explanations for common harmonic movements.
