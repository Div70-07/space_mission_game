# Part C Integration Guide

This document details the exact integration snippets to connect Part C (multiplayer lobbies, role permissions, real-time sync, local pass-the-laptop mode, and launch approval gate) into the application without altering outside contracts unannounced.

---

## 1. Firebase Setup (For Team Leader)

To connect an online Firebase Realtime Database for cross-device multiplayer:
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `space-mission-game`).
2. Add a **Web App** (`</>`) to the project.
3. In the left sidebar under **Build**, click **Realtime Database** -> **Create Database** (choose default region).
4. In the **Rules** tab of your Realtime Database, configure open access for the hackathon (⚠️ **Warning**: Remove or secure after the event):
   ```json
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
5. Copy your Firebase web configuration values into a local `.env` file at the project root (never commit `.env`):
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
   VITE_FIREBASE_PROJECT_ID="your-project"
   ```
*Note: If these environment variables are absent, Part C automatically falls back to the built-in `LocalBackend` (BroadcastChannel across browser tabs) so 4 clients can be demonstrated on any laptop with zero setup.*

---

## 2. Integration Snippets (Awaiting Leader Approval)

### Snippet A: Mount `<LocalTeamMode />` and `useRoomSync()` in `src/App.tsx`
Place `<LocalTeamMode />` right above the `<main>` content area and initialize the sync hook so any local or online room updates are continuously replicated across clients.

```tsx
// in src/App.tsx
import { useRoomSync, LocalTeamMode } from '@/team'

export function App() {
  useRoomSync() // Active background sync for team mode

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
        <header className="...">
          {/* Header & Nav */}
        </header>

        {/* Top pass-the-laptop banner (visible when mode === 'local') */}
        <LocalTeamMode />

        <main className="flex-1 p-6">
          {/* Routes */}
        </main>
      </div>
    </BrowserRouter>
  )
}
```

---

### Snippet B: Connect Subsystem Panels to `useCanEdit(section)` in `src/screens/Builder.tsx`
Replace the local simulation dropdown with the central `useTeamStore`:
```tsx
// in src/screens/Builder.tsx
import { useCanEdit, useTeamStore } from '@/team'

// Inside Builder component:
const teamMode = useTeamStore((s) => s.mode)
const currentRole = useTeamStore((s) => s.myRole)

// Lock/unlock panels based on active team permissions:
const isScienceAuthorized = useCanEdit('science')
const isEngineerAuthorized = useCanEdit('engineer')
const isCommsAuthorized = useCanEdit('comms')
const isPlannerAuthorized = useCanEdit('planner')
```

---

### Snippet C: Connect Mode Dropdown to `teamStore` in `src/screens/Builder.tsx`
Update the mode switcher dropdown on the Builder screen to read from and write to `useTeamStore`:
```tsx
// in src/screens/Builder.tsx
const mode = useTeamStore((s) => s.mode)
const myRole = useTeamStore((s) => s.myRole)
const setMode = useTeamStore((s) => s.setMode)
const setMyRole = useTeamStore((s) => s.setMyRole)

<select
  value={mode === 'solo' ? 'solo' : mode === 'local' ? 'local' : (myRole || 'solo')}
  onChange={(e) => {
    const val = e.target.value
    if (val === 'solo') {
      setMode('solo')
      setMyRole(null)
    } else if (val === 'local') {
      setMode('local')
      useTeamStore.getState().cycleLocalRole()
    } else {
      setMode('local')
      setMyRole(val as Role)
    }
  }}
  className="bg-slate-900 text-teal-300 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono"
>
  <option value="solo">Solo Architect (All Roles)</option>
  <option value="local">Pass-the-Laptop (Local Turns)</option>
  <option value="planner">Role: Planner</option>
  <option value="engineer">Role: Engineer</option>
  <option value="science">Role: Science Lead</option>
  <option value="comms">Role: Comms Officer</option>
</select>
```

---

### Snippet D: Mount `<ApproveGate />` on Builder and OrbitRocket
1. **Current Placement (Pre-Orbit & Rocket screen completion)**:
   Place `<ApproveGate onLaunch={() => navigate('/report')} />` at the bottom of `src/screens/Builder.tsx` adjacent to the "Proceed to Orbit & Rocket" button.
2. **Permanent Placement**:
   Once `src/screens/OrbitRocket.tsx` is finalized, `<ApproveGate onLaunch={() => navigate('/report')} />` mounts as the final gate at the bottom of `OrbitRocket.tsx`, triggering flight simulation when all roles sign off and engineering checks pass.
