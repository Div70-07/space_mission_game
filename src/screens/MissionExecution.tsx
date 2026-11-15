// src/screens/MissionExecution.tsx
// Owner: B. Real-time mission execution and flight trajectory visualization screen.

import { useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { SimResult, Mission } from '@/shared/types'
import { useDesignStore } from '@/shared/designStore'
import { gameData } from '@/data'
import { MissionScene } from '@/scene'
import { computeTotals } from '@/engine'

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

  // Destination celestial body
  const destination: 'earth' | 'moon' | 'mars' = useMemo(() => {
    if (navState?.destination) return navState.destination
    return resolveDestination(currentMission, design.orbitId)
  }, [navState?.destination, currentMission, design.orbitId])

  // Safe Guard: If direct access occurs without an active simulation result, show recovery screen
  if (!simResult) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-6 font-mono">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
          ⚠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">
            NO ACTIVE MISSION EXECUTION IN PROGRESS
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            A spacecraft configuration must satisfy all launch authorization requirements and undergo ignition staging before execution telemetry can be rendered.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentMission ? (
            <Link
              to="/orbit-rocket"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg font-mono text-sm transition-all cursor-pointer"
            >
              ← Return to Launch Staging (/orbit-rocket)
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg font-mono text-sm transition-all cursor-pointer"
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
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* 1. TOP HEADER & TELEMETRY STATUS */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
              {isSuccess ? 'FLIGHT OPERATIONS // TRAJECTORY ACTIVE' : 'FLIGHT OPERATIONS // TRAJECTORY ANOMALY'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              TARGET: {destination.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
            {currentMission?.name ?? 'ORBITAL MISSION EXECUTION'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {currentMission?.goal ?? 'Mission trajectory execution, staging separation, and orbital insertion phase.'}
          </p>
        </div>

        {/* Live Flight Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
            <span className="text-[10px] uppercase text-slate-500 block">Destination</span>
            <span className="text-teal-300 font-bold uppercase">{destination}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
            <span className="text-[10px] uppercase text-slate-500 block">Target Orbit</span>
            <span className="text-slate-200 font-bold">{currentOrbit?.name || design.orbitId}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
            <span className="text-[10px] uppercase text-slate-500 block">Launch Vehicle</span>
            <span className="text-slate-200 font-bold">{currentRocket?.name || design.rocketId}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
            <span className="text-[10px] uppercase text-slate-500 block">Spacecraft Mass</span>
            <span className="text-slate-200 font-bold">{totals.mass.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* 2. PART D MISSION SCENE VISUALIZATION CANVAS */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
              Part D 2D/3D Flight Maneuver & Orbital Simulation Visualizer
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            VISUALIZATION ACTIVE
          </span>
        </div>

        <MissionScene
          result={simResult}
          destination={destination}
          orbitId={design.orbitId}
          missionName={currentMission?.name}
          autoPlay={true}
        />
      </div>

      {/* 3. SIMULATION EXECUTION PHASES EXPLANATION & STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-teal-400 font-semibold block">Phase 1 (0–28%)</span>
          <h3 className="font-bold text-slate-200">Ascent & Staging</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Atmospheric boost phase, booster burnout, stage separation, and payload fairing jettison.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-teal-400 font-semibold block">Phase 2 (28–55%)</span>
          <h3 className="font-bold text-slate-200">Deep Space Cruise</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Trans-orbital injection coast, solar array deployment, and antenna ground station acquisition.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-teal-400 font-semibold block">Phase 3 (55–78%)</span>
          <h3 className="font-bold text-slate-200">Orbit Insertion Burn</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Spacecraft onboard hydrazine engine firing to decelerate into the capture trajectory.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-teal-400 font-semibold block">Phase 4 (78–100%)</span>
          <h3 className="font-bold text-slate-200">Science Operations</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Payload sensors active, planetary survey imaging, and telemetry downlink to Earth stations.
          </p>
        </div>
      </div>

      {/* 4. EXECUTION ACTION BAR (PROCEED TO FINAL REPORT) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Link
            to="/orbit-rocket"
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            ← Return to Launch Staging
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Simulation concluded:
          </span>
          <button
            type="button"
            onClick={handleProceedToReport}
            className="px-6 py-2.5 text-xs font-mono font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 rounded-lg shadow-lg shadow-teal-950/50 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Proceed to Flight Debrief & Mission Report (/report)</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
