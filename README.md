# Space Mission Design Game

NASA Space Apps Challenge 2026 project. A browser game where 1 to 4 players design a space mission together (pick a mission, build a spacecraft, choose an orbit and rocket, launch, get a report explaining why it worked or failed).

## Branch Workflow
- **Rules**: Everyone works only on their designated part branch. The leader merges part branches into `main`. Nobody else pushes directly to `main`.
- **Syncing**: After each merge into `main`, teammates should run:
  ```bash
  git fetch origin
  git merge origin/main
  ```
- **Secrets**: Never commit `.env` or sensitive credentials.

## Branches & Ownership
- `main` - Project leader / integrator (shared files, configs, root routes)
- `part/engine` - Part A: Engine and scoring (`src/engine`)
- `part/screens` - Part B: Screens and UI components (`src/screens`)
- `part/team` - Part C: Team mode (rooms, roles, sync) (`src/team`, `docs/SUBMISSION.md`)
- `part/data` - Part D: Data, visuals, story (`src/data`, `src/scene`, `src/content`, `public/images`, `docs/CREDITS.md`, `docs/DEMO_SCRIPT.md`)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build for production:
   ```bash
   npm run build
   ```
