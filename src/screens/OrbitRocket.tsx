// Owner: B. Orbit selection, launch vehicle integration, and flight sign-off workstation.
import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Role, Orbit, Rocket } from '@/shared/types'
import { ROLES, RESOURCE_UNITS } from '@/shared/constants'
import { useDesignStore } from '@/shared/designStore'
import { gameData } from '@/data'
import { computeTotals, checkDesign, requiredDeltaV, availableDeltaV } from '@/engine'
import { ApproveGate } from '@/team'
import { ResourceBars } from './components/ResourceBars'
import { Tooltip } from './components/Tooltip'

export interface OrbitRocketProps {
  /** Optional assigned player role when operating within a multiplayer session */
  assignedRole?: Role
}

export function OrbitRocket({ assignedRole }: OrbitRocketProps = {}) {
  const navigate = useNavigate()
  const { design, patchDesign, approve, resetApprovals } = useDesignStore()

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

  // Orbit selection handler
  const handleSelectOrbit = (orbitId: string) => {
    const newId = design.orbitId === orbitId ? '' : orbitId
    patchDesign({ orbitId: newId })
    resetApprovals()
  }

  // Rocket selection handler
  const handleSelectRocket = (rocketId: string) => {
    const newId = design.rocketId === rocketId ? '' : rocketId
    patchDesign({ rocketId: newId })
    resetApprovals()
  }

  // Propellant fuel adjustment
  const handleFuelChange = (fuelKg: number) => {
    patchDesign({ fuelKg: Math.max(0, fuelKg) })
    resetApprovals()
  }

  // Orbit mission compliance validation (FIX 3)
  const isOrbitMissionCompatible = useMemo(() => {
    if (!currentMission || !design.orbitId) return false
    return currentMission.orbitIds.includes(design.orbitId)
  }, [currentMission, design.orbitId])

  // Payload capability validation (FIX 1 & FIX 5)
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

  // Mission budget compliance (including rocket vehicle launch cost) (FIX 2)
  const isBudgetExceeded = useMemo(() => {
    if (!currentMission) return false
    const totalExpenditure = totals.cost + (currentRocket?.cost ?? 0)
    return totalExpenditure > currentMission.budget
  }, [totals.cost, currentRocket?.cost, currentMission])

  // Engine validation checks (FIX 2)
  const allChecksPass = useMemo(() => {
    return checks.every((c) => c.ok)
  }, [checks])

  // Four-role approval validation
  const allRolesApproved = useMemo(() => {
    return ROLES.every((role) => design.approvedBy.includes(role))
  }, [design.approvedBy])

  // Comprehensive launch authorization gate (FIX 1, FIX 2, FIX 3)
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

  // Empty state guard if accessed directly without choosing a mission
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
            A target flight mission must be established before calculating launch vehicle staging and orbital insertion trajectories.
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* 1. TOP HEADER & TELEMETRY SUMMARY */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              TRAJECTORY & LAUNCH INTEGRATION // PHASE 03
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              MISSION: {currentMission.name}
            </span>
          </div>

          <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            ORBIT & ROCKET INTEGRATION WORKSTATION
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Match payload mass and orbital apogee requirements against compatible commercial launch vehicle lift performance.
          </p>
        </div>

        {/* Back and Forward Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/build"
            className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Back to Spacecraft Builder
          </Link>

          <button
            type="button"
            disabled={!canProceedToReport}
            onClick={() => navigate('/report')}
            className={`inline-flex items-center gap-2 font-semibold px-5 py-2 rounded-lg font-mono text-xs transition-all
              ${canProceedToReport
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
              }
            `}
          >
            <span>Proceed to Mission Debrief</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. REUSABLE RESOURCE TELEMETRY HUD */}
      <ResourceBars
        totals={totals}
        checks={checks}
        mission={currentMission}
        rocket={currentRocket}
        orbit={currentOrbit}
        lifetimeMonths={design.lifetimeMonths}
      />

      {/* 3. ORBIT SELECTION SECTION */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <span>STEP 1: SELECT TARGET DEPLOYMENT ORBIT</span>
              <Tooltip termKey="deltaV">
                <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
              </Tooltip>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target orbit determines required launch vehicle velocity increment and ground track coverage.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {design.orbitId ? `Selected: ${currentOrbit?.name}` : 'No Orbit Selected'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameData.orbits.map((orbit: Orbit) => {
            const isSelected = design.orbitId === orbit.id
            const isMissionCompatible = currentMission.orbitIds.includes(orbit.id)

            return (
              <div
                key={orbit.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleSelectOrbit(orbit.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectOrbit(orbit.id)
                  }
                }}
                className={`relative rounded-lg p-4 border transition-all cursor-pointer flex flex-col justify-between
                  ${isSelected
                    ? isMissionCompatible
                      ? 'bg-slate-900/90 border-teal-400 ring-1 ring-teal-400/50 shadow-md shadow-teal-950/60'
                      : 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-950/60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                      ORBIT // {orbit.id.toUpperCase()}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isMissionCompatible ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' : 'bg-amber-950/60 text-amber-300 border-amber-800/50'}`}
                    >
                      {isMissionCompatible ? 'MISSION COMPLIANT' : 'SECONDARY TRAJECTORY'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 font-mono mb-2">
                    {orbit.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {orbit.info}
                  </p>

                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between font-mono text-xs mb-3">
                    <span className="text-slate-400">Target Altitude:</span>
                    <span className="text-slate-200 font-semibold">{orbit.altitudeKm.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {isSelected ? 'Active Target' : 'Click to select'}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors font-mono
                      ${isSelected
                        ? isMissionCompatible
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. ROCKET LAUNCH VEHICLE SELECTION SECTION */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <span>STEP 2: SELECT LAUNCH VEHICLE</span>
              <Tooltip termKey="payloadMargin">
                <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
              </Tooltip>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify launch vehicle payload capacity to target orbit meets or exceeds total wet spacecraft mass ({totals.mass} kg).
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {design.rocketId ? `Selected: ${currentRocket?.name}` : 'No Launcher Selected'}
          </span>
        </div>

        {!design.orbitId && (
          <div className="p-3 bg-sky-950/30 rounded-lg border border-sky-800/40 text-xs font-mono text-sky-300 flex items-center gap-2">
            <span>ⓘ</span>
            <span>Select a deployment orbit above to evaluate vehicle payload lift performance and capacity limits.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameData.rockets.map((rocket: Rocket) => {
            const isSelected = design.rocketId === rocket.id
            const capacityToOrbit = design.orbitId ? rocket.payloadByOrbit[design.orbitId] : undefined
            const canReach = capacityToOrbit !== undefined && capacityToOrbit > 0
            const isOverloaded = canReach && totals.mass > capacityToOrbit

            return (
              <div
                key={rocket.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleSelectRocket(rocket.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectRocket(rocket.id)
                  }
                }}
                className={`relative rounded-lg p-4 border transition-all cursor-pointer flex flex-col justify-between
                  ${isSelected
                    ? !canReach || isOverloaded
                      ? 'bg-rose-950/30 border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/60'
                      : 'bg-slate-900/90 border-teal-400 ring-1 ring-teal-400/50 shadow-md shadow-teal-950/60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                      LAUNCHER // HEAVY LIFT
                    </span>

                    {design.orbitId && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border
                          ${!canReach
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                            : isOverloaded
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          }
                        `}
                      >
                        {!canReach ? 'ORBIT INCOMPATIBLE' : isOverloaded ? 'PAYLOAD OVERLOAD' : 'PAYLOAD COMPLIANT'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 font-mono mb-2">
                    {rocket.name}
                  </h3>

                  <div className="space-y-2 font-mono text-xs mb-4">
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Launch Cost:</span>
                      <span className="text-teal-300 font-bold">${rocket.cost}M</span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Payload to Orbit:</span>
                      <span className="text-slate-200 font-semibold">
                        {design.orbitId
                          ? canReach
                            ? `${capacityToOrbit.toLocaleString()} kg`
                            : 'Trajectory Incompatible'
                          : 'Select Orbit First'}
                      </span>
                    </div>

                    {/* Consistent Payload Margin calculation (FIX 5) */}
                    {design.orbitId && canReach && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Payload Margin:</span>
                        <span className={`font-semibold ${isOverloaded ? 'text-rose-400' : 'text-emerald-300'}`}>
                          {isSelected && payloadMargin !== undefined
                            ? `${payloadMargin < 0 ? '-' : '+'}${Math.abs(payloadMargin).toLocaleString()} kg`
                            : `${totals.mass > capacityToOrbit ? '-' : '+'}${Math.abs(capacityToOrbit - totals.mass).toLocaleString()} kg`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={rocket.source}>
                    SRC: {rocket.source}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors font-mono
                      ${isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    {isSelected ? 'Mounted' : 'Select'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. DELTA-V & PROPELLANT ALLOCATION */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <span>STEP 3: ORBITAL DELTA-V & PROPELLANT STAGING</span>
            <Tooltip termKey="deltaV">
              <span className="text-teal-400 text-xs font-sans cursor-help">ⓘ Info</span>
            </Tooltip>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure onboard propellant mass for orbital transfer burns, apogee insertion, and orbital maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Fuel Slider */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Propellant Mass Allocation
              </span>
              <span className="text-xl font-bold text-teal-300">
                {design.fuelKg} <span className="text-xs font-normal text-slate-400">{RESOURCE_UNITS.mass}</span>
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={2000}
              step={25}
              value={design.fuelKg}
              onChange={(e) => handleFuelChange(Number(e.target.value))}
              aria-label="Propellant Mass Slider"
              className="w-full accent-teal-400 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0 kg (Dry Bus)</span>
              <span>1,000 kg</span>
              <span>2,000 kg (Full Tank)</span>
            </div>
          </div>

          {/* Delta-V Telemetry Readout */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">
              Velocity Increment ($\Delta v$) Assessment
            </span>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Required Trajectory $\Delta v$:</span>
                <span className="text-slate-200 font-semibold">{reqDeltaV} km/s</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Available Spacecraft $\Delta v$:</span>
                <span className="text-teal-300 font-semibold">{availDeltaV} km/s</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Delta-V Flight Margin:</span>
                <span className={`font-semibold ${availDeltaV >= reqDeltaV ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {availDeltaV >= reqDeltaV ? '+' : ''}{Number((availDeltaV - reqDeltaV).toFixed(2))} km/s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PART C APPROVAL GATE & LAUNCH AUTHORIZATION */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold font-mono text-slate-100">
            STEP 4: FLIGHT READINESS REVIEW & MULTI-ROLE SIGN-OFF
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            NASA Flight Operations Protocol requires all four subsystem directors to approve mission parameters prior to launch authorization.
          </p>
        </div>

        {/* Existing Part C ApproveGate Component */}
        <ApproveGate approvals={design.approvedBy} />

        {/* Sign-off Actions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Subsystem Sign-off Panel:
              </span>
              {assignedRole && (
                <span className="text-[11px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                  Assigned: {assignedRole.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Only show "Sign Off All Roles (Solo)" in Solo mode (FIX 4) */}
              {!assignedRole && (
                <button
                  type="button"
                  onClick={() => {
                    ROLES.forEach((r) => approve(r))
                  }}
                  disabled={!canApprove}
                  className="px-3 py-1 text-xs font-mono rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sign Off All Roles (Solo)
                </button>
              )}

              <button
                type="button"
                onClick={() => resetApprovals()}
                className="px-3 py-1 text-xs font-mono rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Reset Approvals
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {ROLES.map((role) => {
              const isApproved = design.approvedBy.includes(role)
              // In multiplayer mode, players can only approve their own role (FIX 4)
              const isUserRole = !assignedRole || assignedRole === role
              const isClickable = canApprove && !isApproved && isUserRole

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    if (isClickable) approve(role)
                  }}
                  disabled={!isClickable}
                  className={`p-2.5 rounded border text-left flex flex-col justify-between transition-colors
                    ${isApproved
                      ? 'bg-teal-950/50 border-teal-500/50 text-teal-300'
                      : isClickable
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 cursor-pointer'
                        : 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-60'
                    }
                  `}
                  title={
                    !canApprove
                      ? 'Flight preconditions unmet'
                      : isApproved
                        ? 'Already approved'
                        : !isUserRole
                          ? `Awaiting sign-off from ${role} specialist`
                          : `Click to sign off ${role} subsystem`
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="uppercase text-[10px] tracking-wider text-slate-400">
                      {role}
                    </span>
                    {assignedRole === role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" title="Your Assigned Role" />
                    )}
                  </div>
                  <span className="font-semibold text-xs flex items-center gap-1">
                    {isApproved
                      ? '✓ APPROVED'
                      : !isUserRole
                        ? 'AWAITING TEAM'
                        : 'SIGN OFF'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Validation Warnings (FIX 1, FIX 2, FIX 3) */}
          {!canApprove && (
            <div className="p-3 bg-amber-950/30 rounded border border-amber-800/40 text-xs font-mono text-amber-300 space-y-1">
              <span className="font-semibold block uppercase">Flight Sign-off Preconditions Unmet:</span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 text-[11px]">
                {!design.orbitId && <li>Select a target deployment orbit</li>}
                {design.orbitId && !isOrbitMissionCompatible && (
                  <li>Target orbit ({currentOrbit?.name}) does not satisfy primary mission trajectory requirements</li>
                )}
                {!design.rocketId && <li>Select a compatible launch vehicle</li>}
                {design.rocketId && !canRocketReachOrbit && (
                  <li>Selected rocket ({currentRocket?.name}) cannot reach target orbit (no payload capacity listed for {currentOrbit?.name})</li>
                )}
                {canRocketReachOrbit && isPayloadCapacityExceeded && (
                  <li>Spacecraft mass ({totals.mass} kg) exceeds rocket payload capacity ({rocketPayloadCapacity} kg)</li>
                )}
                {isBudgetExceeded && (
                  <li>Combined vehicle and mission expenditure exceeds allotted budget of ${currentMission.budget}M</li>
                )}
                {!allChecksPass && (
                  <li>Engine checks failed: {checks.filter((c) => !c.ok).map((c) => c.message).join(', ')}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 7. BOTTOM NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 gap-4">
        <Link
          to="/build"
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Spacecraft Builder</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400">
            {canProceedToReport
              ? '✓ Flight Plan Authorized'
              : `Awaiting Sign-offs (${design.approvedBy.length}/4 Approved)`}
          </span>

          <button
            type="button"
            disabled={!canProceedToReport}
            onClick={() => navigate('/report')}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-lg font-mono text-sm transition-all
              ${canProceedToReport
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-950/60 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
              }
            `}
          >
            <span>Authorize Launch & Initiate Simulation</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
