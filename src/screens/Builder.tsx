// Owner: B. Spacecraft assembly and subsystem builder workstation.
// PROJECT DEEPSKY: Fixed-Height Engineering Workstation & Persistent Resource Telemetry HUD
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Role, Instrument, Part } from '@/shared/types'
import { gameData } from '@/data'
import { computeTotals, checkDesign, computeEffectiveDownlink, getAttenuationFactor } from '@/engine'
import { canEdit, useTeamStore } from '@/team'
import { useDesignStore } from '@/shared/designStore'
import { ResourceBars } from './components/ResourceBars'
import { RoleTabs } from './components/RoleTabs'
import { PartCard } from './components/PartCard'
import { Tooltip } from './components/Tooltip'
import { SpacecraftAssembly } from './components/SpacecraftAssembly'

export interface BuilderProps {
  /** Optional assigned player role when operating within a multiplayer session */
  assignedRole?: Role
}

export function Builder({ assignedRole }: BuilderProps = {}) {
  const navigate = useNavigate()
  const { design, patchDesign, resetApprovals } = useDesignStore()

  // Team store: mode and actual claimed role (used in online/local team modes)
  const teamMode = useTeamStore((s) => s.mode)
  const teamRole = useTeamStore((s) => s.myRole)

  // Active viewing subsystem tab (default: Science to immediately pick instruments)
  const [activeRole, setActiveRole] = useState<Role>(assignedRole || 'science')

  // Optional role simulation for testing multiplayer permissions in solo mode
  const [simulatedRole] = useState<Role | 'solo'>('solo')

  // In team mode (online or local), use the actual claimed team role.
  const effectiveRole: Role | undefined =
    assignedRole ??
    ((teamMode === 'online' || teamMode === 'local') && teamRole ? teamRole : undefined) ??
    (simulatedRole === 'solo' ? undefined : simulatedRole)

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


  const mountedInstruments = useMemo(() => {
    return (design.instrumentIds || [])
      .map((id) => gameData.instruments.find((i) => i.id === id))
      .filter((i): i is Instrument => Boolean(i))
  }, [design.instrumentIds])

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
    return mountedInstruments.reduce((sum, inst) => sum + inst.scienceValue, 0)
  }, [mountedInstruments])

  // Downlink telemetry calculations (shared physics with engine comms budget)
  const commsAttenuation = useMemo(() => {
    return getAttenuationFactor(currentOrbit, currentMission)
  }, [currentOrbit, currentMission])

  const effectiveDownlink = useMemo(() => {
    return computeEffectiveDownlink(totals.downlinkPerDay, currentOrbit, currentMission)
  }, [totals.downlinkPerDay, currentOrbit, currentMission])

  const isCommsSufficient = effectiveDownlink >= totals.dataPerDay && totals.downlinkPerDay > 0

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

  // If no mission is chosen, prompt user to select a flight baseline
  if (!currentMission) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-mono">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans text-slate-100">
            NO ACTIVE FLIGHT MISSION SELECTED
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
            A target flight mission is required to establish mass budgets, science baselines, and thermal constraints.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm inline-block shadow-none transition-colors border border-blue-500"
          >
            ← Return to Mission Catalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1780px] w-full mx-auto flex flex-col xl:h-full min-h-0 space-y-2.5 font-sans text-slate-100 xl:overflow-hidden pb-12 xl:pb-0">
      {/* ========================================================================= */}
      {/* 1. COMPACT MISSION CONTEXT HEADER                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#334155] pb-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <span className="text-base sm:text-lg font-bold font-sans tracking-normal text-slate-100">
            {currentMission.name}
          </span>
          <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded bg-[#273449] text-slate-200 border border-[#334155]">
            Level {currentMission.level} · Budget: ${currentMission.budget}M
          </span>
          <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded bg-[#273449] text-purple-300 border border-purple-800/40">
            Required Science: ≥{currentMission.minScience} pts
          </span>
        </div>

        {/* Workstation Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-lg bg-[#273449] hover:bg-[#334155] text-slate-200 hover:text-white border border-[#334155] text-sm font-sans font-semibold transition-colors"
          >
            Switch Mission
          </Link>

          <button
            type="button"
            onClick={() => navigate('/orbit-rocket')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm tracking-normal transition-colors flex items-center gap-2 cursor-pointer border border-blue-500 shadow-none"
          >
            <span>Proceed to Orbit & Rocket</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-PANEL ARCHITECTURE WORKSPACE                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-row gap-3.5 items-stretch xl:overflow-hidden">
        {/* ========================================================================= */}
        {/* PANEL 1: LEFT TELEMETRY HUD (~22% WIDTH ON DESKTOP)                       */}
        {/* ========================================================================= */}
        <div className="order-2 md:col-span-1 xl:order-1 xl:w-[22%] xl:flex-[22_22_0%] flex flex-col xl:h-full min-h-0 xl:overflow-hidden shrink-0">
          <ResourceBars
            totals={totals}
            checks={checks}
            mission={currentMission}
            rocket={currentRocket}
            orbit={currentOrbit}
            lifetimeMonths={design.lifetimeMonths}
            layout="sidebar"
            className="xl:h-full"
          />
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: CENTRE LIVE SPACECRAFT VISUALIZATION (~45% WIDTH ON DESKTOP)     */}
        {/* ========================================================================= */}
        <div className="order-1 md:col-span-2 xl:order-2 xl:w-[45%] xl:flex-[45_45_0%] flex flex-col h-[380px] sm:h-[440px] md:h-[480px] xl:h-full min-h-0 overflow-hidden shrink-0 xl:shrink">
          <SpacecraftAssembly
            design={design}
            onSelectSubsystem={(subsystem) => setActiveRole(subsystem)}
            activeRole={activeRole}
            className="h-full flex-1 min-h-0"
          />
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: RIGHT COMPONENT SELECTION (~33% WIDTH ON DESKTOP)                */}
        {/* ========================================================================= */}
        <div className="order-3 md:col-span-1 xl:order-3 xl:w-[33%] xl:flex-[33_33_0%] flex flex-col bg-[#1E293B] border border-[#334155] rounded-xl xl:overflow-hidden shadow-none min-h-0 shrink-0 xl:h-full">
          {/* Subsystem Role Tabs Bar (Fixed/Sticky at top of right panel) */}
          <div className="p-2.5 border-b border-[#334155] bg-[#1E293B] shrink-0 sticky top-0 z-10">
            <RoleTabs
              activeRole={activeRole}
              onSelect={(role) => setActiveRole(role)}
              userRole={effectiveRole}
              className="w-full"
            />
          </div>

          {/* Subsystem Hardware Module Panel */}
          <div className="p-3 space-y-3 xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar">
            {/* ===================== SCIENCE ROLE ===================== */}
            {activeRole === 'science' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#334155] pb-3">
                  <div>
                    <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                      <span>Scientific Payload Sensors</span>
                      <Tooltip termKey="downlink">
                        <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Def</span>
                      </Tooltip>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                      Select observational sensors. Modules attach directly to the nadir deck.
                    </p>
                  </div>

                  {/* Cumulative Science Metric Annunciator */}
                  <div className="bg-[#273449] border border-purple-800/40 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shrink-0">
                    <div>
                      <span className="text-xs text-purple-300 font-sans block font-semibold">Science Yield</span>
                      <span className="text-base font-bold font-mono text-slate-100">
                        {totalScienceYield} <span className="text-xs text-slate-400 font-sans font-normal">/ {currentMission.minScience} pts</span>
                      </span>
                    </div>
                    <span
                      className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
                        totalScienceYield >= currentMission.minScience
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {totalScienceYield >= currentMission.minScience ? 'SATISFIED' : 'DEFICIT'}
                    </span>
                  </div>
                </div>

                {gameData.instruments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">
                    NO INSTRUMENTS AVAILABLE IN REGISTRY.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {gameData.instruments.map((inst: Instrument) => {
                      const isSelected = design.instrumentIds.includes(inst.id)
                      return (
                        <PartCard
                          key={inst.id}
                          item={inst}
                          selected={isSelected}
                          disabled={!isAuthorizedToEdit}
                          disabledReason={!isAuthorizedToEdit ? 'Station locked: requires Science Lead authorization' : undefined}
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
              <div className="space-y-4">
                <div className="border-b border-[#334155] pb-3">
                  <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                    <span>Spacecraft Power & Bus Systems</span>
                    <Tooltip text="Solar arrays and RTGs provide electrical power to run flight computers and science payloads.">
                      <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Def</span>
                    </Tooltip>
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                    Configure primary electrical power generation (Solar Arrays or RTG). Selected systems deploy visibly on the assembly viewport.
                  </p>
                </div>

                {/* Power Systems List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-sans font-semibold text-amber-400">
                      Primary Power Generation Subsystem
                    </h3>
                    <span className="text-xs font-sans text-slate-400">
                      {design.powerSystemId ? '1 Subsystem Mounted' : 'No Subsystem Mounted'}
                    </span>
                  </div>

                  {powerParts.length === 0 ? (
                    <div className="p-6 bg-[#273449] rounded-lg border border-[#334155] text-center text-slate-500 font-mono text-xs">
                      NO POWER GENERATION SUBSYSTEMS REGISTERED.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {powerParts.map((part: Part) => {
                        const isSelected = design.powerSystemId === part.id
                        return (
                          <PartCard
                            key={part.id}
                            item={part}
                            selected={isSelected}
                            disabled={!isAuthorizedToEdit}
                            disabledReason={!isAuthorizedToEdit ? 'Station locked: requires Engineer authorization' : undefined}
                            onToggle={() => handleSelectPowerSystem(part.id)}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Spacecraft Chassis Architecture Notice */}
                <div className="border-t border-[#334155] pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-sans font-semibold text-slate-200">
                        Primary Spacecraft Chassis Baseline
                      </h3>
                      <Tooltip text="The flight model integrates standard composite bus chassis directly into baseline dry mass calculations.">
                        <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Note</span>
                      </Tooltip>
                    </div>
                    <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded bg-[#273449] text-slate-300 border border-[#334155]">
                      100 kg Fixed Bus
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#273449]/60 rounded-lg border border-[#334155] text-xs font-sans text-slate-300 leading-relaxed">
                    Primary structural composite chassis mass (100 kg) is integrated directly into core spacecraft avionics baselines.
                  </div>

                  {structureParts.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {structureParts.map((part: Part) => (
                        <PartCard
                          key={part.id}
                          item={part}
                          selected={false}
                          disabled={true}
                          disabledReason="Platform architecture model integrates baseline structure mass directly into dry mass"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================== COMMS ROLE ===================== */}
            {activeRole === 'comms' && (
              <div className="space-y-4">
                <div className="border-b border-[#334155] pb-3">
                  <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                    <span>Communications & Telemetry Subsystem</span>
                    <Tooltip termKey="downlink">
                      <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Def</span>
                    </Tooltip>
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                    Mount a high-gain antenna or optical terminal to maintain continuous downlink with NASA Deep Space Network ground dishes.
                  </p>
                </div>

                {/* Downlink vs Generation Telemetry Meter */}
                <div className="bg-[#273449] border border-[#334155] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shadow-none">
                  <div>
                    <span className="text-slate-400 text-xs font-sans block">Generation Load:</span>
                    <span className="text-sm font-bold font-mono text-slate-200">{totals.dataPerDay} MB/day</span>
                  </div>
                  <div className="text-slate-500 hidden sm:block font-bold">➔</div>
                  <div>
                    <span className="text-slate-400 text-xs font-sans block">
                      {commsAttenuation < 1.0 ? 'Effective Downlink:' : 'Downlink Bandwidth:'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-sm font-bold font-mono ${isCommsSufficient ? 'text-blue-400' : 'text-red-400'}`}>
                        {effectiveDownlink.toLocaleString()} MB/day
                      </span>
                      {commsAttenuation < 1.0 && totals.downlinkPerDay > 0 && (
                        <span className="text-[11px] font-sans text-slate-400">
                          (Raw: {totals.downlinkPerDay.toLocaleString()} MB/d, -30% Mars)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
                        isCommsSufficient
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {isCommsSufficient ? 'BANDWIDTH SUFFICIENT' : 'BUFFER OVERFLOW RISK'}
                    </span>
                  </div>
                </div>

                {/* Antenna Grid */}
                {antennaParts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">
                    NO ANTENNA HARDWARE LOGGED IN REGISTRY.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {antennaParts.map((part: Part) => {
                      const isSelected = design.antennaId === part.id
                      return (
                        <PartCard
                          key={part.id}
                          item={part}
                          selected={isSelected}
                          disabled={!isAuthorizedToEdit}
                          disabledReason={!isAuthorizedToEdit ? 'Station locked: requires Comms Officer authorization' : undefined}
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
              <div className="space-y-4">
                <div className="border-b border-[#334155] pb-3">
                  <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                    <span>Mission Architecture & Lifetime Planning</span>
                    <Tooltip text="Mission duration directly scales spacecraft consumables, radiation exposure, and life-cycle science returns.">
                      <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Parameters</span>
                    </Tooltip>
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-sans leading-relaxed">
                    Establish operational mission flight duration. Balance orbital survivability against component degradation and budget limits.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Lifetime Configuration Panel */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#273449] border border-[#334155] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                      <h3 className="text-xs font-sans font-semibold text-slate-200">
                        Operational Flight Lifespan Slider
                      </h3>
                      <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#1E293B] text-blue-300 border border-blue-800/60 font-semibold">
                        PLANNED DURATION
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-sans">Mission Lifetime:</span>
                      <span className="text-xl font-bold font-mono text-blue-400">
                        {design.lifetimeMonths} <span className="text-xs font-normal text-slate-400 font-sans">months</span>
                      </span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min={minLifetimeMonths}
                      max={maxLifetimeMonths}
                      step={3}
                      value={design.lifetimeMonths}
                      disabled={!isAuthorizedToEdit}
                      onChange={(e) => handleLifetimeChange(Number(e.target.value))}
                      aria-label="Mission Lifetime slider"
                      className="w-full accent-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <div className="flex justify-between text-xs font-sans text-slate-400">
                      <span>{minLifetimeMonths} mo (Min)</span>
                      <span className="text-slate-200 font-bold">Requirement: {currentMission.lifetimeMonths} mo</span>
                      <span>{maxLifetimeMonths} mo (Extended)</span>
                    </div>

                    {design.lifetimeMonths < currentMission.lifetimeMonths && (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-sans text-rose-300">
                        ⚠ Configured duration does not meet the minimum mission requirement of {currentMission.lifetimeMonths} months.
                      </div>
                    )}
                  </div>

                  {/* Reset Actions */}
                  <div className="pt-1">
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
                      className="w-full py-2.5 px-4 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-900/60 text-sm font-sans font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Reset All Subsystem Components to Baseline
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
