// Owner: B. Mission execution and flight trajectory visualization screen.
// COSMOCRAFT: Three-Panel Aerospace Launch & Mission Execution Theater
import { useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { SimResult, Mission } from '@/shared/types'
import { useDesignStore } from '@/shared/designStore'
import { gameData } from '@/data'
import { MissionScene } from '@/scene'
import { computeTotals, checkDesign } from '@/engine'

/**
 * Resolves celestial body destination ('earth' | 'moon' | 'mars') from mission specifications or orbit ID.
 */
export function resolveDestination(
  mission?: { targetDestination?: string; id?: string },
  orbitId?: string
): 'earth' | 'moon' | 'mars' {
  const dest = mission?.targetDestination?.toLowerCase()
  if (dest === 'mars') return 'mars'
  if (dest === 'moon') return 'moon'
  if (dest === 'earth') return 'earth'

  const mId = (mission?.id ?? '').toLowerCase()
  if (mId.includes('mars')) return 'mars'
  if (mId.includes('moon') || mId.includes('lunar')) return 'moon'

  const oId = (orbitId ?? '').toLowerCase()
  if (oId.includes('mars')) return 'mars'
  if (oId.includes('moon') || oId.includes('lunar') || oId.includes('llo')) return 'moon'

  return 'earth'
}

export function MissionExecution() {
  const navigate = useNavigate()
  const location = useLocation()
  const { design } = useDesignStore()

  // Retrieve authoritative SimResult and destination from navigation state
  const navState = location.state as {
    simResult?: SimResult
    destination?: 'earth' | 'moon' | 'mars'
  } | null

  const simResult = navState?.simResult ?? null

  const currentMission: Mission | undefined = useMemo(() => {
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

  const totalScienceYield = useMemo(() => {
    return (design.instrumentIds || []).reduce((sum, id) => {
      const inst = gameData.instruments.find((i) => i.id === id)
      return sum + (inst?.scienceValue ?? 0)
    }, 0)
  }, [design.instrumentIds])

  // Destination celestial body
  const destination: 'earth' | 'moon' | 'mars' = useMemo(() => {
    if (navState?.destination) return navState.destination
    return resolveDestination(currentMission, design.orbitId)
  }, [navState?.destination, currentMission, design.orbitId])

  // Safe Guard: If direct access occurs without an active simulation result, show recovery screen
  if (!simResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6 font-mono text-slate-100">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            NO ACTIVE MISSION EXECUTION IN PROGRESS
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
            A spacecraft configuration must satisfy all launch authorization requirements and undergo ignition staging before execution telemetry can be rendered.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentMission ? (
            <Link
              to="/orbit-rocket"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors shadow-none"
            >
              ← Return to Launch Staging (/orbit-rocket)
            </Link>
          ) : (
            <Link
              to="/"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors shadow-none"
            >
              ← Return to Mission Catalog (/)
            </Link>
          )}
        </div>
      </div>
    )
  }

  const isSuccess = simResult.success

  const handleProceedToReport = () => {
    navigate('/report', {
      state: {
        simResult,
        destination,
      },
    })
  }

  return (
    <div className="max-w-[1780px] w-full mx-auto flex flex-col h-full min-h-0 space-y-2 font-sans text-slate-100 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. COMPACT MISSION CONTEXT HEADER                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-1.5 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="text-base sm:text-lg font-bold font-sans tracking-normal text-slate-100">
            {currentMission?.name ?? 'Orbital Mission Simulation'}
          </span>
          <span className={`text-xs font-sans font-semibold px-2.5 py-0.5 rounded border ${
            isSuccess
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
              : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
          }`}>
            {isSuccess ? 'Flight Nominal' : 'Anomaly Logged'}
          </span>
          <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded bg-[#273449] text-blue-300 border border-[#334155] hidden sm:inline uppercase">
            Target: {destination}
          </span>
        </div>

        {/* Workstation Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/orbit-rocket"
            className="px-3.5 py-1.5 rounded-lg bg-[#273449] hover:bg-[#334155] text-slate-200 hover:text-white border border-[#334155] text-sm font-sans font-medium transition-colors"
          >
            ← Launch Staging
          </Link>

          <button
            type="button"
            onClick={handleProceedToReport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm tracking-normal transition-colors flex items-center gap-2 cursor-pointer border border-blue-500 shadow-none"
          >
            <span>Proceed to Flight Debrief</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-PANEL ARCHITECTURE WORKSPACE                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 items-stretch overflow-hidden">
        {/* ========================================================================= */}
        {/* PANEL 1: LEFT MISSION TELEMETRY HUD (~22% WIDTH)                          */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[22%] lg:flex-[22_22_0%] flex flex-col h-full min-h-0 bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shrink-0 shadow-none">
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-[#334155] bg-[#1E293B] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <div>
                <h2 className="text-sm font-bold font-sans tracking-normal text-slate-100 uppercase leading-none">
                  Mission Telemetry
                </h2>
                <div className="text-xs text-slate-400 font-sans mt-0.5 leading-none">
                  Flight Envelope
                </div>
              </div>
            </div>

            <span className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
              isSuccess
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
            }`}>
              {isSuccess ? 'Nominal' : 'Anomaly'}
            </span>
          </div>

          {/* Metric Cards Stack */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {/* 1. Mission Status */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Mission Status
                </span>
                <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
                  isSuccess
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                }`}>
                  {isSuccess ? 'Success' : 'Failed'}
                </span>
              </div>
              <div className="my-1">
                <div className="text-base font-bold text-white font-sans">
                  {currentMission?.name}
                </div>
                <div className="text-xs text-slate-400 font-sans mt-0.5">
                  Target: {destination.toUpperCase()} · Duration: {currentMission?.lifetimeMonths ?? 12} mo
                </div>
              </div>
            </div>

            {/* 2. Vehicle Status */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Vehicle Status
                </span>
                <span className="text-xs px-2 py-0.5 font-sans font-semibold rounded border bg-blue-950/80 text-blue-300 border-blue-800/60">
                  {currentRocket ? currentRocket.name.split('(')[0] : 'Launcher'}
                </span>
              </div>
              <div className="my-1">
                <div className="text-base font-bold text-white font-sans">
                  {isSuccess ? 'Vehicle Nominal' : 'Staging Anomaly'}
                </div>
                <div className="text-xs text-slate-400 font-sans mt-0.5">
                  Deployment Orbit: {currentOrbit?.name || design.orbitId}
                </div>
              </div>
            </div>

            {/* 3. Fuel Mass */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Propellant Burn
                </span>
                <span className="text-xs px-2 py-0.5 font-sans font-semibold rounded border bg-blue-950/80 text-blue-300 border-blue-800/60">
                  Consumed
                </span>
              </div>
              <div className="flex items-baseline justify-between my-1">
                <span className="text-2xl font-black text-white font-mono deepsky-num">
                  {design.fuelKg.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-sans">kg propellant</span>
              </div>
              <div className="text-xs font-sans text-slate-400">
                Orbital insertion and attitude correction burns completed.
              </div>
            </div>

            {/* 4. Spacecraft Mass */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Spacecraft Mass
                </span>
                <span className="text-xs px-2 py-0.5 font-sans font-semibold rounded border bg-emerald-950/80 text-emerald-300 border-emerald-800/60">
                  Inserted
                </span>
              </div>
              <div className="flex items-baseline justify-between my-1">
                <span className="text-2xl font-black text-white font-mono deepsky-num">
                  {totals.mass.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-sans">kg total</span>
              </div>
              <div className="text-xs font-sans text-slate-400">
                Dry bus: {(totals.mass - design.fuelKg).toLocaleString()} kg | Fuel: {design.fuelKg.toLocaleString()} kg
              </div>
            </div>

            {/* 5. Current Mission Phase */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Flight Sequence
                </span>
                <span className="text-xs px-2 py-0.5 font-sans font-semibold rounded border bg-blue-950/80 text-blue-300 border-blue-800/60">
                  Completed
                </span>
              </div>
              <div className="space-y-1.5 my-1 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-sans">
                  <span>1. Ascent & Staging</span>
                  <span className="text-emerald-400 font-bold font-mono">100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-sans">
                  <span>2. Trans-Orbital Coast</span>
                  <span className="text-emerald-400 font-bold font-mono">100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-sans">
                  <span>3. Orbit Insertion Burn</span>
                  <span className={`font-bold font-mono ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSuccess ? '100%' : 'Abort'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 font-sans">
                  <span>4. Science Operations</span>
                  <span className={`font-bold font-mono ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSuccess ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Flight Authorization Status */}
            <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                  Flight Authorization
                </span>
                <span className="text-xs px-2 py-0.5 font-sans font-semibold rounded border bg-emerald-950/80 text-emerald-300 border-emerald-800/60">
                  Go Recorded
                </span>
              </div>
              <div className="text-xs text-slate-300 my-1 font-sans">
                Design sign-offs: <span className="font-mono">{design.approvedBy.length}</span> roles logged
              </div>
              <div className="text-xs font-sans text-slate-400">
                Mission control flight readiness review passed prior to ignition.
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: CENTRE CINEMATIC MISSION VISUALIZATION (~45% WIDTH)              */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[45%] lg:flex-[45_45_0%] flex flex-col h-full min-h-0 bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#334155] bg-[#1E293B] z-10 text-xs shrink-0 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-100 font-bold tracking-normal uppercase text-xs">
                Flight Trajectory & Orbital Visualization
              </span>
            </div>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#273449] text-blue-300 border border-[#334155] uppercase font-semibold">
              Celestial: {destination}
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-black/90 flex items-center justify-center">
            <MissionScene
              result={simResult}
              destination={destination}
              orbitId={design.orbitId}
              missionName={currentMission?.name}
              autoPlay={true}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: RIGHT MISSION CONTROL PANEL (~33% WIDTH)                         */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[33%] lg:flex-[33_33_0%] flex flex-col h-full min-h-0 bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow-none">
          {/* Header */}
          <div className="p-2.5 border-b border-[#334155] bg-[#1E293B] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-sm font-bold font-sans tracking-normal text-slate-100 uppercase leading-none">
                Mission Control Console
              </h2>
            </div>
            <span className="text-xs font-sans text-slate-400">
              {simResult.events.length} Events Logged
            </span>
          </div>

          {/* Scrollable Control & Events Stream Panel */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
            {/* 1. Mission Outcome Banner */}
            <div className={`p-4 rounded-xl border ${
              isSuccess
                ? 'bg-emerald-950/40 border-emerald-800/60'
                : 'bg-rose-950/40 border-rose-800/60'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-sm font-sans font-bold ${
                  isSuccess ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isSuccess ? '✓ Mission Profile Successful' : '✗ Flight Anomaly Detected'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold font-sans ${
                  isSuccess
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  Score: <span className="font-mono font-bold">{simResult.score}</span> pts
                </span>
              </div>

              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {isSuccess
                  ? 'All orbital maneuvers executed nominally. Telemetry link established and science payload is delivering data.'
                  : 'Trajectory insertion or subsystem failure prevented nominal mission execution. Inspect flight events below.'}
              </p>

              {/* Science Metric Yield */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#334155] text-xs">
                <div>
                  <span className="text-slate-400 text-xs font-sans block">Science Return:</span>
                  <span className="text-slate-100 font-bold font-mono">{totalScienceYield} pts</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-sans block">Target Requirement:</span>
                  <span className="text-slate-100 font-bold font-mono">{currentMission?.minScience ?? 0} pts</span>
                </div>
              </div>
            </div>

            {/* 2. Simulation Flight Events Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#334155] pb-1.5">
                <span className="text-sm font-sans font-semibold text-slate-200">
                  Flight Events Log
                </span>
                <span className="text-xs font-sans text-slate-400">
                  Timeline
                </span>
              </div>

              {simResult.events.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#273449] border border-[#334155] text-center text-slate-400 text-sm font-sans">
                  No anomalous flight events logged during nominal trajectory.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {simResult.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#273449] border border-[#334155] space-y-1 hover:border-[#475569] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-400 font-sans font-semibold">DAY {event.day}</span>
                        <span className="text-slate-400 uppercase font-sans text-[11px]">{event.impact}</span>
                      </div>
                      <p className="text-slate-200 text-sm font-sans leading-relaxed">
                        {event.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Diagnostic Warnings & Root Causes */}
            {simResult.reasons && simResult.reasons.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-1.5 font-mono text-xs">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">
                  Anomaly Root Cause Analysis:
                </span>
                {simResult.reasons.map((reason, idx) => (
                  <div key={idx} className="text-rose-300 text-xs font-sans flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Engineering Flight Checks Summary */}
            <div className="p-3.5 rounded-xl bg-[#273449] border border-[#334155] space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Subsystem Verification Status:
              </span>
              <div className="space-y-1.5">
                {checks.map((chk) => (
                  <div key={chk.id} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{chk.id} Subsystem:</span>
                    <span className={chk.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {chk.ok ? '✓ Nominal' : '⚠ Deficit'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Proceed Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedToReport}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border border-blue-500 shadow-none"
              >
                <span>Proceed to Flight Debrief & Report (/report)</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
