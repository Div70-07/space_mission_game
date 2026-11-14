# Part B: Screens

- **Owner**: B
- **Branch**: `part/screens`
- **Owned Folders**: `src/screens/`

## Public Exports (via `src/screens/index.ts`)
- `MissionPicker`
- `Builder`
- `OrbitRocket`
- `Report`
- `Tutorial`

## Never Touch
- `src/shared/*`
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- Other parts' folders (`src/engine`, `src/team`, `src/data`, `src/scene`, `src/content`)

## First Task
Build screens against the engine stubs and `gameData`:
- `MissionPicker.tsx`: Display missions from `gameData.missions`, allow selection
- `Builder.tsx`: Component selection grid, integrate `ResourceBars`, connect to `useDesignStore`
- `OrbitRocket.tsx`: Orbit selection and launcher compatibility checks
- `Report.tsx`: Show debrief report, score, events timeline, and real mission comparison
- `Tutorial.tsx`: Educational onboarding
- Re-export all 5 screens through `src/screens/index.ts`
