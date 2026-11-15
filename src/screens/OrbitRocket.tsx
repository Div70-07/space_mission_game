// Owner: B. Orbit selection, launch vehicle integration, and flight sign-off workstation.
// COSMOCRAFT: Three-Panel Aerospace Engineering Workstation
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Role, Orbit, Rocket } from '@/shared/types'
import { RESOURCE_UNITS } from '@/shared/constants'
import { useDesignStore } from '@/shared/designStore'
import { gameData } from '@/data'
import { computeTotals, checkDesign, requiredDeltaV, availableDeltaV, runMission } from '@/engine'
import { ApproveGate, canEdit, useTeamStore } from '@/team'
import { getRequiredRoles, areRolesApproved } from './approval'
import { Tooltip } from './components/Tooltip'
import { RocketOrbitVisualizer } from './components/RocketOrbitVisualizer'
import { FlightTelemetryHud } from './components/FlightTelemetryHud'
import { resolveDestination } from './MissionExecution'

export interface OrbitRocketProps {
  /** Optional assigned player role when operating within a multiplayer session */
  assignedRole?: Role
}

export type OrbitRocketTab = 'orbit' | 'rocket' | 'propulsion' | 'signoff'

export function OrbitRocket({ assignedRole }: OrbitRocketProps = {}) {
  const navigate = useNavigate()
  const { design, patchDesign, resetApprovals } = useDesignStore()

  // Active configuration tab in right panel
  const [activeTab, setActiveTab] = useState<OrbitRocketTab>('orbit')

  // Team store: mode, actual claimed role, and players registry
  const teamMode = useTeamStore((s) => s.mode)
  const teamRole = useTeamStore((s) => s.myRole)
  const players = useTeamStore((s) => s.players)

  // In team mode (online/local), use claimed role unless assignedRole is explicitly passed.
  const effectiveRole: Role | undefined =
    assignedRole ??
    ((teamMode === 'online' || teamMode === 'local') && teamRole ? teamRole : undefined)

  const canEditOrbit = effectiveRole ? canEdit(effectiveRole, 'orbit') : true
  const canEditRocket = effectiveRole ? canEdit(effectiveRole, 'rocket') : true
  const canEditFuel = effectiveRole ? canEdit(effectiveRole, 'fuel') : true

  // Find active mission from catalog
  const currentMission = useMemo(() => {
    return gameData.missions.find((m) => m.id === design.missionId)
  }, [design.missionId])

  // Resolve currently selected target orbit and rocket launcher
  const currentOrbit = useMemo(() => {
    return gameData.orbits.find((o) => o.id === design.orbitId)
  }, [design.orbitId])

  const currentRocket = useMemo(() => {
    return gameData.rockets.find((r) => r.id === design.rocketId)
  }, [design.rocketId])

  // Real-time physics engine calculations
  const totals = useMemo(() => {
    return computeTotals(design, gameData)
  }, [design])

  const checks = useMemo(() => {
    return checkDesign(design, gameData)
  }, [design])

  const reqDeltaV = useMemo(() => {
    return requiredDeltaV(currentOrbit)
  }, [currentOrbit])

  const availDeltaV = useMemo(() => {
    return availableDeltaV(currentRocket, design.orbitId, totals.mass, design.fuelKg)
  }, [currentRocket, design.orbitId, totals.mass, design.fuelKg])

  // Orbit selection handler (Planner subsystem)
  const handleSelectOrbit = (orbitId: string) => {
    if (!canEditOrbit) return
    const newId = design.orbitId === orbitId ? '' : orbitId
    patchDesign({ orbitId: newId })
    resetApprovals()
  }

  // Rocket selection handler (Engineer subsystem)
  const handleSelectRocket = (rocketId: string) => {
    if (!canEditRocket) return
    const newId = design.rocketId === rocketId ? '' : rocketId
    patchDesign({ rocketId: newId })
    resetApprovals()
  }

  // Propellant fuel adjustment (Engineer subsystem)
  const handleFuelChange = (fuelKg: number) => {
    if (!canEditFuel) return
    patchDesign({ fuelKg: Math.max(0, fuelKg) })
    resetApprovals()
  }

  // Orbit mission compliance validation
  const isOrbitMissionCompatible = useMemo(() => {
    if (!currentMission || !design.orbitId) return false
    return currentMission.orbitIds.includes(design.orbitId)
  }, [currentMission, design.orbitId])

  // Payload capability validation
  const rocketPayloadCapacity = useMemo(() => {
    if (!currentRocket || !design.orbitId) return undefined
    return currentRocket.payloadByOrbit[design.orbitId]
  }, [currentRocket, design.orbitId])

  const canRocketReachOrbit = useMemo(() => {
    return rocketPayloadCapacity !== undefined && rocketPayloadCapacity > 0
  }, [rocketPayloadCapacity])

  const isPayloadCapacityExceeded = useMemo(() => {
    if (!canRocketReachOrbit || rocketPayloadCapacity === undefined) return true
    return totals.mass > rocketPayloadCapacity
  }, [canRocketReachOrbit, rocketPayloadCapacity, totals.mass])

  const payloadMargin = useMemo(() => {
    if (rocketPayloadCapacity === undefined) return undefined
    return rocketPayloadCapacity - totals.mass
  }, [rocketPayloadCapacity, totals.mass])

  // Mission budget compliance (totals.cost already includes rocket vehicle cost)
  const isBudgetExceeded = useMemo(() => {
    if (!currentMission) return false
    return totals.cost > currentMission.budget
  }, [totals.cost, currentMission])

  // Engine validation checks
  const allChecksPass = useMemo(() => {
    return checks.every((c) => c.ok)
  }, [checks])

  // Dynamic approval validation matching ApproveGate
  const requiredRoles = useMemo(() => {
    return getRequiredRoles(teamMode, players)
  }, [teamMode, players])

  const allRolesApproved = useMemo(() => {
    return areRolesApproved(requiredRoles, design.approvedBy)
  }, [requiredRoles, design.approvedBy])

  // Comprehensive launch authorization gate
  const canApprove = Boolean(
    design.missionId &&
    design.orbitId &&
    design.rocketId &&
    isOrbitMissionCompatible &&
    canRocketReachOrbit &&
    !isPayloadCapacityExceeded &&
    !isBudgetExceeded &&
    allChecksPass
  )

  const canProceedToReport = Boolean(
    canApprove &&
    allRolesApproved
  )

  // Launch execution handler: Generates single authoritative SimResult and routes to execution
  const handleInitiateLaunch = () => {
    if (!canProceedToReport) return

    const simulationSeed = 42
    const simResult = runMission(design, gameData, simulationSeed)
    const destination = resolveDestination(currentMission, design.orbitId)

    navigate('/execution', {
      state: {
        simResult,
        destination,
      },
    })
  }

  // Empty state guard if accessed directly without choosing a mission
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
            A target flight mission must be established before calculating launch vehicle staging and orbital insertion trajectories.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm inline-block transition-colors border border-blue-500"
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
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-slate-100 font-sans tracking-tight">
            {currentMission.name}
          </h1>
        </div>

        {/* Workstation Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Link
            to="/build"
            className="px-3 py-1.5 rounded-lg bg-[#273449] hover:bg-[#334155] text-slate-200 hover:text-white border border-[#334155] text-sm font-sans font-medium transition-colors"
          >
            ← Spacecraft Builder
          </Link>

          <button
            type="button"
            disabled={!canProceedToReport}
            onClick={handleInitiateLaunch}
            className={`px-4 py-2 rounded-lg font-sans font-semibold text-sm tracking-normal transition-colors flex items-center gap-2 cursor-pointer border ${
              canProceedToReport
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-none'
                : 'bg-[#273449] text-slate-500 border-[#334155] cursor-not-allowed opacity-60'
            }`}
          >
            <span>{canProceedToReport ? 'Authorize Launch' : 'Awaiting Sign-offs'}</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-PANEL ARCHITECTURE WORKSPACE                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-row gap-3.5 items-stretch xl:overflow-hidden">
        {/* ========================================================================= */}
        {/* PANEL 1: LEFT FLIGHT TELEMETRY HUD (~22% WIDTH ON DESKTOP)                */}
        {/* ========================================================================= */}
        <div className="order-2 md:col-span-1 xl:order-1 xl:w-[22%] xl:flex-[22_22_0%] flex flex-col xl:h-full min-h-0 xl:overflow-hidden shrink-0">
          <FlightTelemetryHud
            totals={totals}
            checks={checks}
            mission={currentMission}
            rocket={currentRocket}
            orbit={currentOrbit}
            fuelKg={design.fuelKg}
            availDeltaV={availDeltaV}
            reqDeltaV={reqDeltaV}
            rocketPayloadCapacity={rocketPayloadCapacity}
            payloadMargin={payloadMargin}
            isOrbitCompatible={isOrbitMissionCompatible}
            canApprove={canApprove}
            allRolesApproved={allRolesApproved}
            approvedRolesCount={design.approvedBy.filter((r) => requiredRoles.includes(r)).length}
            requiredRolesCount={requiredRoles.length}
            className="xl:h-full"
          />
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: CENTRE ROCKET & ORBIT VISUALIZATION (~45% WIDTH ON DESKTOP)      */}
        {/* ========================================================================= */}
        <div className="order-1 md:col-span-2 xl:order-2 xl:w-[45%] xl:flex-[45_45_0%] flex flex-col h-[380px] sm:h-[440px] md:h-[480px] xl:h-full min-h-0 overflow-hidden shrink-0 xl:shrink">
          <RocketOrbitVisualizer
            design={design}
            rocket={currentRocket}
            orbit={currentOrbit}
            totalMass={totals.mass}
            availDeltaV={availDeltaV}
            reqDeltaV={reqDeltaV}
            className="h-full flex-1 min-h-0"
          />
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: RIGHT CONFIGURATION PANEL (~33% WIDTH ON DESKTOP)                */}
        {/* ========================================================================= */}
        <div className="order-3 md:col-span-1 xl:order-3 xl:w-[33%] xl:flex-[33_33_0%] flex flex-col bg-[#1E293B] border border-[#334155] rounded-xl xl:overflow-hidden shadow-none min-h-0 shrink-0 xl:h-full">
          {/* Section Navigation Tabs Bar (Fixed/Sticky at top of right panel) */}
          <div className="p-2 border-b border-[#334155] bg-[#1E293B] shrink-0 sticky top-0 z-10">
            <div className="grid grid-cols-2 sm:flex gap-1.5" role="tablist" aria-label="Configuration Sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'orbit'}
                onClick={() => setActiveTab('orbit')}
                className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs sm:text-sm font-semibold tracking-normal transition-colors cursor-pointer text-center ${
                  activeTab === 'orbit'
                    ? 'bg-[#273449] border border-blue-400 text-white'
                    : 'bg-[#1E293B] hover:bg-[#273449] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Orbit
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'rocket'}
                onClick={() => setActiveTab('rocket')}
                className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs sm:text-sm font-semibold tracking-normal transition-colors cursor-pointer text-center ${
                  activeTab === 'rocket'
                    ? 'bg-[#273449] border border-blue-400 text-white'
                    : 'bg-[#1E293B] hover:bg-[#273449] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Rocket
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'propulsion'}
                onClick={() => setActiveTab('propulsion')}
                className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs sm:text-sm font-semibold tracking-normal transition-colors cursor-pointer text-center ${
                  activeTab === 'propulsion'
                    ? 'bg-[#273449] border border-blue-400 text-white'
                    : 'bg-[#1E293B] hover:bg-[#273449] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Fuel & Δv
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'signoff'}
                onClick={() => setActiveTab('signoff')}
                className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs sm:text-sm font-semibold tracking-normal transition-colors cursor-pointer text-center ${
                  activeTab === 'signoff'
                    ? 'bg-[#273449] border border-blue-400 text-white'
                    : 'bg-[#1E293B] hover:bg-[#273449] border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                4. Sign-off
              </button>
            </div>
          </div>

          {/* Subsystem Hardware Module Panel */}
          <div className="p-3 space-y-3.5 xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar">
            {/* ===================== TAB 1: ORBIT SELECTION ===================== */}
            {activeTab === 'orbit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#334155] pb-2.5">
                  <div>
                    <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                      <span>Target Deployment Orbits</span>
                      <Tooltip termKey="deltaV">
                        <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Def</span>
                      </Tooltip>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-sans">
                      Select target orbital trajectory to determine required injection velocity.
                    </p>
                  </div>
                  <span className="text-xs font-sans text-blue-400 font-semibold shrink-0">
                    {currentOrbit ? currentOrbit.name : 'None Selected'}
                  </span>
                </div>

                {!canEditOrbit && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-sans text-amber-300">
                    🔒 Station locked: Requires <strong>Planner</strong> authorization.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {gameData.orbits.map((orbit: Orbit) => {
                    const isSelected = design.orbitId === orbit.id
                    const isMissionCompatible = currentMission.orbitIds.includes(orbit.id)

                    return (
                      <div
                        key={orbit.id}
                        role="button"
                        tabIndex={canEditOrbit ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-disabled={!canEditOrbit}
                        onClick={() => handleSelectOrbit(orbit.id)}
                        className={`rounded-xl p-3.5 border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#273449] border-blue-400'
                            : 'bg-[#1E293B] border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60'
                        } ${!canEditOrbit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-sans text-blue-300 bg-[#273449] px-2.5 py-0.5 rounded border border-[#334155] font-semibold">
                              {orbit.id.toUpperCase()}
                            </span>
                            <span
                              className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
                                isMissionCompatible
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              }`}
                            >
                              {isMissionCompatible ? 'MISSION COMPLIANT' : 'SECONDARY'}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-slate-100 font-sans mb-1">
                            {orbit.name}
                          </h3>

                          <p className="text-sm text-slate-400 font-sans leading-relaxed mb-2.5">
                            {orbit.info}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div className="bg-[#111827] p-2 rounded-lg border border-[#334155] flex items-center justify-between">
                              <span className="text-slate-400 font-sans">Altitude:</span>
                              <span className="text-slate-200 font-mono font-bold">{orbit.altitudeKm.toLocaleString()} km</span>
                            </div>
                            <div className="bg-[#111827] p-2 rounded-lg border border-[#334155] flex items-center justify-between">
                              <span className="text-slate-400 font-sans">Req Δv:</span>
                              <span className="text-blue-300 font-mono font-bold">{requiredDeltaV(orbit).toFixed(2)} km/s</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#334155] flex items-center justify-between">
                          <span className="text-xs font-sans text-slate-400">
                            {isSelected ? 'Active Trajectory' : 'Click to Mount'}
                          </span>
                          <span
                            className={`px-3 py-1.5 text-sm font-sans font-semibold rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#273449] hover:bg-[#334155] text-slate-200 border border-[#334155]'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : '+ Select Orbit'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ===================== TAB 2: ROCKET CATALOG ===================== */}
            {activeTab === 'rocket' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#334155] pb-2.5">
                  <div>
                    <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                      <span>Commercial Launch Vehicles</span>
                      <Tooltip termKey="payloadMargin">
                        <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Def</span>
                      </Tooltip>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-sans">
                      Select commercial rocket meeting payload lift capacity to target orbit.
                    </p>
                  </div>
                  <span className="text-xs font-sans text-blue-400 font-semibold shrink-0">
                    {currentRocket ? currentRocket.name.split('(')[0] : 'None Selected'}
                  </span>
                </div>

                {!canEditRocket && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-sans text-amber-300">
                    🔒 Station locked: Requires <strong>Engineer</strong> authorization.
                  </div>
                )}

                {!design.orbitId && (
                  <div className="p-2.5 rounded-lg bg-[#273449] border border-blue-800/40 text-xs font-sans text-blue-300">
                    ⓘ Note: Select an orbit first in Tab 1 to compute payload limits.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {gameData.rockets.map((rocket: Rocket) => {
                    const isSelected = design.rocketId === rocket.id
                    const capacityToOrbit = design.orbitId ? rocket.payloadByOrbit[design.orbitId] : undefined
                    const canReach = capacityToOrbit !== undefined && capacityToOrbit > 0
                    const isOverloaded = canReach && totals.mass > capacityToOrbit
                    const margin = capacityToOrbit !== undefined ? capacityToOrbit - totals.mass : undefined

                    return (
                      <div
                        key={rocket.id}
                        role="button"
                        tabIndex={canEditRocket ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-disabled={!canEditRocket}
                        onClick={() => handleSelectRocket(rocket.id)}
                        className={`rounded-xl p-3.5 border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#273449] border-blue-400'
                            : 'bg-[#1E293B] border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60'
                        } ${!canEditRocket ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-sans text-slate-300 bg-[#273449] px-2.5 py-0.5 rounded border border-[#334155] font-semibold">
                              {rocket.id.toUpperCase()}
                            </span>

                            {design.orbitId && (
                              <span
                                className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
                                  !canReach
                                    ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                                    : isOverloaded
                                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                }`}
                              >
                                {!canReach ? 'TRAJECTORY INCOMPATIBLE' : isOverloaded ? 'PAYLOAD OVERLOAD' : 'PAYLOAD COMPLIANT'}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-base text-slate-100 font-sans mb-2">
                            {rocket.name}
                          </h3>

                          <div className="space-y-1.5 text-xs mb-2.5">
                            <div className="bg-[#111827] p-2 rounded-lg border border-[#334155] flex items-center justify-between">
                              <span className="text-slate-400 font-sans">Launch Cost:</span>
                              <span className="text-blue-400 font-mono font-bold">${rocket.cost}M USD</span>
                            </div>

                            <div className="bg-[#111827] p-2 rounded-lg border border-[#334155] flex items-center justify-between">
                              <span className="text-slate-400 font-sans">Capacity to Orbit:</span>
                              <span className="text-slate-200 font-mono font-semibold">
                                {design.orbitId
                                  ? canReach
                                    ? `${capacityToOrbit.toLocaleString()} kg`
                                    : 'Incompatible'
                                  : 'Select Orbit First'}
                              </span>
                            </div>

                            {design.orbitId && canReach && (
                              <div className="bg-[#111827] p-2 rounded-lg border border-[#334155] flex items-center justify-between">
                                <span className="text-slate-400 font-sans">Payload Margin:</span>
                                <span className={`font-mono font-bold ${isOverloaded ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {margin !== undefined ? `${margin >= 0 ? '+' : ''}${margin.toLocaleString()} kg` : '--'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#334155] flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-sans truncate max-w-[140px]" title={rocket.source}>
                            {rocket.source.split('(')[0]}
                          </span>
                          <span
                            className={`px-3 py-1.5 text-sm font-sans font-semibold rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#273449] hover:bg-[#334155] text-slate-200 border border-[#334155]'
                            }`}
                          >
                            {isSelected ? '✓ Mounted' : '+ Select Rocket'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ===================== TAB 3: PROPULSION & DELTA-V ===================== */}
            {activeTab === 'propulsion' && (
              <div className="space-y-4">
                <div className="border-b border-[#334155] pb-2.5">
                  <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                    <span>ORBITAL PROPULSION & DELTA-V</span>
                    <Tooltip text="Propellant loaded in spacecraft tanks provides the delta-v (velocity change) required for orbital maneuvers.">
                      <span className="text-blue-400 text-xs font-mono cursor-help">ⓘ Parameters</span>
                    </Tooltip>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">
                    Allocate propellant mass to satisfy orbital insertion velocity requirements.
                  </p>
                </div>

                {!canEditFuel && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-300">
                    🔒 Station locked: Requires <strong>Engineer</strong> authorization.
                  </div>
                )}

                {/* Propellant Slider Card */}
                <div className="p-3.5 rounded-xl bg-[#273449] border border-[#334155] space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                      Propellant Allocation:
                    </span>
                    <span className="text-xl font-bold text-blue-400">
                      {design.fuelKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">{RESOURCE_UNITS.mass}</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={25}
                    value={design.fuelKg}
                    disabled={!canEditFuel}
                    onChange={(e) => handleFuelChange(Number(e.target.value))}
                    aria-label="Propellant Mass Slider"
                    className={`w-full accent-blue-500 ${!canEditFuel ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  />

                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>0 kg (Dry Bus)</span>
                    <span>1,000 kg</span>
                    <span>2,000 kg (Full)</span>
                  </div>
                </div>

                {/* Delta-V Assessment Breakdown */}
                <div className="bg-[#273449] border border-[#334155] rounded-xl p-3.5 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[#334155]">
                    <span className="text-slate-400">Required Trajectory Δv:</span>
                    <span className="text-slate-200 font-bold">{reqDeltaV.toFixed(2)} km/s</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#334155]">
                    <span className="text-slate-400">Available Spacecraft Δv:</span>
                    <span className="text-blue-400 font-bold">{availDeltaV.toFixed(2)} km/s</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Delta-V Flight Margin:</span>
                    <span className={`font-bold ${availDeltaV >= reqDeltaV ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {availDeltaV >= reqDeltaV ? '+' : ''}{(availDeltaV - reqDeltaV).toFixed(2)} km/s
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#273449] border border-[#334155] text-xs font-mono text-slate-300 leading-relaxed">
                  Total wet launch mass is currently <strong>{totals.mass.toLocaleString()} kg</strong> (Dry: {(totals.mass - design.fuelKg).toLocaleString()} kg + Fuel: {design.fuelKg.toLocaleString()} kg).
                </div>
              </div>
            )}

            {/* ===================== TAB 4: FLIGHT SIGN-OFF ===================== */}
            {activeTab === 'signoff' && (
              <div className="space-y-4">
                <div className="border-b border-[#334155] pb-2.5">
                  <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                    <span>FLIGHT READINESS REVIEW (FRR)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">
                    Multi-role sign-off protocol: all designated subsystem leads must verify telemetry and record approval.
                  </p>
                </div>

                {/* Consolidated Crew Launch Approval Gate */}
                <ApproveGate approvals={design.approvedBy} onLaunch={handleInitiateLaunch} />

                {/* Launch Summary Validation Notice */}
                <div className="p-3.5 rounded-xl bg-[#273449] border border-[#334155] space-y-2 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pre-Flight Checklist:</span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Target Orbit Selected:</span>
                      <span className={design.orbitId ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {design.orbitId ? '✓ ' + currentOrbit?.name : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Rocket Launcher Mounted:</span>
                      <span className={design.rocketId ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {design.rocketId ? '✓ ' + currentRocket?.name.split('(')[0] : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Payload Capacity Valid:</span>
                      <span className={!isPayloadCapacityExceeded ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {!isPayloadCapacityExceeded ? '✓ Compliant' : '✗ Overloaded'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Delta-V Sufficient:</span>
                      <span className={availDeltaV >= reqDeltaV ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {availDeltaV >= reqDeltaV ? '✓ Sufficient' : '✗ Deficit'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Budget Limit Valid:</span>
                      <span className={!isBudgetExceeded ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {!isBudgetExceeded ? '✓ Within Cap' : '✗ Exceeded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Launch Action Button */}
                <button
                  type="button"
                  disabled={!canProceedToReport}
                  onClick={handleInitiateLaunch}
                  className={`w-full py-3 px-4 rounded-lg font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                    canProceedToReport
                      ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-none'
                      : 'bg-[#111827] text-slate-500 border-[#334155] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Authorize Launch & Initiate Simulation</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
