// Owner: B. Interactive aerospace launch vehicle and orbital trajectory visualizer.
import { useState, useMemo } from 'react'
import type { Rocket, Orbit, Design } from '@/shared/types'
import { gameData } from '@/data'

export interface RocketOrbitVisualizerProps {
  design: Design
  rocket?: Rocket
  orbit?: Orbit
  totalMass: number
  availDeltaV: number
  reqDeltaV: number
  className?: string
}

export function RocketOrbitVisualizer({
  design,
  rocket,
  orbit,
  totalMass,
  availDeltaV,
  reqDeltaV,
  className = '',
}: RocketOrbitVisualizerProps) {
  const [viewMode, setViewMode] = useState<'stack' | 'trajectory' | 'split'>('split')
  const [fairingCutaway, setFairingCutaway] = useState<boolean>(true)

  // Current mission
  const currentMission = useMemo(() => {
    return gameData.missions.find((m) => m.id === design.missionId)
  }, [design.missionId])

  // Destination planet
  const celestialBody = useMemo(() => {
    const oId = (orbit?.id || '').toLowerCase()
    const mId = (currentMission?.id || '').toLowerCase()
    if (oId.includes('mars') || mId.includes('mars')) return 'mars'
    if (oId.includes('moon') || oId.includes('llo') || mId.includes('moon') || mId.includes('lunar')) return 'moon'
    return 'earth'
  }, [orbit?.id, currentMission?.id])

  // Rocket identifier for tailored styling
  const rocketId = rocket?.id || 'falcon-9'

  // Orbit altitude display
  const orbitAltKm = orbit?.altitudeKm ?? 400

  // Calculate delta-v margin
  const deltaVMargin = availDeltaV - reqDeltaV
  const isDeltaVSufficient = deltaVMargin >= 0

  return (
    <div className={`flex flex-col h-full bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden ${className}`}>
      {/* 1. TOP VIEWPORT STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2 border-b border-[#334155] bg-[#1E293B] z-10 font-sans text-xs shrink-0 gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-slate-100 font-bold tracking-normal uppercase text-xs">
            Vehicle Integration & Orbital Trajectory Schematic
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            {rocket ? rocket.name.split('(')[0] : 'Flight Vehicle'}
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 bg-[#111827] p-0.5 rounded-lg border border-[#334155]">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-[#273449] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Integrated
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stack')}
            className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
              viewMode === 'stack' ? 'bg-[#273449] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rocket Stack
          </button>
          <button
            type="button"
            onClick={() => setViewMode('trajectory')}
            className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
              viewMode === 'trajectory' ? 'bg-[#273449] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orbit Profile
          </button>
        </div>
      </div>

      {/* 2. MAIN TECHNICAL SVG VIEWPORT */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-2 overflow-hidden bg-[#111827]">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(51, 65, 85, 0.35) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(51, 65, 85, 0.35) 1px, transparent 1px)`,
            backgroundSize: '32px 32px, 32px 32px',
          }}
        />

        {/* Ambient stars */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-[22%] right-[25%] w-1.5 h-1.5 bg-slate-400 rounded-full" />
          <div className="absolute bottom-[30%] left-[15%] w-1 h-1 bg-slate-400 rounded-full" />
          <div className="absolute top-[75%] right-[18%] w-1 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Technical SVG Canvas */}
        <svg
          viewBox="0 0 960 560"
          className="w-full h-full select-none z-10 transition-transform duration-300"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* SLS Core Orange Tank Gradient */}
            <linearGradient id="sls-core-tank" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="35%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>

            {/* Falcon 9 / Clean White Fuselage */}
            <linearGradient id="white-fuselage" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Electron Carbon Composite Body */}
            <linearGradient id="carbon-fuselage" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="30%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Atlas V Bronze / Copper Core */}
            <linearGradient id="bronze-core" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Earth Atmosphere Sphere */}
            <radialGradient id="earth-sphere" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="75%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Moon Sphere */}
            <radialGradient id="moon-sphere" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="85%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* Mars Sphere */}
            <radialGradient id="mars-sphere" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="45%" stopColor="#ea580c" />
              <stop offset="80%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>

            {/* Solar Panel Cells Pattern for Mounted Spacecraft */}
            <linearGradient id="vis-solar-cell" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>

          {/* ================================================================= */}
          {/* SECTION A: LEFT OR COMPACT ROCKET LAUNCH VEHICLE STACK            */}
          {/* ================================================================= */}
          {(viewMode === 'stack' || viewMode === 'split') && (
            <g transform={viewMode === 'stack' ? 'translate(260, 20)' : 'translate(40, 20)'}>
              {/* Rocket Ground Launchpad Mount & Flame Trench */}
              <rect x="70" y="495" width="220" height="20" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <rect x="110" y="480" width="140" height="16" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
              {/* Umbilical Tower Strut */}
              <line x1="85" y1="495" x2="85" y2="110" stroke="#475569" strokeWidth="4" />
              <line x1="85" y1="180" x2="155" y2="180" stroke="#64748b" strokeWidth="2.5" />
              <line x1="85" y1="310" x2="155" y2="310" stroke="#64748b" strokeWidth="2.5" />
              {/* Tower cross-bracing */}
              {[140, 210, 280, 350, 420].map((y, idx) => (
                <line key={idx} x1="75" y1={y} x2="95" y2={y + 35} stroke="#334155" strokeWidth="1.5" />
              ))}

              {/* ROCKET STACK SPECIFIC RENDERING */}
              {rocketId === 'sls-block1' && (
                <g>
                  {/* Left Solid Rocket Booster (SRB) */}
                  <rect x="112" y="220" width="26" height="260" rx="4" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  <polygon points="125,185 112,220 138,220" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  <rect x="112" y="290" width="26" height="4" fill="#0f172a" />
                  <rect x="112" y="370" width="26" height="4" fill="#0f172a" />
                  <polygon points="116,480 120,500 130,500 134,480" fill="#334155" />

                  {/* Right Solid Rocket Booster (SRB) */}
                  <rect x="222" y="220" width="26" height="260" rx="4" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  <polygon points="235,185 222,220 248,220" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  <rect x="222" y="290" width="26" height="4" fill="#0f172a" />
                  <rect x="222" y="370" width="26" height="4" fill="#0f172a" />
                  <polygon points="226,480 230,500 240,500 244,480" fill="#334155" />

                  {/* SLS Core Stage (Orange Foam) */}
                  <rect x="142" y="160" width="76" height="320" rx="5" fill="url(#sls-core-tank)" stroke="#9a3412" strokeWidth="1.5" />
                  {/* Inter-tank ring */}
                  <rect x="142" y="250" width="76" height="12" fill="#7c2d12" stroke="#431407" />
                  {/* RS-25 Engine Cluster (4 Engines) */}
                  <polygon points="148,480 152,504 162,504 166,480" fill="#334155" />
                  <polygon points="164,480 168,504 178,504 182,480" fill="#475569" />
                  <polygon points="180,480 184,504 194,504 198,480" fill="#475569" />
                  <polygon points="194,480 198,504 208,504 212,480" fill="#334155" />

                  {/* Upper Stage (ICPS) & Interstage */}
                  <rect x="148" y="125" width="64" height="35" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                </g>
              )}

              {rocketId === 'falcon-9' && (
                <g>
                  {/* Falcon 9 Stage 1 (White Cylinder) */}
                  <rect x="156" y="210" width="48" height="270" rx="3" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  {/* Black Landing Legs */}
                  <line x1="156" y1="420" x2="142" y2="480" stroke="#0f172a" strokeWidth="3.5" />
                  <line x1="204" y1="420" x2="218" y2="480" stroke="#0f172a" strokeWidth="3.5" />
                  {/* Grid Fins (Titanium) */}
                  <rect x="148" y="220" width="8" height="12" rx="1" fill="#1e293b" />
                  <rect x="204" y="220" width="8" height="12" rx="1" fill="#1e293b" />
                  {/* Black Interstage */}
                  <rect x="156" y="178" width="48" height="32" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  {/* Stage 2 */}
                  <rect x="156" y="125" width="48" height="53" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  {/* Merlin 1D Engine Bell */}
                  <polygon points="162,480 166,500 194,500 198,480" fill="#334155" />
                </g>
              )}

              {rocketId === 'electron' && (
                <g>
                  {/* Electron Carbon Body (Slender) */}
                  <rect x="165" y="180" width="30" height="300" rx="3" fill="url(#carbon-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  {/* Rocket Lab silver ring and branding accent */}
                  <rect x="165" y="220" width="30" height="4" fill="#cbd5e1" />
                  <rect x="165" y="320" width="30" height="3" fill="#cbd5e1" opacity="0.6" />
                  {/* Interstage */}
                  <rect x="165" y="160" width="30" height="20" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  {/* Stage 2 */}
                  <rect x="165" y="125" width="30" height="35" fill="url(#carbon-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  {/* Rutherford engine cluster */}
                  <polygon points="168,480 171,498 189,498 192,480" fill="#475569" />
                </g>
              )}

              {rocketId === 'atlas-v' && (
                <g>
                  {/* Atlas V Common Core Booster (Bronze) */}
                  <rect x="152" y="170" width="56" height="310" rx="4" fill="url(#bronze-core)" stroke="#78350f" strokeWidth="1.5" />
                  {/* Asymmetric Solid Rocket Boosters (551 config) */}
                  <rect x="134" y="310" width="16" height="170" rx="3" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  <polygon points="142,285 134,310 150,310" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1" />
                  <rect x="210" y="310" width="16" height="170" rx="3" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  <polygon points="218,285 210,310 226,310" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1" />
                  {/* Centaur Upper Stage (White) */}
                  <rect x="152" y="120" width="56" height="50" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  {/* RD-180 Dual Nozzles */}
                  <polygon points="158,480 162,502 174,502 178,480" fill="#334155" />
                  <polygon points="182,480 186,502 198,502 202,480" fill="#334155" />
                </g>
              )}

              {rocketId === 'vulcan-centaur' && (
                <g>
                  {/* Vulcan Core Booster */}
                  <rect x="150" y="165" width="60" height="315" rx="4" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.5" />
                  {/* Vulcan Red Livery Stripe */}
                  <polygon points="150,230 210,215 210,230 150,245" fill="#dc2626" opacity="0.85" />
                  {/* Strap-on GEM-63 Boosters */}
                  <rect x="130" y="290" width="18" height="190" rx="3" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  <polygon points="139,265 130,290 148,290" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1" />
                  <rect x="212" y="290" width="18" height="190" rx="3" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  <polygon points="221,265 212,290 230,290" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1" />
                  {/* Centaur V Upper Stage */}
                  <rect x="150" y="120" width="60" height="45" fill="url(#white-fuselage)" stroke="#334155" strokeWidth="1.2" />
                  {/* BE-4 Dual Methane Engines */}
                  <polygon points="156,480 160,504 176,504 180,480" fill="#334155" />
                  <polygon points="180,480 184,504 200,504 204,480" fill="#334155" />
                </g>
              )}

              {/* PAYLOAD FAIRING & MOUNTED SPACECRAFT NOSE CONE */}
              <g id="payload-fairing">
                {/* Fairing Outline */}
                <path
                  d="M 148 125 L 148 70 Q 148 20 180 12 Q 212 20 212 70 L 212 125 Z"
                  fill={fairingCutaway ? 'rgba(30, 41, 59, 0.45)' : 'url(#white-fuselage)'}
                  stroke="#60A5FA"
                  strokeWidth="1.5"
                  strokeDasharray={fairingCutaway ? '4 3' : 'none'}
                />

                {/* Stowed Spacecraft Payload Mounted Inside Fairing */}
                {fairingCutaway && (
                  <g transform="translate(180, 72)">
                    {/* Spacecraft Payload Adapter Fitting (PAF) */}
                    <polygon points="-16,42 16,42 10,28 -10,28" fill="#475569" stroke="#334155" strokeWidth="1" />
                    {/* Gold MLI Cube Satellite Bus */}
                    <rect x="-14" y="0" width="28" height="28" rx="2" fill="#ca8a04" stroke="#eab308" strokeWidth="1" />
                    {/* Folded Stowed Solar Arrays on sides */}
                    <rect x="-20" y="2" width="5" height="24" rx="1" fill="url(#vis-solar-cell)" stroke="#0284c7" strokeWidth="0.75" />
                    <rect x="15" y="2" width="5" height="24" rx="1" fill="url(#vis-solar-cell)" stroke="#0284c7" strokeWidth="0.75" />
                    {/* High-Gain Antenna Dish on top */}
                    <path d="M -8,0 Q 0,-8 8,0 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.75" />
                    <line x1="0" y1="-4" x2="0" y2="-11" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="0" cy="-11" r="1.5" fill="#38bdf8" />
                  </g>
                )}
              </g>

              {/* Technical Callout Annotations */}
              <g className="font-mono text-[9px]">
                <text x="180" y="525" fill="#94a3b8" textAnchor="middle" fontWeight="bold">
                  {rocket?.name || 'LAUNCH VEHICLE'}
                </text>
                <text x="220" y="70" fill="#60a5fa" textAnchor="start">
                  [SPACECRAFT PAYLOAD: {totalMass.toLocaleString()} kg]
                </text>
                <line x1="205" y1="72" x2="218" y2="70" stroke="#60a5fa" strokeWidth="1" />
              </g>
            </g>
          )}

          {/* ================================================================= */}
          {/* SECTION B: TARGET ORBIT & PLANETARY TRAJECTORY INSERTION ARC       */}
          {/* ================================================================= */}
          {(viewMode === 'trajectory' || viewMode === 'split') && (
            <g transform={viewMode === 'trajectory' ? 'translate(240, 20)' : 'translate(440, 20)'}>
              {/* Central Celestial Body (Earth, Moon, or Mars) */}
              <circle
                cx="260"
                cy="280"
                r="110"
                fill={
                  celestialBody === 'mars'
                    ? 'url(#mars-sphere)'
                    : celestialBody === 'moon'
                      ? 'url(#moon-sphere)'
                      : 'url(#earth-sphere)'
                }
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Subtle Planetary Atmosphere Rim */}
              <circle cx="260" cy="280" r="113" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.4" />

              {/* Planetary Body Label */}
              <text x="260" y="275" fill="#e2e8f0" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                {celestialBody.toUpperCase()}
              </text>
              <text x="260" y="292" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                PRIMARY TARGET BODY
              </text>

              {/* 1. Low Earth / Parking Orbit Guideline (Reference) */}
              <ellipse cx="260" cy="280" rx="140" ry="140" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <text x="260" y="135" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                PARKING BASELINE (200 km)
              </text>

              {/* 2. Target Orbit Ring (Highlighted based on active orbit selection) */}
              {(() => {
                // Dynamically scale orbit radius based on altitude
                const baseR = 140
                const maxR = 230
                const normalizedR = Math.min(maxR, baseR + (orbitAltKm / 36000) * (maxR - baseR) + (orbitAltKm > 1000 ? 30 : 15))
                const orbitStroke = isDeltaVSufficient ? '#4ADE80' : '#F87171'

                return (
                  <g>
                    {/* Elliptical or Circular Target Orbit */}
                    <ellipse
                      cx="260"
                      cy="280"
                      rx={normalizedR}
                      ry={normalizedR * 0.92}
                      fill="none"
                      stroke={orbitStroke}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />

                    {/* Orbiting Spacecraft Node at Insertion Point */}
                    <circle cx={260} cy={280 - (normalizedR * 0.92)} r="5" fill={orbitStroke} />
                    <circle cx={260} cy={280 - (normalizedR * 0.92)} r="9" fill="none" stroke={orbitStroke} strokeWidth="1" opacity="0.6" />

                    {/* Target Orbit Details Banner */}
                    <text x="260" y="45" fill={orbitStroke} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      TARGET ORBIT: {orbit ? orbit.name.toUpperCase() : 'SELECT TARGET ORBIT'}
                    </text>
                    <text x="260" y="62" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      Altitude: {orbitAltKm.toLocaleString()} km | Δv Required: {reqDeltaV.toFixed(2)} km/s
                    </text>

                    {/* Hohmann / Ascent Insertion Trajectory Path from launch surface to orbit */}
                    <path
                      d={`M 170 340 Q 150 200 260 ${280 - (normalizedR * 0.92)}`}
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="2.5"
                    />
                    {/* Velocity Vector Arrowheads along ascent curve */}
                    <polygon points="210,195 218,188 214,204" fill="#60A5FA" />
                    <text x="145" y="245" fill="#60A5FA" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      INJECTION TRAJECTORY
                    </text>
                  </g>
                )
              })()}

              {/* Surface Launchpad Marker */}
              <circle cx="170" cy="340" r="4" fill="#60a5fa" />
              <text x="155" y="360" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                LAUNCH SITE
              </text>
            </g>
          )}
        </svg>

        {/* Viewport Overlay Controls & Payload Fairing Cutaway Switch */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={() => setFairingCutaway(!fairingCutaway)}
            className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-slate-300 hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            {fairingCutaway ? 'Fairing: Cutaway' : 'Fairing: Shrouded'}
          </button>
        </div>

        {/* Real-time Trajectory Compliance Pill */}
        <div className="absolute bottom-3 right-3 z-20">
          <span
            className={`text-xs font-sans font-semibold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
              isDeltaVSufficient
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isDeltaVSufficient ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {isDeltaVSufficient ? 'ΔV Trajectory Margin: Nominal' : 'Delta-V Deficit: Insufficient Fuel'}
          </span>
        </div>
      </div>
    </div>
  )
}
