# Part D: Data, Visuals, and Story

- **Owner**: D
- **Branch**: `part/data`
- **Owned Folders**:
  - `src/data/`
  - `src/scene/`
  - `src/content/`
  - `public/images/`
  - `docs/CREDITS.md`
  - `docs/DEMO_SCRIPT.md`

## Public Exports (via `src/data/index.ts` and `src/scene/index.ts`)
- `gameData: GameData` (from `src/data/index.ts`)
- `MissionScene` (from `src/scene/index.ts`)

## Never Touch
- `src/shared/*`
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- Other parts' folders (`src/engine`, `src/screens`, `src/team`)

## First Task
- Fill the JSON files in `src/data/` with real NASA-based numbers, each with a valid source link
- Add realistic instruments, parts, rockets, orbits, missions, and historical comparisons
- Build out the visual canvas animations in `src/scene/`
- Add narrative explanations in `src/content/`
- Keep `src/data/index.ts` exporting pure `gameData` conforming strictly to `GameData` in `src/shared/types.ts`
