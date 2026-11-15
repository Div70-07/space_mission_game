// src/scene/MissionScene.tsx
// Owner: D. 2D visual canvas and animation controller for spacecraft launch and orbital maneuvers.

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import type { SimResult } from '@/shared/types'
import { drawLaunch } from './drawLaunch'
import { drawOrbit } from './drawOrbit'

export interface MissionSceneProps {
  /** Simulation outcome returned by the physics engine */
  result?: SimResult
  /** Target celestial body destination override ('earth' | 'moon' | 'mars') */
  destination?: 'earth' | 'moon' | 'mars'
  /** Target orbit identifier (e.g., 'leo', 'sso', 'moon-llo', 'mars-low') */
  orbitId?: string
  /** Human-readable mission designation */
  missionName?: string
  /** Optional container style overrides */
  className?: string
  /** Whether animation begins playing automatically */
  autoPlay?: boolean
}

export type MissionPhase = 'launch' | 'cruise' | 'insertion' | 'orbit'

const PHASES: { id: MissionPhase; label: string; durationPct: [number, number] }[] = [
  { id: 'launch', label: '1. Ascent & Staging', durationPct: [0, 0.28] },
  { id: 'cruise', label: '2. Deep Space Cruise', durationPct: [0.28, 0.55] },
  { id: 'insertion', label: '3. Orbit Insertion Burn', durationPct: [0.55, 0.78] },
  { id: 'orbit', label: '4. Science Operations', durationPct: [0.78, 1.0] },
]

export function MissionScene({
  result,
  destination,
  orbitId = 'sso',
  missionName,
  className = '',
  autoPlay = true,
}: MissionSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
  const [progress, setProgress] = useState<number>(0) // 0 to 1
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0)
  const [showDebrief, setShowDebrief] = useState<boolean>(true)

  // Resolve target celestial body
  const targetBody: 'earth' | 'moon' | 'mars' = useMemo(() => {
    if (destination) return destination
    const id = orbitId.toLowerCase()
    if (id.includes('mars')) return 'mars'
    if (id.includes('moon') || id.includes('lunar') || id.includes('llo')) return 'moon'
    return 'earth'
  }, [destination, orbitId])

  // Current flight phase calculation
  const currentPhase = useMemo((): MissionPhase => {
    if (progress < 0.28) return 'launch'
    if (progress < 0.55) return 'cruise'
    if (progress < 0.78) return 'insertion'
    return 'orbit'
  }, [progress])

  // Animation cycle loop (approx 22 seconds total at 1x)
  const TOTAL_CYCLE_MS = 22000

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleRestart = () => {
    setProgress(0)
    setIsPlaying(true)
    lastTimeRef.current = null
  }

  const handleSelectPhase = (phaseId: MissionPhase) => {
    const found = PHASES.find((p) => p.id === phaseId)
    if (found) {
      setProgress(found.durationPct[0])
      lastTimeRef.current = null
    }
  }

  // Animation rendering frame
  const renderFrame = useCallback(
    (canvas: HTMLCanvasElement, p: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height

      // Phase 1: Launch & Atmospheric Ascent (0 to 0.28)
      if (p < 0.28) {
        const localP = p / 0.28
        drawLaunch(ctx, w, h, localP, {
          missionName,
          isSuccess: result ? result.success : true,
        })
      }
      // Phase 2: Deep Space Cruise (0.28 to 0.55)
      else if (p < 0.55) {
        const localP = (p - 0.28) / 0.27
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, w, h)

        // Parallax stars
        ctx.save()
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 90; i++) {
          const sx = ((i * 181.7 - localP * 120) % w + w) % w
          const sy = (i * 277.3) % h
          const r = (i % 3 === 0) ? 1.5 : 0.8
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()
        }

        // Distant Earth receding on the left
        const earthRadius = Math.max(8, 36 * (1 - localP * 0.7))
        const earthX = w * 0.18 - localP * 40
        const earthY = h * 0.65
        const earthGrad = ctx.createRadialGradient(earthX - 4, earthY - 4, 2, earthX, earthY, earthRadius)
        earthGrad.addColorStop(0, '#38bdf8')
        earthGrad.addColorStop(0.7, '#0284c7')
        earthGrad.addColorStop(1, '#082f49')
        ctx.fillStyle = earthGrad
        ctx.beginPath()
        ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2)
        ctx.fill()

        // Distant target approaching on the right
        const targetRadius = Math.max(6, 12 + localP * 42)
        const targetX = w * 0.82
        const targetY = h * 0.45
        const targetColor = targetBody === 'mars' ? '#ea580c' : targetBody === 'moon' ? '#94a3b8' : '#0284c7'
        const targetGrad = ctx.createRadialGradient(targetX - 4, targetY - 4, 2, targetX, targetY, targetRadius)
        targetGrad.addColorStop(0, targetColor)
        targetGrad.addColorStop(1, '#0f172a')
        ctx.fillStyle = targetGrad
        ctx.beginPath()
        ctx.arc(targetX, targetY, targetRadius, 0, Math.PI * 2)
        ctx.fill()

        // Spacecraft in interplanetary cruise
        const scX = w * 0.48
        const scY = h * 0.52
        ctx.save()
        ctx.translate(scX, scY)
        ctx.rotate(-0.15)

        // Bus
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(-8, -8, 16, 16)
        // Solar panels
        ctx.fillStyle = '#0284c7'
        ctx.fillRect(-28, -6, 18, 12)
        ctx.fillRect(10, -6, 18, 12)
        // High gain dish
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(0, -12, 6, 0, Math.PI)
        ctx.stroke()
        // Thruster pulse
        if (Math.sin(Date.now() * 0.01) > 0.4) {
          ctx.fillStyle = '#38bdf8'
          ctx.beginPath()
          ctx.arc(-12, 0, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()

        // Cruise Telemetry
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(`PHASE 02: TRANS-${targetBody.toUpperCase()} CRUISE`, 18, 24)
        ctx.fillText(`HELIOCENTRIC SPEED: ${(24.5 + localP * 3.2).toFixed(1)} km/s`, 18, 38)
        ctx.fillText(`DISTANCE TO TARGET: ${Math.round((1 - localP) * 380000).toLocaleString()} km`, 18, 52)
        ctx.fillStyle = '#38bdf8'
        ctx.fillText(`SOLAR ARRAYS DEPLOYED // AUTONOMOUS TRACKING NOMINAL`, 18, 70)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'
        ctx.strokeRect(10, 10, 360, 70)

        ctx.restore()
      }
      // Phase 3: Trajectory Deceleration & Orbit Insertion (0.55 to 0.78)
      else if (p < 0.78) {
        const localP = (p - 0.55) / 0.23
        drawOrbit(ctx, w, h, localP * 0.35, {
          targetBody,
          orbitId,
          showScanBeam: false,
        })

        // Draw Retrograde Braking Burn Effect on satellite
        ctx.save()
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = '#f59e0b'
        ctx.fillText(`PHASE 03: ORBIT INSERTION BRAKING BURN`, 18, h - 35)
        ctx.fillStyle = '#cbd5e1'
        ctx.fillText(`MAIN ENGINE FIRING // DELTA-V DEPLETION: ${Math.round(localP * 100)}%`, 18, h - 20)
        ctx.restore()
      }
      // Phase 4: Operational Orbit & Science Operations (0.78 to 1.0)
      else {
        const localP = (p - 0.78) / 0.22
        drawOrbit(ctx, w, h, localP, {
          targetBody,
          orbitId,
          showScanBeam: true,
          isSuccess: result ? result.success : true,
        })
      }
    },
    [missionName, result, targetBody, orbitId]
  )

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const displayWidth = Math.max(320, Math.floor(rect.width))
      const displayHeight = Math.max(260, Math.min(520, Math.floor(rect.width * 0.52)))

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (isPlaying) {
        setProgress((prev) => {
          const next = prev + (delta / TOTAL_CYCLE_MS) * speedMultiplier
          if (next >= 1.0) {
            return 0.78 + (next % 0.22)
          }
          return next
        })
      }

      renderFrame(canvas, progress)
      animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isPlaying, progress, speedMultiplier, renderFrame])

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* 1. TOP HEADER & TELEMETRY STATUS BAR */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-teal-400 font-bold uppercase tracking-wider">
            MISSION FLIGHT SIMULATOR
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            {missionName || `DESTINATION: ${targetBody.toUpperCase()}`}
          </span>
        </div>

        {/* Phase Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">ACTIVE PHASE:</span>
          <span className="bg-teal-950/70 border border-teal-800/60 text-teal-300 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
            {PHASES.find((p) => p.id === currentPhase)?.label}
          </span>
        </div>
      </div>

      {/* 2. MAIN HTML CANVAS VIEWPORT */}
      <div className="relative w-full aspect-video min-h-[300px] max-h-[500px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          title="Interactive 2D Space Mission Flight Visualizer"
        />

        {/* Diagnostic Mission Outcome Banner Overlay */}
        {result && showDebrief && (
          <div className="absolute top-4 right-4 max-w-sm bg-slate-950/90 border border-slate-700/80 rounded-lg p-3.5 shadow-xl backdrop-blur-md font-mono text-xs space-y-2 animate-in fade-in zoom-in-95 z-20">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${result.success ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span className={`font-bold uppercase tracking-wide ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.success ? 'FLIGHT GOALS NOMINAL' : 'MISSION ANOMALY DETECTED'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDebrief(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer text-sm font-sans"
                title="Dismiss overlay"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Score Evaluation:</span>
              <span className="text-teal-300 font-bold text-sm">{result.score} / 100</span>
            </div>

            {result.similarRealMission && (
              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                <span className="text-purple-300 font-semibold block mb-0.5">NASA Benchmark:</span>
                <span className="text-slate-300 leading-tight block">
                  {result.similarRealMission}
                </span>
              </div>
            )}

            {/* Failure diagnostics or success verification */}
            {!result.success && result.reasons.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-rose-300 font-semibold text-[10px] uppercase block">
                  Root Cause Diagnostics:
                </span>
                <ul className="text-[10px] text-rose-300/90 space-y-1 list-disc list-inside">
                  {result.reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="leading-snug">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.success && (
              <div className="text-[10px] text-emerald-300/90">
                ✓ Trajectory velocity, thermal power margins, and DSN telemetry satisfy all mission constraints.
              </div>
            )}
          </div>
        )}

        {/* If no result: Standby Notice */}
        {!result && (
          <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 rounded px-3 py-1.5 font-mono text-[11px] text-slate-400">
            SIMULATION STANDBY // PREVIEW MODE ACTIVE
          </div>
        )}
      </div>

      {/* 3. FLIGHT PHASE SCRUBBER TIMELINE */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Flight Progress: {Math.round(progress * 100)}%</span>
          <div className="flex items-center gap-2">
            {PHASES.map((ph) => {
              const isActive = currentPhase === ph.id
              return (
                <button
                  key={ph.id}
                  type="button"
                  onClick={() => handleSelectPhase(ph.id)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-teal-950 text-teal-300 border border-teal-800 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {ph.label.split('.')[1].trim()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Scrub Bar */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={progress}
          onChange={(e) => {
            setProgress(Number(e.target.value))
            lastTimeRef.current = null
          }}
          aria-label="Mission Timeline Scrubber"
          className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
      </div>

      {/* 4. PLAYBACK CONTROLS BAR */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3.5 py-1.5 rounded shadow cursor-pointer transition-colors"
          >
            <span>{isPlaying ? '❚❚ Pause' : '▶ Play'}</span>
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={handleRestart}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded cursor-pointer transition-colors"
          >
            ↺ Restart
          </button>

          {/* Toggle Diagnostic Debrief View */}
          {result && !showDebrief && (
            <button
              type="button"
              onClick={() => setShowDebrief(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-800/60 rounded cursor-pointer transition-colors"
            >
              Show Debrief
            </button>
          )}
        </div>

        {/* Speed Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Speed:</span>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeedMultiplier(s)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                speedMultiplier === s
                  ? 'bg-slate-800 text-teal-300 border border-slate-600 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
