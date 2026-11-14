# Demo Presentation Script: Space Mission Design Game

**Event:** NASA Space Apps Challenge 2026  
**Presentation Duration:** 1 to 2 Minutes (Approx. 90–110 Seconds)  
**Presenter(s):** Flight Architecture Team  

---

## Presentation Outline & Timestamp Cue Sheet

| Time | Segment | Screen / Visual Cue | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:15** | **Hook & Intro** | Mission Picker Screen (`/`) | Concept, NASA Challenge goal, multiplayer collaboration. |
| **0:15 – 0:35** | **Mission Selection** | Mission Catalog (`/`) | 3 Playable missions, research constraints, budget caps. |
| **0:35 – 0:55** | **Spacecraft Assembly** | Builder Workstation (`/build`) | Subsystem balancing: mass, power, comms, science yield. |
| **0:55 – 1:15** | **Trajectory & Launch** | Orbit & Rocket (`/orbit-rocket`) | Orbital Δv requirements, payload lift margins, team sign-off. |
| **1:15 – 1:40** | **Flight Simulation** | Mission Scene (`MissionScene`) | Real-time 2D animation, staging, cruise, orbital insertion. |
| **1:40 – 2:00** | **Debrief & Impact** | Debrief Report (`/report`) | Physics diagnostics, NASA mission comparison, educational takeaway. |

---

## Word-for-Word Spoken Script

### [0:00 – 0:15] 1. Introduction: The Vision
> *"Hello judges! Welcome to the **Space Mission Design Game**, built for the NASA Space Apps Challenge 2026.  
> Real-world space exploration isn't done by a single person—it requires a coordinated team of flight planners, systems engineers, payload scientists, and telecommunications directors.  
> Our web game puts players in the shoes of a NASA flight team, challenging them to design, build, and launch a scientifically viable spacecraft within real physics and fiscal constraints."*

---

### [0:15 – 0:35] 2. Mission Selection: Setting the Goal
*(Action: Click on the 'Mars Atmospheric Evolution & Climate Surveyor' or 'Lunar Polar Prospector' card)*

> *"We start at the Mission Catalog. Players can select from three real-world inspired missions:  
> 1. An **Earth Climate Observer** in Sun-Synchronous Orbit,  
> 2. A **Lunar Polar Prospector** searching for crater water ice, or  
> 3. An advanced **Mars Climate Surveyor**.  
>  
> Notice that each mission defines a hard fiscal budget, required operational lifetime, and a minimum scientific discovery threshold. Today, we're taking on the challenge of a Lunar Polar mission."*

---

### [0:35 – 0:55] 3. Spacecraft Assembly: The Core Resource Trade-offs
*(Action: Navigate to `/build`, click through Science, Engineer, and Comms role tabs, select instruments and solar arrays)*

> *"Now in the Spacecraft Assembly Workstation, our team must balance four critical aerospace constraints: **Mass, Power, Cost, and Telemetry Bandwidth**.  
>  
> As the Science Director, I mount an Epithermal Neutron Detector and a Diviner Thermal Radiometer to detect lunar ice deposits. Notice how our scientific yield immediately climbs to 135 points!  
>  
> But every sensor draws electrical wattage and generates hundreds of megabytes of daily data. Our Lead Engineer equips an UltraFlex solar array to generate 750 Watts of power, while our Comms Officer mounts a high-gain parabolic dish to ensure raw data doesn't overflow the onboard solid-state recorder."*

---

### [0:55 – 1:15] 4. Orbit & Rocket Staging: Overcoming Gravity with Delta-V
*(Action: Navigate to `/orbit-rocket`, select 'Low Lunar Orbit (LLO 100 km)' and 'Falcon 9 Block 5')*

> *"Next, we transition to Orbit and Rocket Integration. Reaching the Moon requires an orbital velocity increment (Delta-v) of 13.8 km/s.  
>  
> We pair our spacecraft with a commercial Falcon 9 Block 5 launcher. Our real-time engine validates that our 340-kilogram wet spacecraft mass fits comfortably within the rocket's 4,020 kg translunar lift capacity, yielding a generous positive payload margin.  
>  
> In multiplayer team mode, all four flight directors must review telemetry and sign off at the Approval Gate before launch authorization is granted."*

---

### [1:15 – 1:40] 5. Mission Launch Visualization: Bringing Physics to Life
*(Action: View the interactive canvas in `MissionScene`)*

> *"Launch authorized! Countdown initiates... and liftoff!  
>  
> Our custom 2D canvas visualizer takes players on a dynamic multi-phase flight experience:  
> - **Phase 1: Atmospheric Ascent:** Watch the rocket tilt through gravity turn, endure transonic Max-Q vibration shockwaves, and separate its payload fairing.  
> - **Phase 2: Deep Space Cruise:** The booster falls away as our satellite deploys its solar wings and cruises through interplanetary space.  
> - **Phase 3: Orbital Insertion:** A retrograde braking burn decelerates the probe directly into lunar capture.  
> - **Phase 4: Science Operations:** The spacecraft enters a circular polar orbit, sweeping an active radar beam across permanently shadowed polar craters to map buried ice deposits."*

---

### [1:40 – 2:00] 6. Mission Debrief & Educational Value
*(Action: Highlight the Diagnostic Telemetry Panel & NASA Mission Comparison)*

> *"Finally, the Mission Debrief screen reviews our flight score, analyzes random space weather events—like solar flares and tracking station dropouts—and directly benchmarks our spacecraft against NASA's real **Lunar Reconnaissance Orbiter (LRO)**.  
>  
> If a mission fails, the engine doesn't just display a 'Game Over'—it provides diagnostic engineering feedback explaining whether the failure was caused by solar deficit from the inverse square law, data buffer overflow, or rocket overload.  
>  
> The Space Mission Design Game transforms complex aerospace concepts into an engaging, collaborative classroom experience. Thank you, and we welcome your questions!"*

---

## Presenter Preparation Checklist
- [x] Pre-set mission in `/build` with nominal instruments, solar panels, and antenna.
- [x] Rehearse 15-second transitions between screens.
- [x] Ensure browser viewport is at 100% zoom (1920x1080 recommended).
- [x] Have `MissionScene` running in autoplay mode to capture the audience's visual attention during the flight phase.
