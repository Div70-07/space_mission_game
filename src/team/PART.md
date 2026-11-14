# Part C: Team Mode (Rooms, Roles, Sync)

- **Owner**: C
- **Branch**: `part/team`
- **Owned Folders**: `src/team/`, `docs/SUBMISSION.md`

## Public Exports (via `src/team/index.ts`)
- `Lobby`
- `ApproveGate`
- `LocalTeamMode`
- `canEdit(role: Role, section: string): boolean`

## Never Touch
- `src/shared/*`
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- Other parts' folders (`src/engine`, `src/screens`, `src/data`, `src/scene`, `src/content`)

## First Task
- Get two browser windows connecting into one room using Firebase Realtime Database
- Build `LocalTeamMode` (pass-the-laptop) early as the bulletproof hackathon demo fallback if network fails
- Implement `canEdit` permissions so each specialist role edits only their subsystem
- Implement `ApproveGate` requiring all 4 roles to sign off before mission launch
- Keep Firebase initialization safe when env variables are not present
- Re-export `Lobby`, `ApproveGate`, `LocalTeamMode`, `canEdit` in `src/team/index.ts`
