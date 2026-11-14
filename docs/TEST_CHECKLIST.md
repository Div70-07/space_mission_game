# Manual Test Checklist: Space Mission Design Game

Follow these sequential steps to manually verify the application features, resource constraints, failure telemetry, and team mode workflows.

---

## 1. Local Environment & Startup
1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173/`.

---

## 2. Screen 1: Mission Picker (`/`)
- [ ] **Catalog Display**: Verify missions appear as interactive cards (e.g., "Moon orbiter", "Mars orbiter").
- [ ] **Mission Selection**: Click "Select Mission" on a card. The active mission badge should update.
- [ ] **Navigation**: Click "Proceed to Builder" or click "Builder" in the top navbar.

---

## 3. Screen 2: Spacecraft Assembly Workstation (`/build`)
- [ ] **Telemetry HUD**: Six resource monitors appear (Dry & Wet Mass, Power Balance, Financial Budget, Instrument Data Rate, Downlink Bandwidth, Mission Lifetime).
- [ ] **Role Subsystem Tabs**:
  - Click through **Planner** (Budget & Timeline), **Engineer** (Power & Structure), **Science** (Instruments), and **Comms** (Antennas & Downlink).
- [ ] **Resource Bars Dynamic Updates**:
  - Select/unselect instruments in the **Science** tab: confirm Mass, Power, Cost, and Data rates increment and decrement.
  - Mount a **Standard Solar Array** in the Engineer tab: confirm power generation updates.
  - Mount a **High Gain Parabolic Dish** in the Comms tab: confirm downlink bandwidth updates.
- [ ] **Red/Warning Bars Verification**:
  - Unmount all power systems while instruments are selected: confirm Power Balance flags as `CRITICAL` deficit.
  - Extend mission lifetime slider: verify budget/time parameters change.
- [ ] **Subsystem Permission Testing (Solo Simulator)**:
  - In the "Mode" dropdown, switch from "Solo Architect" to "Role: Science Lead".
  - Attempt to click power parts under the Engineer tab: verify the panel is locked with a "Subsystem Locked by Team Access Policy" banner.

---

## 4. Screen 3: Orbit & Rocket Selection (`/orbit-rocket`)
- [ ] **Target Orbit Selection**: Select an orbit (e.g. LEO or GTO).
- [ ] **Launch Vehicle Selection**: Select a rocket launcher (e.g., Falcon 9).
- [ ] **Propellant Fuel Slider**: Drag fuel slider to add wet mass and delta-V.
- [ ] **Launch Feasibility & Mass Check**:
  - When spacecraft mass is below rocket payload limit: confirm Launch check shows `Launch feasible`.
  - When payload exceeds limit: confirm check displays failure message with excess mass in kg.

---

## 5. Screen 4: Mission Debrief & Report (`/report`)
- [ ] Review debrief report status:
  - When all checks pass: displays mission success, positive score, and nominal system telemetry.
  - When one or more checks fail: displays mission failure with exact failure reasons (e.g. power deficit, over budget, launch capacity exceeded).
- [ ] Compare with historical NASA mission reference.

---

## 6. Responsive Mobile Viewport (~390px Width)
- [ ] Open Chrome DevTools (`F12`), toggle Device Toolbar (`Ctrl+Shift+M`), and select iPhone 12/14 / 390px width.
- [ ] Verify HUD resource bars stack vertically into 1 column.
- [ ] Verify tab buttons and cards remain accessible without horizontal page overflow.

---

## 7. Team Mode Multi-Client Testing (Part C Preview)
*Use these steps to test local and multiplayer synchronisation once Part C is enabled.*

### A. Local Mode (Same Browser Tabs via BroadcastChannel)
1. Open Tab A at `http://localhost:5173/lobby`.
2. Click "Create Team Room" -> Note the 4-letter room code (e.g. `XK9P`).
3. Select role **Science Lead**.
4. Open Tab B in an adjacent window at `http://localhost:5173/lobby`.
5. Enter the room code -> Join room -> Notice **Science Lead** is disabled and taken by Player 1.
6. Select role **Engineer** in Tab B.
7. In Tab A, add an instrument: verify Tab B's resource bar updates within ~150ms.
8. In Tab B, select a power system: verify Tab A updates immediately.
9. Verify that Tab A cannot edit power systems and Tab B cannot edit science instruments.
10. In ApproveGate, click "Approve design" in Tab A and Tab B. Verify approvals sync and Launch enables only when all required roles sign off.

### B. Pass-the-Laptop Fallback Mode
1. In single tab without network, select "Pass-the-Laptop Mode".
2. Confirm the top status bar indicates "Now Playing: Planner".
3. Click "Next Player" -> Cycles to "Engineer", unlocking Engineer controls while locking other roles.
