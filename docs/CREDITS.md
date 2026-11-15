# Project Credits and Data Sources

**Project:** Space Mission Design Game  
**Event:** NASA Space Apps Challenge 2026  
**Module:** PART D – Data, Visuals, and Story  
**Maintainer:** Team Member D  

---

## 1. NASA Resources & Scientific Data References

The spacecraft instruments, rocket specifications, orbital benchmarks, and planetary constants implemented in `src/data/` are derived from verified NASA mission documentation, planetary science technical reports, and public aerospace engineering literature:

### A. Scientific Instruments (`src/data/instruments.json`)
1. **High-Resolution Optical Imager (HiRISE Class)**
   - *Source:* NASA Mars Reconnaissance Orbiter (MRO) Science Operations Center, University of Arizona / JPL.
   - *URL:* [https://science.nasa.gov/mission/mro/hirise/](https://science.nasa.gov/mission/mro/hirise/)
   - *Specifications:* 65 kg mass, 60 W continuous operational draw, 0.3 m ground sampling resolution.
2. **Imaging Infrared Spectrometer (CRISM Class)**
   - *Source:* Compact Reconnaissance Imaging Spectrometer for Mars (CRISM), Johns Hopkins Applied Physics Laboratory / NASA MRO.
   - *URL:* [https://crism.jhuapl.edu/](https://crism.jhuapl.edu/)
3. **Synthetic Aperture Radar & Altimeter (SAR)**
   - *Source:* NASA Magellan & Cassini RADAR Instrument Specifications / NASA Shuttle Radar Topography Mission (SRTM).
   - *URL:* [https://science.nasa.gov/mission/magellan/](https://science.nasa.gov/mission/magellan/)
4. **Triaxial Fluxgate Magnetometer & Plasma Wave Sensor**
   - *Source:* NASA MAVEN (Mars Atmosphere and Volatile EvolutioN) Magnetometer Investigation / NASA Goddard Space Flight Center.
   - *URL:* [https://science.nasa.gov/mission/maven/](https://science.nasa.gov/mission/maven/)
5. **Multispectral Thermal Infrared Radiometer (Diviner Class)**
   - *Source:* NASA Lunar Reconnaissance Orbiter (LRO) Diviner Lunar Radiometer Experiment, UCLA / JPL.
   - *URL:* [https://www.diviner.ucla.edu/](https://www.diviner.ucla.edu/)
6. **Epithermal Neutron & Gamma-Ray Detector (LEND Class)**
   - *Source:* NASA LRO Lunar Exploration Neutron Detector (LEND) / NASA Lunar Prospector Mission.
   - *URL:* [https://science.nasa.gov/mission/lro/](https://science.nasa.gov/mission/lro/)
7. **Atmospheric Backscatter LIDAR (CALIOP Class)**
   - *Source:* NASA Cloud-Aerosol Lidar and Infrared Pathfinder Satellite Observation (CALIPSO), NASA Langley Research Center.
   - *URL:* [https://www-calipso.larc.nasa.gov/](https://www-calipso.larc.nasa.gov/)
8. **Imaging Ultraviolet Spectrograph (IUVS Class)**
   - *Source:* NASA MAVEN Imaging Ultraviolet Spectrograph, Laboratory for Atmospheric and Space Physics (LASP), CU Boulder.
   - *URL:* [https://lasp.colorado.edu/maven/](https://lasp.colorado.edu/maven/)
9. **Shallow Subsurface Sounding Radar (SHARAD Class)**
   - *Source:* NASA / Agenzia Spaziale Italiana (ASI) Shallow Radar Sounder onboard Mars Reconnaissance Orbiter.
   - *URL:* [https://science.nasa.gov/mission/mro/sharad/](https://science.nasa.gov/mission/mro/sharad/)
10. **Cosmic & Interplanetary Dust Analyzer (CDA Class)**
    - *Source:* NASA / ESA Cassini Cosmic Dust Analyzer, Max Planck Institute for Nuclear Physics.
    - *URL:* [https://science.nasa.gov/mission/cassini/](https://science.nasa.gov/mission/cassini/)

### B. Launch Vehicles (`src/data/rockets.json`)
1. **Falcon 9 Block 5 (SpaceX)**
   - *Source:* SpaceX Falcon 9 Launch Vehicle Payload User's Guide (Rev 2, 2021).
   - *Commercial Listing:* $67M list price for standard commercial launch to LEO/GTO.
2. **Electron (Rocket Lab)**
   - *Source:* Rocket Lab Electron Payload User's Guide (v6.5, 2020).
   - *Commercial Listing:* $7.5M for dedicated small satellite launches to LEO/SSO.
3. **Atlas V 551 (United Launch Alliance)**
   - *Source:* United Launch Alliance Atlas V Launch Services User's Guide (Rev 11).
4. **Vulcan Centaur VC6 (United Launch Alliance)**
   - *Source:* United Launch Alliance Vulcan Launch Services User's Guide (2023).
5. **Space Launch System (SLS Block 1)**
   - *Source:* NASA Space Launch System Mission Planner's Guide (ESD 30000).

### C. Orbital Parameters & Physics Models (`src/data/orbits.json`)
- NASA General Mission Analysis Tool (GMAT) reference orbital Delta-v benchmarks.
- Solar irradiance reduction at Mars calculated using the solar constant and inverse-square law ($1 / r^2$ where Mars semi-major axis $a = 1.524\text{ AU} \implies 1 / 1.524^2 \approx 0.43$).
- Friis free-space path loss model approximations for deep-space telemetry attenuation.

### D. NASA Comparative Missions (`src/data/realMissions.json`)
- **Landsat 9:** [https://science.nasa.gov/mission/landsat-9/](https://science.nasa.gov/mission/landsat-9/)
- **Lunar Reconnaissance Orbiter (LRO):** [https://science.nasa.gov/mission/lro/](https://science.nasa.gov/mission/lro/)
- **Mars Reconnaissance Orbiter (MRO):** [https://science.nasa.gov/mission/mro/](https://science.nasa.gov/mission/mro/)
- **MAVEN (Mars Atmosphere and Volatile EvolutioN):** [https://science.nasa.gov/mission/maven/](https://science.nasa.gov/mission/maven/)
- **Terra EOS AM-1:** [https://terra.nasa.gov/](https://terra.nasa.gov/)

---

## 2. Visual & Media Assets (`public/images/`)

All vector diagrams and mission graphics in `public/images/` were designed specifically for this project as clean, scalable vector illustrations (SVG):
- `public/images/earth-mission.svg` – Conceptual rendering of polar Earth-observing satellite in Sun-Synchronous Orbit with multi-spectral scanning swath.
- `public/images/moon-mission.svg` – Lunar reconnaissance probe mapping permanently shadowed craters at the lunar south pole with Earth in the background.
- `public/images/mars-mission.svg` – Deep space orbiter with 3m high-gain dish and solar wings scanning Valles Marineris and Martian polar caps.
- `public/images/rocket-launch.svg` – Commercial heavy-lift booster ascending through the transonic shock regime (Max-Q) with exhaust shock diamonds.
- `public/images/spacecraft-diagram.svg` – Exploded engineering blueprint illustrating satellite bus frame, electrical solar wings, Cassegrain antenna, and instrument payload suite.

*Image Licensing:* All custom SVG assets are provided under the MIT License and incorporate NASA open-access public design aesthetics in compliance with NASA Media and Usage Guidelines.

---

## 3. Libraries and Open-Source Technologies

- **React 19:** Frontend reactive user interface framework.
- **Vite 8:** Next-generation frontend build tooling and development server.
- **TailwindCSS 4:** Utility-first responsive CSS styling.
- **Vitest 5:** Blazing fast unit and integration testing runner.
- **Zustand 5:** Lightweight state management store.
- **HTML5 Canvas 2D Context:** Responsive hardware-accelerated 2D flight animation engine.

---

## 4. NASA Open Data Policy & Attribution

This project is submitted to the NASA Space Apps Challenge 2026. Data, mission parameters, and planetary facts comply with the NASA Open Data Policy. No proprietary or classified data was utilized. Educational approximations and gameplay balancing heuristics are labeled clearly in corresponding code comments and documentation.
