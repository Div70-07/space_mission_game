// Owner: B. Flight outcome, simulation playback, and debrief report workstation.
import { useMemo } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import type { SimResult, SimEvent, RealMission } from '@/shared/types'
import { useDesignStore } from '@/shared/designStore'
import { gameData } from '@/data'
import { computeTotals, checkDesign } from '@/engine'
import { MissionScene } from '@/scene'
import { RESOURCE_UNITS } from '@/shared/constants'
import { useTeamStore } from '@/team'
import { resolveDestination } from './MissionExecution'
import { getRequiredRoles, areRolesApproved } from './approval'

export function Report() {
  const navigate = useNavigate()
  const location = useLocation()
  const { design, resetApprovals, reset } = useDesignStore()

  // Retrieve single authoritative SimResult and destination from navigation state
  const navState = location.state as {
    simResult?: SimResult
    destination?: 'earth' | 'moon' | 'mars'
  } | null

  const simResult = navState?.simResult ?? null

  // Team store: mode and players registry for dynamic approval validation
  const teamMode = useTeamStore((s) => s.mode)
  const players = useTeamStore((s) => s.players)

  const requiredRoles = useMemo(() => {
    return getRequiredRoles(teamMode, players)
  }, [teamMode, players])

  // Find active mission, orbit, and rocket specifications
  const currentMission = useMemo(() => {
    return gameData.missions.find((m) => m.id === design.missionId)
  }, [design.missionId])

  const currentOrbit = useMemo(() => {
    return gameData.orbits.find((o) => o.id === design.orbitId)
  }, [design.orbitId])

  const currentRocket = useMemo(() => {
    return gameData.rockets.find((r) => r.id === design.rocketId)
  }, [design.rocketId])

  const totals = useMemo(() => {
    return computeTotals(design, gameData)
  }, [design])

  const checks = useMemo(() => {
    return checkDesign(design, gameData)
  }, [design])

  // Destination celestial body
  const destination: 'earth' | 'moon' | 'mars' = useMemo(() => {
    if (navState?.destination) return navState.destination
    return resolveDestination(currentMission, design.orbitId)
  }, [navState?.destination, currentMission, design.orbitId])

  // Comprehensive flight authorization verification before debrief
  const rocketPayloadCapacity = useMemo(() => {
    if (!currentRocket || !design.orbitId) return undefined
    return currentRocket.payloadByOrbit[design.orbitId]
  }, [currentRocket, design.orbitId])

  const isFlightAuthorized = useMemo(() => {
    // 1. Valid mission exists
    const hasMission = Boolean(currentMission)

    // 2. An orbit is selected
    const hasOrbit = Boolean(design.orbitId)

    // 3. A rocket is selected
    const hasRocket = Boolean(design.rocketId)

    // 4. Orbit is compliant with mission trajectory
    const isOrbitCompatible = Boolean(
      currentMission && design.orbitId && currentMission.orbitIds.includes(design.orbitId)
    )

    // 5. Rocket has positive payload capacity for that orbit
    const canRocketReachOrbit = Boolean(
      rocketPayloadCapacity !== undefined && rocketPayloadCapacity > 0
    )

    // 6. Spacecraft mass does not exceed payload capacity
    const isPayloadWithinCapacity = Boolean(
      canRocketReachOrbit && totals.mass <= (rocketPayloadCapacity ?? 0)
    )

    // 7. Mission budget is not exceeded (totals.cost already includes rocket vehicle cost)
    const isBudgetCompliant = Boolean(
      currentMission &&
      totals.cost <= currentMission.budget
    )

    // 8. All launch-blocking engine checks pass
    const allChecksPass = checks.every((c) => c.ok)

    // 9. All required roles for active session have approved
    const allRolesApproved = areRolesApproved(requiredRoles, design.approvedBy)

    return (
      hasMission &&
      hasOrbit &&
      hasRocket &&
      isOrbitCompatible &&
      canRocketReachOrbit &&
      isPayloadWithinCapacity &&
      isBudgetCompliant &&
      allChecksPass &&
      allRolesApproved
    )
  }, [currentMission, design.orbitId, design.rocketId, design.approvedBy, rocketPayloadCapacity, totals.mass, totals.cost, checks, requiredRoles])

  // Match real mission reference if supplied by engine
  const matchedRealMission = useMemo<RealMission | undefined>(() => {
    if (!simResult?.similarRealMission) return undefined
    return gameData.realMissions.find(
      (rm) => rm.id === simResult.similarRealMission || rm.name === simResult.similarRealMission
    )
  }, [simResult?.similarRealMission])

  // Retry handlers
  const handleRetryDesign = () => {
    resetApprovals()
    navigate('/build')
  }

  const handleReturnToCatalog = () => {
    reset()
    navigate('/')
  }

  // FIX 2 Guard: Display polished empty state if flight authorization was not satisfied
  if (!isFlightAuthorized || !simResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-mono">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-mono text-slate-100">
            NO COMPLETED FLIGHT SIMULATION FOUND
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            A mission configuration must complete launch authorization before debrief telemetry can be processed.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentMission ? (
            <Link
              to="/orbit-rocket"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg font-mono text-sm transition-all cursor-pointer"
            >
              ← Return to Launch Authorization
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg font-mono text-sm transition-all cursor-pointer"
            >
              ← Return to Mission Catalog
            </Link>
          )}
        </div>
      </div>
    )
  }

  const isSuccess = simResult.success

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* 1. TOP HEADER & OUTCOME BANNER */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border font-semibold
                ${isSuccess
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                }
              `}
            >
              {isSuccess ? 'FLIGHT OUTCOME // MISSION SUCCESS' : 'FLIGHT OUTCOME // ANOMALY DETECTED'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              MISSION TARGET: {currentMission?.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
            MISSION POST-FLIGHT DEBRIEF
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {currentMission?.goal}
          </p>
        </div>

        {/* Score Readout Display */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] flex items-center justify-between lg:flex-col lg:items-end gap-2 font-mono">
          <span className="text-xs uppercase text-slate-400 tracking-wider">Flight Science Score</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold ${isSuccess ? 'text-teal-300' : 'text-rose-400'}`}>
              {simResult.score}
            </span>
            <span className="text-xs text-slate-500">/ 100 PTS</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase
              ${isSuccess
                ? 'bg-teal-950/60 text-teal-300 border-teal-800/50'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
              }
            `}
          >
            {isSuccess ? 'Objectives Satisfied' : 'Primary Objectives Incomplete'}
          </span>
        </div>
      </div>

      {/* 2. VISUAL MISSION ANIMATION SCENE */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
              Orbital Maneuver & Telemetry Playback
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            CANVAS VISUALIZER ACTIVE
          </span>
        </div>
        <MissionScene
          result={simResult}
          destination={destination}
          orbitId={design.orbitId}
          missionName={currentMission?.name}
          autoPlay={false}
        />
      </div>

      {/* 3. SIMULATION LOG & DEBRIEF FINDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debrief Analysis & Reasons */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
                Engineering Debrief & System Findings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of operational anomalies, resource margins, and payload returns.
              </p>
            </div>

            {simResult.reasons.length === 0 ? (
              <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
                All subsystem telemetry within nominal thresholds throughout lifetime.
              </div>
            ) : (
              <div className="space-y-2.5">
                {simResult.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5
                      ${isSuccess
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                        : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      }
                    `}
                  >
                    <span className="mt-0.5 font-bold">{isSuccess ? '✓' : '⚠'}</span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real NASA Mission Comparison */}
          {matchedRealMission ? (
            <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-900/40 p-4 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider block mb-1">
                Historical Benchmark Comparison
              </span>
              <h3 className="text-sm font-bold font-mono text-slate-100 mb-1">
                {matchedRealMission.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {matchedRealMission.summary}
              </p>
              {matchedRealMission.link && (
                <a
                  href={matchedRealMission.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                >
                  <span>Explore Mission Archives</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
              Reference benchmark comparison logged under flight classification level {currentMission?.level}.
            </div>
          )}
        </div>

        {/* Flight Events Chronology Timeline */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
              Mission Chronology & Flight Events Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sequence of recorded milestones and environmental space weather events.
            </p>
          </div>

          {simResult.events.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/30 rounded-lg border border-slate-800 text-slate-500 font-mono text-xs">
              NO ANOMALOUS FLIGHT EVENTS ENCOUNTERED DURING MISSION PROFILE.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {simResult.events.map((evt: SimEvent, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase text-teal-400 font-semibold">
                      MISSION DAY {evt.day}
                    </span>
                    <span className="text-[10px] text-slate-500">TEL-ID #{idx + 1}</span>
                  </div>
                  <p className="text-slate-200 leading-snug">{evt.text}</p>
                  <div className="text-[11px] text-amber-300/90 pt-1 flex items-center gap-1">
                    <span className="text-amber-400">Impact:</span>
                    <span>{evt.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. FINAL HARDWARE CONFIGURATION MANIFEST */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
            Final Spacecraft & Launch Vehicle Manifest
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture parameters verified during flight qualification and orbital operations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Target Orbit</span>
            <span className="font-bold text-slate-100 truncate block" title={currentOrbit?.name}>
              {currentOrbit?.name || 'Unassigned'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Launch Vehicle</span>
            <span className="font-bold text-slate-100 truncate block" title={currentRocket?.name}>
              {currentRocket?.name || 'Unassigned'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Spacecraft Mass</span>
            <span className="font-bold text-slate-100">
              {totals.mass.toLocaleString()} {RESOURCE_UNITS.mass}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Mission Cost</span>
            <span className="font-bold text-slate-100">
              ${totals.cost}M
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Power Load</span>
            <span className="font-bold text-teal-300">
              {totals.power} {RESOURCE_UNITS.power}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Lifetime</span>
            <span className="font-bold text-slate-100">
              {design.lifetimeMonths} mo
            </span>
          </div>
        </div>
      </div>

      {/* 5. RETRY & NAVIGATION ACTIONS */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/orbit-rocket"
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            ← Review Orbit & Staging
          </Link>
          <Link
            to="/execution"
            state={{ simResult, destination }}
            className="px-4 py-2 text-xs font-mono text-teal-400 hover:text-teal-300 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            ⟲ Replay Trajectory Scene
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRetryDesign}
            className="px-5 py-2 text-xs font-mono font-semibold text-teal-300 bg-slate-900 border border-teal-500/40 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Re-engineer Spacecraft (/build)
          </button>

          <button
            type="button"
            onClick={handleReturnToCatalog}
            className="px-6 py-2 text-xs font-mono font-semibold text-slate-950 bg-teal-500 hover:bg-teal-400 rounded-lg shadow-md shadow-teal-950/50 transition-all cursor-pointer"
          >
            Select New Mission (/)
          </button>
        </div>
      </div>
    </div>
  )
}
