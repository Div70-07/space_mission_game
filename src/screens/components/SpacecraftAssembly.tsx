// Owner: B. Interactive, data-driven spacecraft assembly visualization for the Builder workstation.
import { useState, useMemo } from 'react'
import type { Design, Instrument } from '@/shared/types'
import { gameData } from '@/data'

export interface SpacecraftAssemblyProps {
  /** The current flight design from Zustand store */
  design: Design
  /** Optional callback to activate a subsystem role tab in the engineering panel */
  onSelectSubsystem?: (subsystem: 'science' | 'engineer' | 'comms' | 'planner') => void
  /** Currently active subsystem in the control panel for targeted highlight */
  activeRole?: string
  /** Optional container class name */
  className?: string
}

export function SpacecraftAssembly({
  design,
  onSelectSubsystem,
  activeRole,
  className = '',
}: SpacecraftAssemblyProps) {
  // Track hovered component for technical callout
  const [hoveredComponent, setHoveredComponent] = useState<{
    id: string
    title: string
    category: string
    metric: string
    status: 'nominal' | 'warning' | 'info'
  } | null>(null)

  // Resolve actual mounted objects from gameData
  const powerPart = useMemo(() => {
    return gameData.parts.find((p) => p.id === design.powerSystemId)
  }, [design.powerSystemId])

  const antennaPart = useMemo(() => {
    return gameData.parts.find((p) => p.id === design.antennaId)
  }, [design.antennaId])

  const instruments = useMemo(() => {
    return (design.instrumentIds || [])
      .map((id) => gameData.instruments.find((i) => i.id === id))
      .filter((i): i is Instrument => Boolean(i))
  }, [design.instrumentIds])

  // Specific instrument checks for physical visualization
  const hasHighResCamera = design.instrumentIds.includes('camera-highres')
  const hasSpectrometerIR = design.instrumentIds.includes('spectrometer-ir')
  const hasRadarAltimeter = design.instrumentIds.includes('radar-altimeter')
  const hasMagnetometer = design.instrumentIds.includes('mag-plasma')
  const hasThermalRadiometer = design.instrumentIds.includes('thermal-radiometer')
  const hasNeutronSpectrometer = design.instrumentIds.includes('neutron-spectrometer')
  const hasLidar = design.instrumentIds.includes('atmospheric-lidar')
  const hasUVSpectrograph = design.instrumentIds.includes('uv-spectrograph')
  const hasSubsurfaceRadar = design.instrumentIds.includes('subsurface-radar')
  const hasDustAnalyzer = design.instrumentIds.includes('dust-analyzer')


  return (
    <div className={`flex flex-col h-full bg-[#1E293B] rounded-xl border border-[#334155] shadow-none overflow-hidden relative ${className}`}>
      {/* 1. TOP VIEWPORT STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2 border-b border-[#334155] bg-[#1E293B] z-10 font-sans text-xs shrink-0 gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-slate-100 font-bold tracking-normal uppercase text-xs">
            Assembly Viewport · Live Vehicle Schematic
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs hidden sm:inline">Scale: 1:15 Flight Model</span>
        </div>

        <div className="flex items-center gap-2.5">
          {activeRole && (
            <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#273449] text-blue-300 border border-[#334155] capitalize font-semibold">
              Focus: {activeRole}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            {powerPart && antennaPart && instruments.length > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Nominal Configuration
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Assembly Incomplete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN TECHNICAL SVG VIEWPORT */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 overflow-hidden bg-[#111827]">
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
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-[12%] left-[18%] w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-[25%] right-[22%] w-1.5 h-1.5 bg-slate-400 rounded-full" />
          <div className="absolute bottom-[28%] left-[12%] w-1 h-1 bg-slate-400 rounded-full" />
          <div className="absolute top-[68%] right-[14%] w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-[82%] left-[45%] w-1.5 h-1.5 bg-slate-400 rounded-full" />
        </div>

        {/* Interactive SVG Spacecraft (Scaled & Centred with Zero Clipping) */}
        <svg
          viewBox="115 22 730 522"
          className="w-full h-full select-none z-10 transition-transform duration-500"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* Gold Thermal Insulation Foil Pattern (MLI) */}
            <pattern id="gold-mli-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#ca8a04" />
              <path d="M0 8 L8 0 L16 8 L8 16 Z" fill="#eab308" opacity="0.75" />
              <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="#facc15" opacity="0.25" />
              <rect x="0" y="0" width="16" height="16" fill="none" stroke="#a16207" strokeWidth="0.75" />
              <circle cx="8" cy="8" r="1.2" fill="#713f12" />
            </pattern>

            {/* Dark Carbon Composite Texture */}
            <linearGradient id="carbon-bus" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#080d19" />
            </linearGradient>

            {/* Titanium Trusses Gradient */}
            <linearGradient id="titanium-strut" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Silicon Photovoltaic Blue Cell */}
            <linearGradient id="solar-cell-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#075985" />
              <stop offset="25%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>

            {/* UltraFlex Gold Cell */}
            <radialGradient id="ultraflex-gold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="85%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            {/* Glowing RTG Heat Gradient */}
            <linearGradient id="rtg-heat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>

            {/* Parabolic Dish Gradient */}
            <radialGradient id="antenna-dish" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          </defs>

          {/* ========================================================================= */}
          {/* SUBSYSTEM A: SCIENTIFIC SENSORS & BOOMS EXTENDING FROM BUS               */}
          {/* ========================================================================= */}

          {/* 1. Magnetometer Boom (Deployable from Bus bottom-left to (190, 520)) */}
          {hasMagnetometer && (
            <g
              className="deepsky-component-attach cursor-pointer transition-all duration-300 hover:opacity-90"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'mag-plasma',
                  title: 'Triaxial Fluxgate Magnetometer & Plasma Boom',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 50 pts | Mass: 12 kg | Power: 15W',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Articulated Boom Struts */}
              <line x1="390" y1="380" x2="230" y2="455" stroke="#94a3b8" strokeWidth="3.5" />
              <line x1="395" y1="385" x2="235" y2="460" stroke="#475569" strokeWidth="1.5" />
              {/* Lattice cross-bracing */}
              {[0.25, 0.5, 0.75].map((pct, idx) => {
                const x = 390 + (230 - 390) * pct
                const y = 380 + (455 - 380) * pct
                return (
                  <circle key={idx} cx={x} cy={y} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
                )
              })}
              {/* Sensor Spheres and Plasma Ring at Tip */}
              <circle cx="230" cy="455" r="10" fill="#ca8a04" stroke="#eab308" strokeWidth="2" />
              <circle cx="230" cy="455" r="16" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
              <circle cx="218" cy="463" r="4" fill="#38bdf8" />
              {/* Callout Indicator */}
              <text x="210" y="482" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                MAG/PLASMA BOOM
              </text>
            </g>
          )}

          {/* 2. Subsurface Sounding Radar Wire Antennas (SHARAD) */}
          {hasSubsurfaceRadar && (
            <g
              className="cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'subsurface-radar',
                  title: 'Shallow Subsurface Sounding Radar (SHARAD)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 75 pts | Mass: 40 kg | Power: 80W',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <line x1="280" y1="460" x2="680" y2="460" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
              <circle cx="280" cy="460" r="4" fill="#f59e0b" />
              <circle cx="680" cy="460" r="4" fill="#f59e0b" />
              <text x="480" y="475" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                [SHARAD 10m SOUNDING DIPOLE]
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* SUBSYSTEM B: POWER GENERATION WINGS (LEFT & RIGHT OF BUS)                 */}
          {/* ========================================================================= */}

          {/* CASE 1: Standard Deployable Solar Arrays (solar-panel-std) */}
          {design.powerSystemId === 'solar-panel-std' && (
            <g
              className="deepsky-component-attach cursor-pointer transition-transform duration-300"
              onClick={() => onSelectSubsystem?.('engineer')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'solar-panel-std',
                  title: 'Standard Deployable Solar Array (300W)',
                  category: 'Power Subsystem · Engineer',
                  metric: 'Generation: +300W | Mass: 45 kg | Triple Junction PV',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Left Wing Drive & Yoke */}
              <rect x="330" y="295" width="45" height="14" fill="#475569" stroke="#1e293b" />
              <circle cx="345" cy="302" r="5" fill="#06b6d4" />
              {/* Left Solar Panels (3 segmented panels) */}
              <g transform="translate(130, 240)">
                <rect x="0" y="0" width="195" height="124" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                {/* 3 panels with individual cells */}
                {[5, 68, 131].map((offset, idx) => (
                  <g key={idx} transform={`translate(${offset}, 6)`}>
                    <rect width="58" height="112" rx="2" fill="url(#solar-cell-blue)" stroke="#0284c7" strokeWidth="1" />
                    {/* Gridlines */}
                    <line x1="0" y1="28" x2="58" y2="28" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="0" y1="56" x2="58" y2="56" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="0" y1="84" x2="58" y2="84" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="29" y1="0" x2="29" y2="112" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                  </g>
                ))}
                <text x="97" y="136" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  PORT SOLAR WING (150W)
                </text>
              </g>

              {/* Right Wing Drive & Yoke */}
              <rect x="585" y="295" width="45" height="14" fill="#475569" stroke="#1e293b" />
              <circle cx="615" cy="302" r="5" fill="#06b6d4" />
              {/* Right Solar Panels */}
              <g transform="translate(635, 240)">
                <rect x="0" y="0" width="195" height="124" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                {[5, 68, 131].map((offset, idx) => (
                  <g key={idx} transform={`translate(${offset}, 6)`}>
                    <rect width="58" height="112" rx="2" fill="url(#solar-cell-blue)" stroke="#0284c7" strokeWidth="1" />
                    <line x1="0" y1="28" x2="58" y2="28" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="0" y1="56" x2="58" y2="56" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="0" y1="84" x2="58" y2="84" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                    <line x1="29" y1="0" x2="29" y2="112" stroke="#38bdf8" strokeWidth="0.75" opacity="0.6" />
                  </g>
                ))}
                <text x="97" y="136" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  STARBOARD SOLAR WING (150W)
                </text>
              </g>
            </g>
          )}

          {/* CASE 2: UltraFlex Circular Solar Arrays (solar-panel-advanced) */}
          {design.powerSystemId === 'solar-panel-advanced' && (
            <g
              className="deepsky-component-attach cursor-pointer transition-transform duration-300"
              onClick={() => onSelectSubsystem?.('engineer')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'solar-panel-advanced',
                  title: 'UltraFlex High-Efficiency Solar Array (750W)',
                  category: 'Power Subsystem · Engineer',
                  metric: 'Generation: +750W | Mass: 80 kg | Accordion Deployment',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Left UltraFlex Circular Wing */}
              <g transform="translate(230, 302)">
                <line x1="140" y1="0" x2="0" y2="0" stroke="#64748b" strokeWidth="6" />
                <circle cx="0" cy="0" r="95" fill="url(#ultraflex-gold)" stroke="#f59e0b" strokeWidth="2.5" />
                {/* Radial Accordion Gores */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180
                  const x2 = Math.cos(angle) * 95
                  const y2 = Math.sin(angle) * 95
                  return (
                    <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke="#fcd34d" strokeWidth="1.2" opacity="0.7" />
                  )
                })}
                <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="0" cy="0" r="7" fill="#06b6d4" />
                <text x="0" y="115" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  ULTRAFLEX WING (375W)
                </text>
              </g>

              {/* Right UltraFlex Circular Wing */}
              <g transform="translate(730, 302)">
                <line x1="-140" y1="0" x2="0" y2="0" stroke="#64748b" strokeWidth="6" />
                <circle cx="0" cy="0" r="95" fill="url(#ultraflex-gold)" stroke="#f59e0b" strokeWidth="2.5" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180
                  const x2 = Math.cos(angle) * 95
                  const y2 = Math.sin(angle) * 95
                  return (
                    <line key={i} x1="0" y1="0" x2={x2} y2={y2} stroke="#fcd34d" strokeWidth="1.2" opacity="0.7" />
                  )
                })}
                <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="0" cy="0" r="7" fill="#06b6d4" />
                <text x="0" y="115" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  ULTRAFLEX WING (375W)
                </text>
              </g>
            </g>
          )}

          {/* CASE 3: Radioisotope Thermoelectric Generator (RTG) */}
          {(design.powerSystemId === 'rtg-mmrtg' || design.powerSystemId === 'rtg-nextgen') && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('engineer')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: design.powerSystemId,
                  title: powerPart?.name || 'Radioisotope Thermoelectric Generator',
                  category: 'Nuclear Power Subsystem · Engineer',
                  metric: `Generation: +${powerPart?.power || 125}W | Mass: ${powerPart?.mass} kg | Pu-238`,
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Angled Outrigger Boom to Port Side */}
              <line x1="375" y1="280" x2="250" y2="210" stroke="#64748b" strokeWidth="7" />
              <line x1="375" y1="310" x2="250" y2="230" stroke="#475569" strokeWidth="4" />
              {/* Cross-trusses */}
              <line x1="310" y1="250" x2="330" y2="280" stroke="#94a3b8" strokeWidth="2" />

              {/* RTG Cylinder with Cooling Radiator Fins */}
              <g transform="translate(170, 160)">
                {/* Main RTG Housing */}
                <rect x="20" y="15" width="60" height="60" rx="6" fill="url(#rtg-heat)" stroke="#fb923c" strokeWidth="2" />

                {/* Vertical Cooling Fins */}
                {[-10, 0, 10, 20, 30, 40, 50, 60, 70].map((_, i) => (
                  <line
                    key={i}
                    x1={20 + (i * 6.5)}
                    y1="5"
                    x2={20 + (i * 6.5)}
                    y2="85"
                    stroke="#1e293b"
                    strokeWidth="2.5"
                  />
                ))}

                {/* Nuclear Warning Trefoil Symbol Marker */}
                <circle cx="50" cy="45" r="9" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="50" cy="45" r="3" fill="#ea580c" />

                <text x="50" y="102" fill="#fb923c" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {design.powerSystemId === 'rtg-nextgen' ? 'NEXT-GEN NUCLEAR RTG (300W)' : 'MMRTG NUCLEAR UNIT (125W)'}
                </text>
              </g>
            </g>
          )}

          {/* CASE 4: No Power System Mounted (Open Mounting Trunnions) */}
          {!design.powerSystemId && (
            <g
              className="cursor-pointer"
              onClick={() => onSelectSubsystem?.('engineer')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'unmounted-power',
                  title: 'Power Generation System: NOT MOUNTED',
                  category: 'Power Subsystem Requirement · Engineer',
                  metric: 'Spacecraft has 0W generation. Bus avionics will exhaust reserves!',
                  status: 'warning',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Empty Port Trunnion */}
              <rect x="320" y="285" width="55" height="30" rx="4" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="290" y="280" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                [PORT POWER TRUNNION OPEN]
              </text>
              {/* Empty Starboard Trunnion */}
              <rect x="585" y="285" width="55" height="30" rx="4" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="670" y="280" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                [STARBOARD TRUNNION OPEN]
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* SUBSYSTEM C: COMMUNICATIONS ANTENNA (TOP / ZENITH DECK)                   */}
          {/* ========================================================================= */}

          {/* Comms Gimbal Mast */}
          <g transform="translate(480, 195)">
            <rect x="-10" y="0" width="20" height="25" fill="#475569" stroke="#1e293b" />
            <circle cx="0" cy="0" r="8" fill="#64748b" stroke="#06b6d4" strokeWidth="1.5" />
          </g>

          {/* Antenna 1: Low-Gain S-Band Omni (antenna-omni) */}
          {design.antennaId === 'antenna-omni' && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('comms')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'antenna-omni',
                  title: 'Low-Gain S-Band Omni Antenna',
                  category: 'Communications · Comms',
                  metric: 'Bandwidth: 350 MB/day | Mass: 8 kg | Power: 15W',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Dual Mast Whips */}
              <line x1="472" y1="195" x2="445" y2="105" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="488" y1="195" x2="515" y2="105" stroke="#cbd5e1" strokeWidth="3" />
              <circle cx="445" cy="105" r="4.5" fill="#06b6d4" />
              <circle cx="515" cy="105" r="4.5" fill="#06b6d4" />
              {/* Concentric RF Waves */}
              <path d="M 425 90 A 25 25 0 0 1 465 90" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.8" />
              <path d="M 495 90 A 25 25 0 0 1 535 90" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.8" />
              <text x="480" y="80" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                S-BAND OMNI (350 MB/D)
              </text>
            </g>
          )}

          {/* Antenna 2: Medium-Gain X-Band Horn (antenna-mga) */}
          {design.antennaId === 'antenna-mga' && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('comms')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'antenna-mga',
                  title: 'Medium-Gain X-Band Horn Antenna',
                  category: 'Communications · Comms',
                  metric: 'Bandwidth: 750 MB/day | Mass: 20 kg | Power: 30W',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <line x1="480" y1="195" x2="480" y2="140" stroke="#94a3b8" strokeWidth="5" />
              {/* Flared Horn Cone */}
              <polygon points="468,140 492,140 514,88 446,88" fill="#ca8a04" stroke="#eab308" strokeWidth="2" />
              <ellipse cx="480" cy="88" rx="34" ry="10" fill="#1e293b" stroke="#fcd34d" strokeWidth="2" />
              <circle cx="480" cy="88" r="4" fill="#06b6d4" />
              <text x="480" y="68" fill="#fcd34d" fontSize="9" fontFamily="monospace" textAnchor="middle">
                X-BAND MEDIUM-GAIN HORN (750 MB/D)
              </text>
            </g>
          )}

          {/* Antenna 3: High-Gain Parabolic Dish (antenna-hga) */}
          {design.antennaId === 'antenna-hga' && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('comms')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'antenna-hga',
                  title: 'High-Gain Parabolic Reflector Dish (X-Band)',
                  category: 'Communications · Comms',
                  metric: 'Bandwidth: 1,000 MB/day | Mass: 35 kg | Cassegrain Feed',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Articulated Mast */}
              <line x1="480" y1="195" x2="480" y2="145" stroke="#64748b" strokeWidth="6" />
              {/* Parabolic Dish Arc */}
              <g transform="translate(480, 115) rotate(-12)">
                <ellipse cx="0" cy="0" rx="85" ry="32" fill="url(#antenna-dish)" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Grid Mesh Texture */}
                <ellipse cx="0" cy="0" rx="72" ry="24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="0" cy="0" rx="42" ry="14" fill="none" stroke="#64748b" strokeWidth="1" />
                {/* Subreflector Tripod and Feed */}
                <line x1="-55" y1="0" x2="0" y2="-45" stroke="#475569" strokeWidth="2" />
                <line x1="55" y1="0" x2="0" y2="-45" stroke="#475569" strokeWidth="2" />
                <line x1="0" y1="10" x2="0" y2="-45" stroke="#475569" strokeWidth="2" />
                <circle cx="0" cy="-45" r="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Active Carrier Wave Arc */}
                <path d="M -30 -60 A 30 30 0 0 1 30 -60" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
              </g>
              <text x="480" y="42" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CASSEGRAIN HIGH-GAIN DISH (1,000 MB/D)
              </text>
            </g>
          )}

          {/* Antenna 4: Deep Space Optical / Ka-Band Terminal (antenna-ka) */}
          {design.antennaId === 'antenna-ka' && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('comms')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'antenna-ka',
                  title: 'Deep Space Optical / Ka-Band Terminal (DSOC)',
                  category: 'Communications · Comms',
                  metric: 'Bandwidth: 2,500 MB/day | Mass: 55 kg | Optical Laser Downlink',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Steerable Base */}
              <rect x="462" y="155" width="36" height="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {/* Optical Laser Telescope Housing */}
              <g transform="translate(480, 115) rotate(15)">
                <rect x="-18" y="-35" width="36" height="70" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                {/* Laser Aperture Lens */}
                <circle cx="0" cy="-35" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                {/* Secondary Ka-Band Feed */}
                <line x1="22" y1="-10" x2="38" y2="-25" stroke="#f59e0b" strokeWidth="3" />
                <polygon points="38,-25 44,-32 48,-20" fill="#f59e0b" />
                {/* Emitted Laser Beam Pulse */}
                <line x1="0" y1="-35" x2="0" y2="-75" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="8 4" opacity="0.8" />
              </g>
              <text x="480" y="32" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                DEEP SPACE OPTICAL LASER TERMINAL (2,500 MB/D)
              </text>
            </g>
          )}

          {/* Unmounted Antenna Indicator */}
          {!design.antennaId && (
            <g
              className="cursor-pointer"
              onClick={() => onSelectSubsystem?.('comms')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'unmounted-comms',
                  title: 'Telemetry Antenna: NOT MOUNTED',
                  category: 'Communications Requirement · Comms',
                  metric: 'Zero downlink capability. Science data cannot be beamed to Earth!',
                  status: 'warning',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <circle cx="480" cy="150" r="28" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="480" y="115" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                [ZENITH ANTENNA MOUNT OPEN]
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* SUBSYSTEM D: CENTRAL SPACECRAFT BUS (MAIN STRUCTURAL CHASSIS)             */}
          {/* ========================================================================= */}
          <g
            className="cursor-pointer transition-all duration-300"
            onClick={() => onSelectSubsystem?.('engineer')}
            onMouseEnter={() =>
              setHoveredComponent({
                id: 'bus-structure-standard',
                title: 'Composite Honeycomb Primary Structure (100 kg)',
                category: 'Structural Bus · Engineer',
                metric: 'Platform: NASA High-Reliability Deep Space Bus | 30W Base Avionics',
                status: 'nominal',
              })
            }
            onMouseLeave={() => setHoveredComponent(null)}
          >
            {/* Structural Corner Rails & Carbon Composite Frame */}
            <rect x="375" y="215" width="210" height="190" rx="8" fill="url(#carbon-bus)" stroke="#334155" strokeWidth="2.5" />

            {/* Gold Thermal Multi-Layer Insulation (MLI) Center Shield */}
            <rect x="395" y="235" width="170" height="150" rx="4" fill="url(#gold-mli-pattern)" stroke="#a16207" strokeWidth="1.5" />

            {/* Metallic Avionics Service Bays & Radiator Plates */}
            <rect x="415" y="250" width="130" height="50" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
            <line x1="430" y1="265" x2="530" y2="265" stroke="#334155" strokeWidth="1" />
            <line x1="430" y1="275" x2="530" y2="275" stroke="#334155" strokeWidth="1" />
            <line x1="430" y1="285" x2="530" y2="285" stroke="#334155" strokeWidth="1" />

            {/* Central Bus Core Avionics Computer & Status LED */}
            <circle cx="480" cy="275" r="9" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <circle cx="480" cy="275" r="3.5" fill="#60a5fa" />

            {/* Star Tracker Optical Heads (Upper left and right) */}
            <rect x="400" y="222" width="18" height="12" fill="#0f172a" stroke="#94a3b8" />
            <circle cx="409" cy="228" r="3.5" fill="#38bdf8" />
            <rect x="542" y="222" width="18" height="12" fill="#0f172a" stroke="#94a3b8" />
            <circle cx="551" cy="228" r="3.5" fill="#38bdf8" />

            {/* Attitude Control RCS Thruster Quads (4 Corners) */}
            {/* Top-Left */}
            <path d="M 375 225 L 360 220 L 360 230 Z" fill="#94a3b8" stroke="#334155" />
            <path d="M 375 225 L 370 210 L 380 210 Z" fill="#94a3b8" stroke="#334155" />
            {/* Top-Right */}
            <path d="M 585 225 L 600 220 L 600 230 Z" fill="#94a3b8" stroke="#334155" />
            <path d="M 585 225 L 580 210 L 590 210 Z" fill="#94a3b8" stroke="#334155" />
            {/* Bottom-Left */}
            <path d="M 375 395 L 360 390 L 360 400 Z" fill="#94a3b8" stroke="#334155" />
            <path d="M 375 395 L 370 410 L 380 410 Z" fill="#94a3b8" stroke="#334155" />
            {/* Bottom-Right */}
            <path d="M 585 395 L 600 390 L 600 400 Z" fill="#94a3b8" stroke="#334155" />
            <path d="M 585 395 L 580 410 L 590 410 Z" fill="#94a3b8" stroke="#334155" />

            {/* Central Bus ID Stamp */}
            <text x="480" y="325" fill="#ca8a04" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              DEEPSKY EXPLORER-1 BUS
            </text>
            <text x="480" y="340" fill="#a16207" fontSize="8" fontFamily="monospace" textAnchor="middle">
              NASA COMPLIANT AVIONICS PLATFORM
            </text>
          </g>

          {/* ========================================================================= */}
          {/* SUBSYSTEM E: SCIENTIFIC INSTRUMENT PAYLOAD DECK (NADIR DECK: Y 395-530)  */}
          {/* ========================================================================= */}

          {/* Main Nadir Instrument Mounting Deck Shelf */}
          <rect x="360" y="402" width="240" height="14" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          {/* Deck Structural Struts */}
          <line x1="390" y1="416" x2="380" y2="445" stroke="#64748b" strokeWidth="3" />
          <line x1="570" y1="416" x2="580" y2="445" stroke="#64748b" strokeWidth="3" />

          {/* 1. High-Resolution Optical Imager (camera-highres) */}
          {hasHighResCamera && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'camera-highres',
                  title: 'High-Resolution Optical Imager (HiRISE Class)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 90 pts | Mass: 65 kg | Power: 60W | 800 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Primary Telescope Tube */}
              <rect x="455" y="416" width="50" height="75" rx="3" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
              {/* Gold Sunshade Baffle */}
              <polygon points="450,470 510,470 518,505 442,505" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
              {/* Optical Aperture Lens */}
              <ellipse cx="480" cy="505" rx="36" ry="12" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
              <ellipse cx="480" cy="505" rx="16" ry="5" fill="#0284c7" />
              <text x="480" y="530" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                HiRISE IMAGER (90 PTS)
              </text>
            </g>
          )}

          {/* 2. Imaging Infrared Spectrometer (spectrometer-ir) */}
          {hasSpectrometerIR && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'spectrometer-ir',
                  title: 'Imaging Infrared Spectrometer (CRISM Class)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 75 pts | Mass: 33 kg | Power: 45W | 400 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="405" y="416" width="38" height="48" rx="2" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
              {/* Cryocooler Cooling Fins */}
              <line x1="410" y1="428" x2="438" y2="428" stroke="#c084fc" strokeWidth="1" />
              <line x1="410" y1="436" x2="438" y2="436" stroke="#c084fc" strokeWidth="1" />
              <circle cx="424" cy="452" r="7" fill="#7e22ce" stroke="#d8b4fe" />
              <text x="424" y="480" fill="#c084fc" fontSize="8" fontFamily="monospace" textAnchor="middle">
                IR SPEC
              </text>
            </g>
          )}

          {/* 3. Synthetic Aperture Radar (radar-altimeter) */}
          {hasRadarAltimeter && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'radar-altimeter',
                  title: 'Synthetic Aperture Radar & Altimeter (SAR)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 85 pts | Mass: 75 kg | Power: 110W | 600 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="520" y="416" width="55" height="42" rx="2" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
              {/* Planar Microstrip Grid */}
              <line x1="520" y1="426" x2="575" y2="426" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="520" y1="436" x2="575" y2="436" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="520" y1="446" x2="575" y2="446" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="547" cy="437" r="5" fill="#06b6d4" />
              <text x="547" y="475" fill="#22d3ee" fontSize="8" fontFamily="monospace" textAnchor="middle">
                SAR ALTIMETER
              </text>
            </g>
          )}

          {/* 4. Atmospheric Backscatter LIDAR (atmospheric-lidar) */}
          {hasLidar && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'atmospheric-lidar',
                  title: 'Atmospheric Backscatter LIDAR (CALIOP Class)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 80 pts | Mass: 110 kg | Power: 140W | 450 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Dual Telescope Housing */}
              <rect x="365" y="430" width="30" height="40" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="380" cy="460" r="9" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
              <line x1="380" y1="469" x2="380" y2="520" stroke="#34d399" strokeWidth="2" strokeDasharray="4 2" />
              <text x="380" y="535" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="middle">
                LIDAR
              </text>
            </g>
          )}

          {/* 5. Thermal Radiometer (thermal-radiometer) */}
          {hasThermalRadiometer && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'thermal-radiometer',
                  title: 'Multispectral Thermal Infrared Radiometer (Diviner)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 65 pts | Mass: 11 kg | Power: 25W | 200 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="585" y="420" width="28" height="32" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="599" cy="436" r="6" fill="#b45309" stroke="#fcd34d" />
              <text x="599" y="465" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                DIVINER
              </text>
            </g>
          )}

          {/* 6. Epithermal Neutron Spectrometer (neutron-spectrometer) */}
          {hasNeutronSpectrometer && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'neutron-spectrometer',
                  title: 'Epithermal Neutron & Gamma-Ray Detector (LEND)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 70 pts | Mass: 25 kg | Power: 30W | 150 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="365" y="340" width="18" height="42" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="374" cy="350" r="3" fill="#38bdf8" />
              <circle cx="374" cy="370" r="3" fill="#38bdf8" />
              <text x="350" y="365" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">
                LEND
              </text>
            </g>
          )}

          {/* 7. UV Spectrograph (uv-spectrograph) */}
          {hasUVSpectrograph && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'uv-spectrograph',
                  title: 'Imaging Ultraviolet Spectrograph (IUVS Class)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 60 pts | Mass: 16 kg | Power: 20W | 180 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="575" y="340" width="18" height="38" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
              <circle cx="584" cy="358" r="4" fill="#6366f1" />
              <text x="610" y="360" fill="#818cf8" fontSize="8" fontFamily="monospace">
                UV SPEC
              </text>
            </g>
          )}

          {/* 8. Cosmic Dust Analyzer (dust-analyzer) */}
          {hasDustAnalyzer && (
            <g
              className="deepsky-component-attach cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'dust-analyzer',
                  title: 'Cosmic & Interplanetary Dust Analyzer (CDA)',
                  category: 'Scientific Payload · Science',
                  metric: 'Yield: 55 pts | Mass: 17 kg | Power: 18W | 90 MB/day',
                  status: 'nominal',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {/* Conical Impact Cup */}
              <polygon points="400,215 425,215 418,185 407,185" fill="#ca8a04" stroke="#fcd34d" strokeWidth="1.5" />
              <ellipse cx="412" cy="185" rx="8" ry="3" fill="#0f172a" stroke="#eab308" />
              <text x="412" y="175" fill="#fcd34d" fontSize="8" fontFamily="monospace" textAnchor="middle">
                CDA DUST
              </text>
            </g>
          )}

          {/* If No Instruments Mounted */}
          {instruments.length === 0 && (
            <g
              className="cursor-pointer"
              onClick={() => onSelectSubsystem?.('science')}
              onMouseEnter={() =>
                setHoveredComponent({
                  id: 'no-instruments',
                  title: 'Science Payload Bay: EMPTY',
                  category: 'Scientific Sensors · Science',
                  metric: 'Zero sensors installed. Mission science quota cannot be satisfied!',
                  status: 'warning',
                })
              }
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <rect x="420" y="420" width="120" height="35" rx="4" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="480" y="442" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">
                [PAYLOAD DECK EMPTY: + ADD SENSORS]
              </text>
            </g>
          )}
        </svg>

        {/* 3. DYNAMIC HOVER CALLOUT POPUP OVER SATELLITE */}
        {hoveredComponent && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#1E293B] border border-[#334155] rounded-xl p-3.5 shadow-lg backdrop-blur-md z-30 font-sans transition-all">
            <div className="flex items-center justify-between gap-2 border-b border-[#334155] pb-1.5 mb-1.5">
              <span className="text-xs text-blue-400 font-semibold">
                {hoveredComponent.category}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  hoveredComponent.status === 'nominal'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}
              >
                {hoveredComponent.status === 'nominal' ? 'Installed · Nominal' : 'Action Required'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
              <span className="font-bold text-slate-100">{hoveredComponent.title}</span>
              <span className="text-slate-300 text-xs font-mono">{hoveredComponent.metric}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Click component to jump directly to its workstation controls →
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
