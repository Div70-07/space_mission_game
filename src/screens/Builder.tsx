// Owner: B. Spacecraft assembly and subsystem builder workstation.
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Role, Instrument, Part } from '@/shared/types'
import { gameData } from '@/data'
import { computeTotals, checkDesign } from '@/engine'
import { canEdit } from '@/team'
import { useDesignStore } from '@/shared/designStore'
import { ResourceBars } from './components/ResourceBars'
import { RoleTabs } from './components/RoleTabs'
import { PartCard } from './components/PartCard'
import { Tooltip } from './components/Tooltip'

export interface BuilderProps {
  /** Optional assigned player role when operating within a multiplayer session */
  assignedRole?: Role
}

export function Builder({ assignedRole }: BuilderProps = {}) {
  const navigate = useNavigate()
  const { design, patchDesign, resetApprovals } = useDesignStore()

  // Active viewing subsystem tab
  const [activeRole, setActiveRole] = useState<Role>(assignedRole || 'science')

  // Optional role simulation for testing multiplayer permissions in solo mode
  const [simulatedRole, setSimulatedRole] = useState<Role | 'solo'>('solo')

  // In actual multiplayer mode (assignedRole supplied), assignedRole strictly governs permissions.
  // In solo mode, local simulation allows testing each role perspective.
  const effectiveRole = assignedRole ?? (simulatedRole === 'solo' ? undefined : simulatedRole)
  const isAuthorizedToEdit = effectiveRole ? canEdit(effectiveRole, activeRole) : true

  // Find active mission from catalog
  const currentMission = useMemo(() => {
    return gameData.missions.find((m) => m.id === design.missionId)
  }, [design.missionId])

  // Dynamic lifetime slider constraints based on mission parameters
  const minLifetimeMonths = useMemo(() => {
    return Math.min(6, currentMission?.lifetimeMonths ?? 6)
  }, [currentMission])

  const maxLifetimeMonths = useMemo(() => {
    return Math.max(60, (currentMission?.lifetimeMonths ?? 12) * 1.5)
  }, [currentMission])

  // Real-time physics engine calculations
  const totals = useMemo(() => {
    return computeTotals(design, gameData)
  }, [design])

  const checks = useMemo(() => {
    return checkDesign(design, gameData)
  }, [design])

  // Resolve target orbit and rocket if previously chosen
  const currentOrbit = useMemo(() => {
    return gameData.orbits.find((o) => o.id === design.orbitId)
  }, [design.orbitId])

  const currentRocket = useMemo(() => {
    return gameData.rockets.find((r) => r.id === design.rocketId)
  }, [design.rocketId])

  // Filter parts catalog by subsystem kind
  const powerParts = useMemo(() => {
    return gameData.parts.filter((p) => p.kind === 'power')
  }, [])

  const antennaParts = useMemo(() => {
    return gameData.parts.filter((p) => p.kind === 'antenna')
  }, [])

  const structureParts = useMemo(() => {
    return gameData.parts.filter((p) => p.kind === 'structure')
  }, [])

  // Calculate cumulative science yield from mounted instruments
  const totalScienceYield = useMemo(() => {
    return design.instrumentIds.reduce((sum, id) => {
      const inst = gameData.instruments.find((i) => i.id === id)
      return sum + (inst?.scienceValue ?? 0)
    }, 0)
  }, [design.instrumentIds])

  // Selection handlers
  const handleToggleInstrument = (instId: string) => {
    if (!isAuthorizedToEdit) return
    const isSelected = design.instrumentIds.includes(instId)
    const newIds = isSelected
      ? design.instrumentIds.filter((id) => id !== instId)
      : [...design.instrumentIds, instId]

    patchDesign({ instrumentIds: newIds })
    resetApprovals()
  }

  const handleSelectPowerSystem = (partId: string) => {
    if (!isAuthorizedToEdit) return
    const newId = design.powerSystemId === partId ? '' : partId
    patchDesign({ powerSystemId: newId })
    resetApprovals()
  }

  const handleSelectAntenna = (partId: string) => {
    if (!isAuthorizedToEdit) return
    const newId = design.antennaId === partId ? '' : partId
    patchDesign({ antennaId: newId })
    resetApprovals()
  }

  const handleLifetimeChange = (months: number) => {
    if (!isAuthorizedToEdit) return
    patchDesign({ lifetimeMonths: Math.max(1, months) })
    resetApprovals()
  }

  // If no mission is chosen, redirect or prompt user
  if (!currentMission) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-mono">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-mono text-slate-100">
            NO ACTIVE FLIGHT MISSION SELECTED
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            A target flight mission is required to establish mass budgets, science baselines, and thermal constraints.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg font-mono text-sm transition-all cursor-pointer"
          >
            ← Return to Mission Catalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. TOP HEADER SECTION */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              MISSION TARGET: {currentMission.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              LEVEL {currentMission.level} // ${currentMission.budget}M BUDGET
            </span>
          </div>

          <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            SPACECRAFT ASSEMBLY WORKSTATION
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            {currentMission.goal}
          </p>
        </div>

        {/* Actions & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Switch Mission
          </Link>

          <button
            type="button"
            onClick={() => navigate('/orbit-rocket')}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-5 py-2 rounded-lg font-mono text-xs shadow-md shadow-teal-950/50 transition-all cursor-pointer"
          >
            <span>Proceed to Orbit & Rocket</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. RESOURCE TELEMETRY DASHBOARD */}
      <ResourceBars
        totals={totals}
        checks={checks}
        mission={currentMission}
        rocket={currentRocket}
        orbit={currentOrbit}
        lifetimeMonths={design.lifetimeMonths}
      />

      {/* 3. SUBSYSTEM ROLE NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <RoleTabs
          activeRole={activeRole}
          onSelect={(role) => setActiveRole(role)}
          userRole={effectiveRole}
          className="flex-1"
        />

        {/* Multiplayer Role Display / Solo Simulator Switcher */}
        {assignedRole ? (
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-teal-800/60 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-slate-400">Assigned Role:</span>
            <span className="text-teal-300 font-bold uppercase">{assignedRole}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Mode:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value as Role | 'solo')}
              aria-label="Engineering Mode Selector"
              className="bg-slate-900 text-teal-300 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-teal-400"
            >
              <option value="solo">Solo Architect (All Roles)</option>
              <option value="planner">Role: Planner</option>
              <option value="engineer">Role: Engineer</option>
              <option value="science">Role: Science Lead</option>
              <option value="comms">Role: Comms Officer</option>
            </select>
          </div>
        )}
      </div>

      {/* Role Permission Alert if locked */}
      {!isAuthorizedToEdit && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 flex items-center gap-3 text-amber-300 text-xs font-mono">
          <span className="text-base">🔒</span>
          <div>
            <span className="font-semibold uppercase block">Subsystem Locked by Team Access Policy</span>
            <span className="text-amber-400/90 text-[11px]">
              Your assigned role is <strong>{effectiveRole}</strong>. Only the <strong>{activeRole}</strong> specialist is authorized to configure this subsystem.
            </span>
          </div>
        </div>
      )}

      {/* 4. MAIN SUBSYSTEM SELECTION PANELS */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 min-h-[420px]">
        {/* ===================== SCIENCE ROLE ===================== */}
        {activeRole === 'science' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
                  <span>SCIENTIFIC PAYLOAD INSTRUMENTS</span>
                  <Tooltip termKey="downlink">
                    <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
                  </Tooltip>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select research instruments to meet your primary mission objectives. Balance science yield against power draw and data downlink limitations.
                </p>
              </div>

              {/* Science Metric Badge */}
              <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg px-4 py-2 flex items-center gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-purple-300 uppercase block">Total Science Yield</span>
                  <span className="text-lg font-bold text-purple-200">
                    {totalScienceYield} / {currentMission.minScience} pts
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${totalScienceYield >= currentMission.minScience ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                  {totalScienceYield >= currentMission.minScience ? 'SATISFIED' : 'DEFICIT'}
                </span>
              </div>
            </div>

            {gameData.instruments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                NO INSTRUMENTS AVAILABLE IN REGISTRY.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameData.instruments.map((inst: Instrument) => {
                  const isSelected = design.instrumentIds.includes(inst.id)
                  return (
                    <PartCard
                      key={inst.id}
                      item={inst}
                      selected={isSelected}
                      disabled={!isAuthorizedToEdit}
                      disabledReason={!isAuthorizedToEdit ? 'Editing locked by role policy' : undefined}
                      onToggle={() => handleToggleInstrument(inst.id)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== ENGINEER ROLE ===================== */}
        {activeRole === 'engineer' && (
          <div className="space-y-8">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
                <span>SPACECRAFT POWER & BUS SYSTEMS</span>
                <Tooltip text="Solar arrays and RTGs provide electrical power to run flight computers and science payloads.">
                  <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
                </Tooltip>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an electrical power system (Solar Arrays or RTG) sized to satisfy cumulative payload electrical requirements during all orbital phases.
              </p>
            </div>

            {/* Power Systems Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
                  Primary Power Generation
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {design.powerSystemId ? '1 Power System Mounted' : 'No System Mounted'}
                </span>
              </div>

              {powerParts.length === 0 ? (
                <div className="p-6 bg-slate-900/40 rounded border border-slate-800 text-center text-slate-500 font-mono text-xs">
                  NO POWER GENERATION SUBSYSTEMS REGISTERED.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {powerParts.map((part: Part) => {
                    const isSelected = design.powerSystemId === part.id
                    return (
                      <PartCard
                        key={part.id}
                        item={part}
                        selected={isSelected}
                        disabled={!isAuthorizedToEdit}
                        disabledReason={!isAuthorizedToEdit ? 'Editing locked by role policy' : undefined}
                        onToggle={() => handleSelectPowerSystem(part.id)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Structure Components (Catalog View) */}
            <div className="border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                    Spacecraft Bus & Structural Chassis
                  </h3>
                  <Tooltip text="The shared Design interface integrates baseline structural chassis directly into dry mass calculations rather than separate selectable modules.">
                    <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
                  </Tooltip>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Architectural Reference
                </span>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/70 mb-4 text-xs font-mono text-slate-400">
                <p>
                  ℹ <strong>Platform Architecture Notice:</strong> The flight vehicle framework integrates primary structural mass directly into the core bus. Discrete chassis selection is not partitioned in the current flight design model.
                </p>
              </div>

              {structureParts.length === 0 ? (
                <div className="p-4 bg-slate-900/20 rounded border border-slate-800/50 text-slate-500 font-mono text-xs">
                  Standard modular bus chassis is actively integrated into baseline dry mass calculations.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {structureParts.map((part: Part) => (
                    <PartCard
                      key={part.id}
                      item={part}
                      selected={false}
                      disabled={true}
                      disabledReason="Platform architecture model integrates structural mass directly into dry mass baselines"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== COMMS ROLE ===================== */}
        {activeRole === 'comms' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
                <span>COMMUNICATIONS & TELEMETRY SUBSYSTEM</span>
                <Tooltip termKey="downlink">
                  <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
                </Tooltip>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mount a high-gain antenna or parabolic dish to establish ground links with NASA Deep Space Network (DSN) and Earth tracking stations.
              </p>
            </div>

            {/* Downlink vs Generation Meter */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Instrument Generation Rate:</span>
                <span className="text-sm font-bold text-slate-200">{totals.dataPerDay} MB/day</span>
              </div>
              <div className="text-slate-500 hidden sm:block">➔</div>
              <div>
                <span className="text-slate-400 block mb-0.5">Antenna Downlink Bandwidth:</span>
                <span className={`text-sm font-bold ${totals.downlinkPerDay >= totals.dataPerDay ? 'text-teal-300' : 'text-rose-400'}`}>
                  {totals.downlinkPerDay} MB/day
                </span>
              </div>
              <div>
                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${totals.downlinkPerDay >= totals.dataPerDay ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                  {totals.downlinkPerDay >= totals.dataPerDay ? 'BANDWIDTH SUFFICIENT' : 'BUFFER OVERFLOW RISK'}
                </span>
              </div>
            </div>

            {/* Antenna Grid */}
            {antennaParts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                NO ANTENNA HARDWARE LOGGED IN REGISTRY.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {antennaParts.map((part: Part) => {
                  const isSelected = design.antennaId === part.id
                  return (
                    <PartCard
                      key={part.id}
                      item={part}
                      selected={isSelected}
                      disabled={!isAuthorizedToEdit}
                      disabledReason={!isAuthorizedToEdit ? 'Editing locked by role policy' : undefined}
                      onToggle={() => handleSelectAntenna(part.id)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== PLANNER ROLE ===================== */}
        {activeRole === 'planner' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
                <span>MISSION ARCHITECTURE & LIFETIME PLANNING</span>
                <Tooltip text="Mission duration directly scales spacecraft consumables, radiation exposure, and life-cycle science returns.">
                  <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
                </Tooltip>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Balance target operational lifespan against component degradation, thermal margins, and total project expenditure.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lifetime Configuration Panel */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Operational Flight Duration
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 font-mono">Mission Lifetime:</span>
                  <span className="text-2xl font-bold font-mono text-teal-300">
                    {design.lifetimeMonths} <span className="text-sm font-normal text-slate-400">months</span>
                  </span>
                </div>

                <input
                  type="range"
                  min={minLifetimeMonths}
                  max={maxLifetimeMonths}
                  step={3}
                  value={design.lifetimeMonths}
                  disabled={!isAuthorizedToEdit}
                  onChange={(e) => handleLifetimeChange(Number(e.target.value))}
                  aria-label="Mission Lifetime slider"
                  className="w-full accent-teal-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{minLifetimeMonths} mo (Minimal)</span>
                  <span className="text-slate-300 font-bold">Requirement: {currentMission.lifetimeMonths} mo</span>
                  <span>{maxLifetimeMonths} mo (Extended)</span>
                </div>

                {design.lifetimeMonths < currentMission.lifetimeMonths && (
                  <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded border border-rose-900/60">
                    ⚠ Configured duration does not meet the minimum mission requirement of {currentMission.lifetimeMonths} months.
                  </p>
                )}
              </div>

              {/* Design Manifest Summary */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Spacecraft Configuration Manifest
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payload Instruments:</span>
                    <span className="text-slate-200 font-semibold">{design.instrumentIds.length} mounted</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Power Subsystem:</span>
                    <span className="text-slate-200">
                      {design.powerSystemId
                        ? gameData.parts.find((p) => p.id === design.powerSystemId)?.name || 'Selected'
                        : 'None mounted'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Telemetry Antenna:</span>
                    <span className="text-slate-200">
                      {design.antennaId
                        ? gameData.parts.find((p) => p.id === design.antennaId)?.name || 'Selected'
                        : 'None mounted'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Capital Expenditure:</span>
                    <span className={`font-semibold ${totals.cost > currentMission.budget ? 'text-rose-400' : 'text-teal-300'}`}>
                      ${totals.cost}M / ${currentMission.budget}M
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      patchDesign({
                        instrumentIds: [],
                        powerSystemId: '',
                        antennaId: '',
                        lifetimeMonths: currentMission.lifetimeMonths,
                      })
                      resetApprovals()
                    }}
                    disabled={!isAuthorizedToEdit}
                    className="w-full text-xs font-mono text-slate-400 hover:text-rose-300 bg-slate-950 p-2 rounded border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Current Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM NAVIGATION BAR */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
        <Link
          to="/"
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Mission Selection</span>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/orbit-rocket')}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg font-mono text-sm shadow-lg shadow-teal-950/60 transition-all cursor-pointer"
        >
          <span>Proceed to Orbit & Rocket Selection</span>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
