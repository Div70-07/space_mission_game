// Owner: B. Flight outcome, simulation playback, and debrief report workstation.
// PROJECT DEEPSKY: Editorial Aerospace Mission Debrief & Performance Analytics
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
    const hasMission = Boolean(currentMission)
    const hasOrbit = Boolean(design.orbitId)
    const hasRocket = Boolean(design.rocketId)
    const isOrbitCompatible = Boolean(
      currentMission && design.orbitId && currentMission.orbitIds.includes(design.orbitId)
    )
    const canRocketReachOrbit = Boolean(
      rocketPayloadCapacity !== undefined && rocketPayloadCapacity > 0
    )
    const isPayloadWithinCapacity = Boolean(
      canRocketReachOrbit && totals.mass <= (rocketPayloadCapacity ?? 0)
    )
    const isBudgetCompliant = Boolean(
      currentMission && totals.cost <= currentMission.budget
    )
    const allChecksPass = checks.every((c) => c.ok)
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

  // Display polished empty state if flight authorization was not satisfied
  if (!isFlightAuthorized || !simResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6 font-sans text-slate-100">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-mono">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans text-white">
            NO COMPLETED FLIGHT SIMULATION FOUND
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
            A mission configuration must complete launch authorization and execution staging before debrief telemetry can be processed.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentMission ? (
            <Link
              to="/orbit-rocket"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm transition-colors border border-blue-500 cursor-pointer"
            >
              ← Return to Launch Staging (/orbit-rocket)
            </Link>
          ) : (
            <Link
              to="/"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm transition-colors border border-blue-500 cursor-pointer"
            >
              ← Return to Mission Catalog (/)
            </Link>
          )}
        </div>
      </div>
    )
  }

  const isSuccess = simResult.success

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-20 font-sans text-slate-100">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & OUTCOME HERO BANNER                                       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-6 sm:p-8 border border-[#334155] bg-[#1E293B] shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-sans px-3 py-1 rounded-full border font-semibold flex items-center gap-1.5
                ${isSuccess
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {isSuccess ? 'Flight Outcome · Mission Success' : 'Flight Outcome · Mission Anomaly'}
            </span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#273449] text-slate-300 border border-[#334155]">
              Target: {currentMission?.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white">
            Mission Post-Flight Debrief
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-sans leading-relaxed">
            {currentMission?.goal}
          </p>
        </div>

        {/* Score Readout Display Card */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-5 min-w-[240px] flex items-center justify-between lg:flex-col lg:items-end gap-2 font-sans shadow-none z-10 shrink-0">
          <span className="text-xs text-slate-400 font-sans">Flight Science Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-black font-mono ${isSuccess ? 'text-blue-400' : 'text-rose-400'}`}>
              {simResult.score}
            </span>
            <span className="text-xs text-slate-400 font-sans font-medium">/ 100 pts</span>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded border font-semibold
              ${isSuccess
                ? 'bg-blue-950/60 text-blue-300 border-blue-800/50'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
              }
            `}
          >
            {isSuccess ? 'Objectives Satisfied' : 'Primary Objectives Incomplete'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISUAL MISSION ANIMATION SCENE (Telemetry Playback)                     */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4 sm:p-5 shadow-none space-y-3">
        <div className="flex items-center justify-between px-1 border-b border-[#334155] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-sm font-bold font-sans uppercase tracking-normal text-slate-100">
              Orbital Maneuver & Trajectory Playback
            </h2>
          </div>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#273449] text-slate-300 border border-[#334155]">
            Simulation Telemetry
          </span>
        </div>

        <div className="w-full rounded-xl overflow-hidden bg-black/90">
          <MissionScene
            result={simResult}
            destination={destination}
            orbitId={design.orbitId}
            missionName={currentMission?.name}
            autoPlay={false}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMULATION LOG, FINDINGS & HISTORICAL BENCHMARK                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Engineering Debrief & System Findings */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#334155] pb-3 mb-4">
              <h2 className="text-base font-bold font-sans text-slate-100">
                Engineering Debrief & System Findings
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-sans">
                Evaluation of operational anomalies, resource margins, and payload telemetry returns.
              </p>
            </div>

            {simResult.reasons.length === 0 ? (
              <div className="p-4 bg-[#273449] rounded-xl border border-[#334155] text-sm font-sans text-slate-300">
                ✓ All subsystem telemetry remained within nominal parameters throughout the flight envelope.
              </div>
            ) : (
              <div className="space-y-2.5">
                {simResult.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-sm font-sans flex items-start gap-2.5
                      ${isSuccess
                        ? 'bg-[#273449] border-[#334155] text-slate-200'
                        : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      }
                    `}
                  >
                    <span className="mt-0.5 font-bold">{isSuccess ? '✓' : '⚠'}</span>
                    <span className="leading-relaxed font-sans">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real NASA Mission Comparison */}
          {matchedRealMission ? (
            <div className="pt-4 border-t border-[#334155] bg-[#273449] p-4 rounded-xl border border-[#334155] space-y-2">
              <span className="text-xs font-sans uppercase text-blue-300 font-semibold block">
                NASA HISTORICAL BENCHMARK COMPARISON
              </span>
              <h3 className="text-base font-bold font-sans text-white">
                {matchedRealMission.name}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {matchedRealMission.summary}
              </p>
              {matchedRealMission.link && (
                <a
                  href={matchedRealMission.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-sans text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-semibold pt-1"
                >
                  <span>Explore NASA Archives</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-[#334155] text-xs font-sans text-slate-400">
              Reference benchmark comparison logged under flight classification level {currentMission?.level}.
            </div>
          )}
        </div>

        {/* Right Column: Chronological Flight Event Log */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-4">
          <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-sans text-slate-100">
                Mission Chronology & Flight Events Log
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-sans">
                Chronological timeline of milestones and space weather anomalies.
              </p>
            </div>
            <span className="text-xs font-sans text-blue-400 font-semibold">
              {simResult.events.length} EVENTS
            </span>
          </div>

          {simResult.events.length === 0 ? (
            <div className="p-8 text-center bg-[#273449] rounded-xl border border-[#334155] text-slate-400 font-sans text-sm">
              No anomalous flight events encountered during mission profile.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {simResult.events.map((evt: SimEvent, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#273449] border border-[#334155] rounded-xl p-3.5 text-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase text-blue-300 font-sans font-semibold">
                      MISSION DAY {evt.day}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">TEL-ID #{idx + 1}</span>
                  </div>
                  <p className="text-slate-200 leading-snug font-sans">{evt.text}</p>
                  <div className="text-xs text-amber-300/90 pt-1 flex items-center gap-1 font-sans">
                    <span className="text-amber-400 font-semibold">Impact:</span>
                    <span>{evt.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FINAL HARDWARE CONFIGURATION MATRIX                                    */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-4">
        <div className="border-b border-[#334155] pb-3">
          <h2 className="text-sm font-bold font-sans uppercase tracking-normal text-slate-100">
            Final Spacecraft & Launch Vehicle Manifest
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Verified flight telemetry and hardware configuration records.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans text-xs">
          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Target Orbit</span>
            <span className="font-bold text-slate-100 truncate block font-mono" title={currentOrbit?.name}>
              {currentOrbit?.name || 'Unassigned'}
            </span>
          </div>

          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Launcher</span>
            <span className="font-bold text-slate-100 truncate block font-mono" title={currentRocket?.name}>
              {currentRocket?.name || 'Unassigned'}
            </span>
          </div>

          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Spacecraft Mass</span>
            <span className="font-bold text-slate-100 font-mono">
              {totals.mass.toLocaleString()} {RESOURCE_UNITS.mass}
            </span>
          </div>

          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Mission Cost</span>
            <span className="font-bold text-blue-400 font-mono">
              ${totals.cost}M USD
            </span>
          </div>

          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Power Load</span>
            <span className="font-bold text-slate-100 font-mono">
              {totals.power} {RESOURCE_UNITS.power}
            </span>
          </div>

          <div className="bg-[#273449] p-3.5 rounded-xl border border-[#334155]">
            <span className="text-xs uppercase text-slate-400 block mb-1">Lifetime</span>
            <span className="font-bold text-slate-100 font-mono">
              {design.lifetimeMonths} Months
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RETRY & NAVIGATION ACTIONS                                             */}
      {/* ========================================================================= */}
      <div className="border-t border-[#334155] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/orbit-rocket"
            className="px-4 py-2 text-sm font-sans font-medium text-slate-200 hover:text-white bg-[#273449] hover:bg-[#334155] border border-[#334155] rounded-lg transition-colors"
          >
            ← Review Orbit & Staging
          </Link>
          <Link
            to="/execution"
            state={{ simResult, destination }}
            className="px-4 py-2 text-sm font-sans font-medium text-blue-300 hover:text-white bg-[#273449] hover:bg-[#334155] border border-[#334155] rounded-lg transition-colors"
          >
            ⟲ Replay Trajectory Scene
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRetryDesign}
            className="px-5 py-2.5 text-sm font-sans font-semibold text-blue-300 bg-[#273449] hover:bg-[#334155] border border-[#334155] rounded-lg transition-colors cursor-pointer"
          >
            Re-engineer Spacecraft (/build)
          </button>

          <button
            type="button"
            onClick={handleReturnToCatalog}
            className="px-6 py-2.5 text-sm font-sans font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors border border-blue-500 cursor-pointer shadow-none"
          >
            Select New Mission (/)
          </button>
        </div>
      </div>
    </div>
  )
}
