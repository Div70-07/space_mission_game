# Part A: Engine and Scoring

- **Owner**: A
- **Branch**: `part/engine`
- **Owned Folders**: `src/engine/`

## Public Exports (via `src/engine/index.ts`)
- `computeTotals(design: Design, data: GameData): Totals`
- `checkDesign(design: Design, data: GameData): Check[]`
- `requiredDeltaV(design: Design, data: GameData): number`
- `availableDeltaV(design: Design, data: GameData): number`
- `runMission(design: Design, data: GameData, seed: number): SimResult`

## Never Touch
- `src/shared/*`
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- Other parts' folders (`src/screens`, `src/team`, `src/data`, `src/scene`, `src/content`)

## First Task
Replace the stub functions with real physics and mission simulation formulas:
- Calculate mass, power, cost, data per day, and downlink totals in `totals.ts`
- Implement Tsiolkovsky delta-V equation in `deltaV.ts`
- Implement checks in `launch.ts`, `power.ts`, `comms.ts`
- Implement random event simulation and scoring in `events.ts`, `scoring.ts`, `runMission.ts`
- Keep all engine functions 100% pure (they receive `GameData` as an argument and never import JSON files directly)
