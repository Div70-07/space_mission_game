# NASA Space Apps Challenge 2026 Submission

## Project Title
**Space Mission Design Game (CosmoCraft)**

## Summary
The Space Mission Design Game is an interactive, physics-grounded web application designed for the NASA Space Apps Challenge 2026. Designed for 1 to 4 players operating either individually or in coordinated multiplayer roles, the game challenges participants to design, configure, validate, and launch real-world space exploration missions across the solar system while rigorously managing six competing engineering constraints: mass, electrical power balance, financial budget, observational data generation, telecommunications downlink bandwidth, and operational mission duration.

---

## Challenge Problem & Solution Goal
Planning space exploration missions requires cross-disciplinary trade-offs between science aspirations and physical realities. A spacecraft cannot carry every desired scientific instrument without exceeding the lift capability of its launch vehicle, overloading its solar array or RTG power system, or exhausting its downlink communication windows. 

Our goal is to make NASA's mission formulation and systems engineering principles accessible and engaging to students, engineers, and space enthusiasts worldwide through:
1. **Realistic Systems Modeling**: Integrating the Tsiolkovsky rocket equation, GMAT delta-V trajectories, inverse-square solar radiation laws, and communications link budgets.
2. **True Collaborative Multiplayer**: Empowering 4 specialized crew roles (Mission Planner, Systems Engineer, Science Lead, Telecommunications Officer) to negotiate trades and co-create spacecraft in real-time.
3. **Rigorous Launch Readiness**: Requiring consensus sign-off from all claimed engineering specialists before initiating flight simulation.

---

## Core Systems & The Six Mission Resources

| Resource | Unit | Governing Physics & Engineering Constraint |
| :--- | :--- | :--- |
| **Spacecraft Mass** | kg | Structural dry mass + instruments + fuel vs launcher payload capacity to target orbit. |
| **Power Balance** | Watts | Solar array area (scaled via $1/r^2$ solar distance) / RTG vs active payload draw. |
| **Financial Budget** | $M USD | Total mission development cost vs NASA agency budget cap. |
| **Science Data Rate**| MB/day | Cumulative observational data produced by payload instruments. |
| **Telemetry Downlink**| MB/day | High-Gain / Omni antenna ground station pass bandwidth (prevents recorder overflow). |
| **Mission Lifetime** | Months | Target mission baseline requirement vs component endurance. |

---

## Collaborative Team Mode Architecture
- **Specialist Roles**:
  - **Planner**: Mission destination, target orbit, and operational lifetime constraints.
  - **Engineer**: Spacecraft bus structure, power systems (Solar/RTG), and launch vehicle selection.
  - **Science Lead**: Scientific instrumentation payload and observation priorities.
  - **Comms Officer**: Telecommunications antennas, frequency bands, and ground link budget.
- **Dual Multiplayer Engines**:
  - **Online Mode**: High-frequency real-time synchronisation via Firebase Realtime Database with atomic transactions for role assignment and debounced state replication.
  - **Local Zero-Network Mode**: Browser `BroadcastChannel` synchronisation across tabs and single-device "Pass-the-Laptop" mode ensuring zero barrier to entry in hackathon and educational settings.
- **Pre-Flight Approval Gate**: Every active specialist must conduct an independent systems review and submit their digital sign-off. Any design modification instantly resets all approvals.

---

## NASA Data & Resources Referenced
- **GMAT (General Mission Analysis Tool)**: Trajectory and delta-V benchmarks for Earth orbits (LEO, GTO, GEO) and interplanetary insertions (Lunar LLO, Mars Orbit).
- **NASA Space Science Data Coordinated Archive (NSSDCA)**: Payload instrument specifications and power demands from landmark missions including PACE, Lunar Reconnaissance Orbiter (LRO), and MAVEN.
- **NASA Systems Engineering Handbook (SP-2016-6105)**: Phase A formulation processes, review milestones, and margin management methodologies.

---

## Technology Stack
- **Frontend Framework**: React 19, TypeScript, Vite 8, Tailwind CSS v4
- **State Management**: Zustand (Shared Design Store & Team Synchronization Store)
- **Networking & Cloud Backend**: Firebase Realtime Database & Browser BroadcastChannel API
- **Testing & Verification**: Vitest

---

## The Team
- **Mission Lead / Integrator**: [TODO: Team Member 1 Name & Contribution]
- **Physics Engine & Scoring Specialist (Part A)**: [TODO: Team Member 2 Name & Contribution]
- **User Experience & Telemetry Engineer (Part B)**: [TODO: Team Member 3 Name & Contribution]
- **Multiplayer Systems & Synchronisation Architect (Part C)**: [TODO: Team Member 4 Name & Contribution]
- **Data & Narrative Specialist (Part D)**: [TODO: Team Member 5 Name & Contribution]
