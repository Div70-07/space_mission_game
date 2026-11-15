// Owner: B. Real-time mission resource telemetry and budget constraint monitors.
import type { Totals, Check, Mission, Rocket, Orbit } from '@/shared/types'
import { RESOURCE_UNITS } from '@/shared/constants'
import { computeEffectiveDownlink, getAttenuationFactor } from '@/engine'

export interface ResourceBarsProps {
  /** Real-time cumulative spacecraft totals computed by the physics engine */
  totals?: Totals
  /** Verification checks produced by checkDesign(design, gameData) */
  checks?: Check[]
  /** Active mission configuration establishing budget and minimum science/lifetime limits */
  mission?: Mission
  /** Selected rocket launcher vehicle providing payload capacity */
  rocket?: Rocket
  /** Target deployment orbit */
  orbit?: Orbit
  /** Configured mission lifetime in months */
  lifetimeMonths?: number
  /** Optional custom class name */
  className?: string
  /** Visual presentation mode: 'default' (3x2 grid), 'dock' (horizontal dock), or 'sidebar' (vertical left panel) */
  layout?: 'default' | 'dock' | 'sidebar'
}

type ResourceStatus = 'normal' | 'warning' | 'critical' | 'unconstrained'

interface ResourceMetricConfig {
  id: 'mass' | 'power' | 'budget' | 'data' | 'comms' | 'time'
  name: string
  shortName: string
  current: number
  unit: string
  limit?: number
  limitLabel: string
  check?: Check
}

export function ResourceBars({
  totals,
  checks = [],
  mission,
  rocket,
  orbit,
  lifetimeMonths = 12,
  className = '',
  layout = 'default',
}: ResourceBarsProps) {
  // Determine rocket payload capacity for target orbit if both are chosen
  const orbitPayloadLimit =
    rocket && orbit && rocket.payloadByOrbit[orbit.id] !== undefined
      ? rocket.payloadByOrbit[orbit.id]
      : undefined

  // Downlink telemetry calculations (shared physics with engine comms budget)
  const rawDownlink = Math.max(0, totals?.downlinkPerDay ?? 0)
  const attenuation = getAttenuationFactor(orbit, mission)
  const effectiveDownlink = computeEffectiveDownlink(rawDownlink, orbit, mission)
  const hasAttenuation = attenuation < 1.0 && rawDownlink > 0
  const dataDemand = Math.max(0, totals?.dataPerDay ?? 0)

  // Find corresponding check result for each subsystem
  const getCheck = (id: Check['id']) => checks.find((c) => c.id === id)

  // Configure the 6 mission resources
  const resources: ResourceMetricConfig[] = [
    {
      id: 'mass',
      name: 'Dry & Wet Mass',
      shortName: 'Dry & Wet Mass',
      current: totals?.mass ?? 0,
      unit: RESOURCE_UNITS.mass,
      limit: orbitPayloadLimit,
      limitLabel: orbitPayloadLimit !== undefined ? `${orbitPayloadLimit.toLocaleString()} ${RESOURCE_UNITS.mass} max` : 'Pending Launcher',
      check: getCheck('mass') || getCheck('launch'),
    },
    {
      id: 'power',
      name: 'Power Balance',
      shortName: 'Power Balance',
      current: totals?.power ?? 0,
      unit: RESOURCE_UNITS.power,
      limit: undefined,
      limitLabel: getCheck('power')
        ? (getCheck('power')!.ok ? 'Sufficient' : 'Deficit')
        : `Load: ${totals?.power ?? 0} W`,
      check: getCheck('power'),
    },
    {
      id: 'budget',
      name: 'Financial Budget',
      shortName: 'Financial Budget',
      current: totals?.cost ?? 0,
      unit: `$${RESOURCE_UNITS.cost}`,
      limit: mission?.budget,
      limitLabel: mission?.budget ? `$${mission.budget}M max` : 'Pending Mission',
      check: getCheck('budget'),
    },
    {
      id: 'data',
      name: 'Data Gen',
      shortName: 'Data Gen',
      current: dataDemand,
      unit: RESOURCE_UNITS.dataPerDay,
      limit: effectiveDownlink > 0 ? effectiveDownlink : undefined,
      limitLabel: effectiveDownlink > 0
        ? `Cap: ${effectiveDownlink.toLocaleString()} MB/d`
        : (rawDownlink > 0 ? 'Cap: 0 MB/d' : 'Pending Comms'),
      check: getCheck('data'),
    },
    {
      id: 'comms',
      name: hasAttenuation ? 'Downlink (Eff)' : 'Downlink',
      shortName: 'Downlink',
      current: effectiveDownlink,
      unit: RESOURCE_UNITS.downlinkPerDay,
      limit: dataDemand > 0 ? dataDemand : undefined,
      limitLabel: hasAttenuation
        ? (dataDemand > 0
            ? `Req: ${dataDemand.toLocaleString()} · Raw: ${rawDownlink.toLocaleString()}`
            : `Raw: ${rawDownlink.toLocaleString()} MB/d (-30%)`)
        : (dataDemand > 0 ? `Demand: ${dataDemand.toLocaleString()} MB/d` : 'No Payloads'),
      check: getCheck('comms'),
    },
    {
      id: 'time',
      name: 'Mission Lifetime',
      shortName: 'Mission Lifetime',
      current: lifetimeMonths,
      unit: 'mo',
      limit: mission?.lifetimeMonths,
      limitLabel: mission?.lifetimeMonths ? `Min: ${mission.lifetimeMonths} mo` : 'Req: 12 mo',
      check: getCheck('time'),
    },
  ]

  // Helper to evaluate status, percentage, and aligned status message for any metric
  const evaluateStatus = (res: ResourceMetricConfig) => {
    let status: ResourceStatus = 'normal'
    let percentage: number | null = null

    if (res.id === 'mass') {
      if (orbitPayloadLimit !== undefined && orbitPayloadLimit > 0) {
        percentage = Math.min(Math.round((res.current / orbitPayloadLimit) * 100), 200)
        if (res.current > orbitPayloadLimit) {
          status = 'critical'
        } else if (res.current > orbitPayloadLimit * 0.85) {
          status = 'warning'
        } else {
          status = 'normal'
        }
      } else {
        status = 'unconstrained'
      }
    } else if (res.id === 'budget') {
      if (res.limit !== undefined && res.limit > 0) {
        percentage = Math.min(Math.round((res.current / res.limit) * 100), 200)
        if (res.current > res.limit) {
          status = 'critical'
        } else if (res.current > res.limit * 0.85) {
          status = 'warning'
        } else {
          status = 'normal'
        }
      } else {
        status = 'unconstrained'
      }
    } else if (res.id === 'power') {
      status = res.check ? (res.check.ok ? 'normal' : 'critical') : 'normal'
    } else if (res.id === 'time') {
      if (res.limit !== undefined && res.limit > 0) {
        percentage = Math.min(Math.round((res.current / res.limit) * 100), 100)
        if (res.current < res.limit) {
          status = 'critical'
        } else {
          status = 'normal'
        }
      } else {
        status = 'normal'
      }
    } else if (res.id === 'data') {
      if (res.current === 0) {
        status = 'normal'
        percentage = 0
      } else if (rawDownlink === 0 || effectiveDownlink === 0) {
        status = 'critical'
        percentage = 100
      } else {
        percentage = Math.min(Math.round((res.current / effectiveDownlink) * 100), 200)
        if (res.current > effectiveDownlink) {
          status = 'critical'
        } else if (res.current > effectiveDownlink * 0.85) {
          status = 'warning'
        } else {
          status = 'normal'
        }
      }
    } else if (res.id === 'comms') {
      if (rawDownlink === 0) {
        status = 'critical'
        percentage = 0
      } else if (effectiveDownlink === 0) {
        status = 'critical'
        percentage = 0
      } else if (dataDemand === 0) {
        status = 'normal'
        percentage = 0
      } else {
        percentage = Math.min(Math.round((dataDemand / effectiveDownlink) * 100), 100)
        if (dataDemand > effectiveDownlink) {
          status = 'critical'
        } else if (dataDemand > effectiveDownlink * 0.85) {
          status = 'warning'
        } else {
          status = 'normal'
        }
      }
    }

    if (res.check && !res.check.ok) {
      status = 'critical'
    }

    const statusColors = {
      normal: {
        bar: 'bg-[#4ADE80]',
        text: 'text-[#4ADE80]',
        border: 'border-[#334155] hover:border-[#475569]',
        badge: 'deepsky-annunciator deepsky-annunciator-nominal',
        label: 'Nominal',
        icon: '✓',
        iconColor: 'text-[#4ADE80]',
        textColor: 'text-slate-300',
      },
      warning: {
        bar: 'bg-[#FBBF24]',
        text: 'text-[#FBBF24]',
        border: 'border-amber-800/40 hover:border-amber-700/60',
        badge: 'deepsky-annunciator deepsky-annunciator-caution',
        label: 'Warning',
        icon: '⚠',
        iconColor: 'text-[#FBBF24]',
        textColor: 'text-amber-200',
      },
      critical: {
        bar: 'bg-[#F87171]',
        text: 'text-[#F87171]',
        border: 'border-red-800/40 hover:border-red-700/60',
        badge: 'deepsky-annunciator deepsky-annunciator-critical',
        label: 'Critical',
        icon: '⚠',
        iconColor: 'text-[#F87171]',
        textColor: 'text-red-200',
      },
      unconstrained: {
        bar: 'bg-slate-600',
        text: 'text-slate-400',
        border: 'border-[#334155]',
        badge: 'deepsky-annunciator bg-[#1E293B] text-slate-400 border border-[#334155]',
        label: 'Pending',
        icon: '○',
        iconColor: 'text-slate-500',
        textColor: 'text-slate-400',
      },
    }[status]

    // Determine concise explanatory message strictly aligned with the computed status
    let message = ''
    if (res.id === 'mass') {
      if (orbitPayloadLimit === undefined) {
        message = 'Select a launcher and orbit.'
      } else if (status === 'critical') {
        message = 'Payload mass exceeds launcher capacity.'
      } else if (status === 'warning') {
        message = 'Payload mass near launcher capacity.'
      } else {
        message = 'Payload mass within launch capacity.'
      }
    } else if (res.id === 'power') {
      const powerCheck = getCheck('power')
      if (powerCheck && !powerCheck.ok && powerCheck.message.toLowerCase().includes('no power')) {
        message = 'No power system installed.'
      } else if (status === 'critical') {
        message = 'Power generation deficit.'
      } else {
        message = 'Power generation sufficient.'
      }
    } else if (res.id === 'budget') {
      if (status === 'critical') {
        message = 'Budget exceeded.'
      } else if (status === 'warning') {
        message = 'Budget near maximum allocation.'
      } else {
        message = 'Budget within approved allocation.'
      }
    } else if (res.id === 'data') {
      if (res.current === 0) {
        message = 'No science instruments mounted.'
      } else if (rawDownlink === 0) {
        message = 'Pending communications antenna.'
      } else if (status === 'critical') {
        message = `Data generation (${res.current} MB/d) exceeds downlink capacity (${effectiveDownlink} MB/d).`
      } else if (status === 'warning') {
        message = 'Data generation near bandwidth limit.'
      } else {
        message = 'Data generation within capacity.'
      }
    } else if (res.id === 'comms') {
      if (rawDownlink === 0) {
        message = 'No antenna installed.'
      } else if (status === 'critical') {
        message = res.check?.message || `Downlink bottleneck: Instruments produce ${dataDemand} MB/day, exceeding antenna downlink (${effectiveDownlink} MB/day). Buffer will overflow.`
      } else if (status === 'warning') {
        message = `Downlink bandwidth near saturation (${dataDemand} / ${effectiveDownlink} MB/d).`
      } else if (hasAttenuation) {
        message = `Communications link nominal. Mars deep-space attenuation (x0.70): ${effectiveDownlink.toLocaleString()} MB/day effective.`
      } else {
        message = 'Communications link nominal.'
      }
    } else if (res.id === 'time') {
      if (status === 'critical') {
        message = 'Duration below mission requirement.'
      } else {
        message = 'Lifetime requirement satisfied.'
      }
    }

    return { status, percentage, statusColors, message }
  }

  // =========================================================================
  // SIDEBAR LAYOUT: LEFT PANEL TELEMETRY HUD (THREE-PANEL ARCHITECTURE)
  // =========================================================================
  if (layout === 'sidebar') {
    const allPassing = checks.length > 0 && checks.every((c) => c.ok)
    const failingCount = checks.filter((c) => !c.ok).length

    return (
      <div
        aria-label="Left Panel Telemetry HUD"
        className={`deepsky-panel flex flex-col xl:h-full bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow-none ${className}`}
      >
        {/* Top Header Bar */}
        <div className="px-3.5 py-2.5 border-b border-[#334155] bg-[#1E293B] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <div>
              <h2 className="text-sm font-bold font-sans tracking-normal text-slate-100 uppercase leading-none">
                Telemetry HUD
              </h2>
              <div className="text-xs text-slate-400 font-sans mt-0.5 leading-none">
                Flight Envelope
              </div>
            </div>
          </div>

          <div>
            {allPassing ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2.5 py-0.5 rounded border border-emerald-800/60 text-xs font-sans shadow-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All Nominal
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2.5 py-0.5 rounded border border-amber-800/60 text-xs font-sans shadow-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {failingCount} Pending
              </span>
            )}
          </div>
        </div>

        {/* 6 Live Metrics Stack */}
        <div className="p-2.5 space-y-2.5 xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar">
          {resources.map((res) => {
            const { percentage, statusColors, message } = evaluateStatus(res)

            return (
              <div
                key={res.id}
                className={`bg-[#273449] border ${statusColors.border} rounded-xl p-3 flex flex-col justify-between transition-colors shadow-none hover:border-[#475569]`}
              >
                {/* Header: Metric Name & Status Badge */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
                    {res.name}
                  </span>
                  <span className={`${statusColors.badge} text-xs px-2 py-0.5 font-sans font-semibold rounded`}>
                    {statusColors.label}
                  </span>
                </div>

                {/* Big Numerals with Tabular Figures & Limit */}
                <div className="flex items-baseline justify-between gap-1 my-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                      {res.current.toLocaleString()}
                    </span>
                    <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">{res.unit}</span>
                  </div>

                  {res.limitLabel && (
                    <div className="text-right text-xs font-sans text-slate-400 deepsky-num">
                      {res.limitLabel}
                    </div>
                  )}
                </div>

                {/* Calibrated Aerospace Gauge Bar */}
                <div className="my-1.5">
                  <div
                    role="progressbar"
                    aria-label={`${res.name} usage`}
                    aria-valuenow={percentage !== null ? res.current : undefined}
                    aria-valuemin={percentage !== null ? 0 : undefined}
                    aria-valuemax={res.limit !== undefined ? res.limit : undefined}
                    className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#334155] relative"
                  >
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${statusColors.bar}`}
                      style={{
                        width: percentage !== null ? `${Math.min(percentage, 100)}%` : '0%',
                        opacity: percentage === null ? 0.3 : 1,
                      }}
                    />
                  </div>
                </div>

                {/* Verification Message */}
                <div className="flex items-start gap-1.5 mt-0.5">
                  <span className={`shrink-0 leading-tight text-xs ${statusColors.iconColor}`}>
                    {statusColors.icon}
                  </span>
                  <span className={`text-xs font-sans leading-snug ${statusColors.textColor}`}>
                    {message}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // =========================================================================
  // DOCK LAYOUT: PERSISTENT RESOURCE TELEMETRY DOCK FOR WORKSTATION BOTTOM
  // =========================================================================
  if (layout === 'dock') {
    const allPassing = checks.length > 0 && checks.every((c) => c.ok)
    const failingCount = checks.filter((c) => !c.ok).length

    return (
      <div
        aria-label="Persistent Resource Telemetry HUD"
        className={`deepsky-panel px-3.5 py-2 border border-[#334155] bg-[#1E293B] rounded-xl w-full shrink-0 shadow-none ${className}`}
      >
        {/* Top Dock Header Bar - Compact & Streamlined */}
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#334155] text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-bold tracking-normal text-slate-100 uppercase text-xs">
              Persistent Resource Telemetry HUD · Flight Envelope
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline text-xs">6 Subsystems Monitored</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Flight Status:</span>
            {allPassing ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2 py-0.5 rounded border border-emerald-800/60 text-xs shadow-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                All Constraints Nominal
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2 py-0.5 rounded border border-amber-800/60 text-xs shadow-none">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {failingCount} Flight Checks Pending
              </span>
            )}
          </div>
        </div>

        {/* 6 Metrics Grid: Responsive layout (1 col mobile, 2 sm, 3 md, 6 lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {resources.map((res) => {
            const { percentage, statusColors, message } = evaluateStatus(res)

            return (
              <div
                key={res.id}
                className={`bg-[#273449] border ${statusColors.border} rounded-xl p-2.5 sm:p-3 flex flex-col justify-between min-h-[112px] h-auto lg:h-[116px] transition-colors shadow-none`}
              >
                {/* Header: Metric Name & Status Badge */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] font-semibold text-slate-200 tracking-wide font-sans">
                    {res.name}
                  </span>
                  <span className={`${statusColors.badge} text-[11px] px-2 py-0.5 font-mono font-semibold`}>
                    {statusColors.label}
                  </span>
                </div>

                {/* Big Numerals with Tabular Figures & Non-truncated Secondary Value */}
                <div className="flex items-center justify-between gap-1 my-0.5 min-h-[30px]">
                  <div className="flex items-baseline shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-white deepsky-num font-mono tracking-tight">
                      {res.current.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-[13px] font-normal text-slate-400 font-mono ml-1">{res.unit}</span>
                  </div>

                  {/* Secondary Metric / Limit (Stacked 2-line format prevents truncation) */}
                  <div className="text-right flex flex-col justify-center min-w-0">
                    {res.limitLabel && (
                      <div className="text-[11px] font-mono text-slate-400 text-right leading-tight deepsky-num" title={res.limitLabel}>
                        {res.limitLabel.includes(': ') ? (
                          <>
                            <span className="text-[10px] text-slate-400 block leading-none mb-0.5 font-medium uppercase tracking-wider">
                              {res.limitLabel.split(': ')[0]}:
                            </span>
                            <span className="font-semibold text-slate-200 block leading-none">
                              {res.limitLabel.split(': ')[1]}
                            </span>
                          </>
                        ) : (
                          <span className="leading-tight block font-medium text-slate-300">
                            {res.limitLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Calibrated Aerospace Gauge Bar */}
                <div>
                  <div
                    role="progressbar"
                    aria-label={`${res.name} usage`}
                    aria-valuenow={percentage !== null ? res.current : undefined}
                    aria-valuemin={percentage !== null ? 0 : undefined}
                    aria-valuemax={res.limit !== undefined ? res.limit : undefined}
                    className="w-full h-2 bg-[#050a17] rounded overflow-hidden border border-[#172647] relative"
                  >
                    {/* Scale calibration ticks */}
                    <div className="absolute inset-0 pointer-events-none flex justify-between px-1.5 opacity-25 z-10">
                      <span className="w-px h-full bg-slate-400" />
                      <span className="w-px h-full bg-slate-400" />
                      <span className="w-px h-full bg-slate-400" />
                    </div>

                    <div
                      className={`h-full transition-all duration-300 rounded ${statusColors.bar}`}
                      style={{
                        width: percentage !== null ? `${Math.min(percentage, 100)}%` : '0%',
                        opacity: percentage === null ? 0.3 : 1,
                      }}
                    />
                  </div>

                  {/* Supporting check verification text (wraps up to two lines without ellipses) */}
                  <div className="mt-1 flex items-start gap-1.5 min-h-[26px]">
                    <span className={`shrink-0 leading-tight text-xs ${statusColors.iconColor}`}>
                      {statusColors.icon}
                    </span>
                    <span className={`text-[11px] font-mono leading-tight ${statusColors.textColor} line-clamp-2`}>
                      {message}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // =========================================================================
  // DEFAULT LAYOUT: STANDALONE 3X2 GRID (PRESERVED FOR OTHER SCREENS)
  // =========================================================================
  return (
    <div
      aria-label="Mission Telemetry & Resource Constraints"
      className={`deepsky-panel p-4 shadow-xl border border-[var(--deepsky-border-subtle)] ${className}`}
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between mb-3.5 border-b border-[var(--deepsky-border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-xs font-sans font-bold tracking-normal text-slate-100 uppercase">
            Resource Telemetry HUD · Flight Envelope
          </h2>
        </div>
        <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded bg-[#273449] text-blue-300 border border-[#334155]">
          6 Subsystems Monitored
        </span>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {resources.map((res) => {
          const { percentage, statusColors, message } = evaluateStatus(res)

          return (
            <div
              key={res.id}
              className={`bg-[var(--deepsky-space-850)] border ${statusColors.border} rounded-lg p-3.5 flex flex-col justify-between transition-colors shadow-sm`}
            >
              {/* Header: Metric Name & Annunciator Badge */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
                    {res.name}
                  </span>
                  <span className={statusColors.badge}>
                    {statusColors.label}
                  </span>
                </div>

                {/* Big Numerals with Tabular Figures */}
                <div className="flex items-baseline justify-between mb-2.5">
                  <span className="text-xl font-bold text-slate-100 deepsky-num tracking-tight">
                    {res.current.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400 font-mono ml-0.5">{res.unit}</span>
                  </span>

                  <span
                    className="text-[11px] font-mono text-slate-400 text-right truncate max-w-[150px] deepsky-num"
                    title={res.limitLabel}
                  >
                    {res.limitLabel}
                  </span>
                </div>
              </div>

              {/* Calibrated Aerospace Gauge Bar */}
              <div>
                <div
                  role="progressbar"
                  aria-label={`${res.name} usage`}
                  aria-valuenow={percentage !== null ? res.current : undefined}
                  aria-valuemin={percentage !== null ? 0 : undefined}
                  aria-valuemax={res.limit !== undefined ? res.limit : undefined}
                  className="w-full h-2 bg-[var(--deepsky-space-950)] rounded-sm overflow-hidden border border-[var(--deepsky-border-subtle)] relative mb-1.5"
                >
                  {/* Subtle scale calibration ticks at 25%, 50%, 75% */}
                  <div className="absolute inset-0 pointer-events-none flex justify-between px-1 opacity-25 z-10">
                    <span className="w-px h-full bg-slate-600" />
                    <span className="w-px h-full bg-slate-600" />
                    <span className="w-px h-full bg-slate-600" />
                  </div>

                  {/* Active Telemetry Bar */}
                  <div
                    className={`h-full transition-all duration-300 rounded-sm ${statusColors.bar}`}
                    style={{
                      width: percentage !== null ? `${Math.min(percentage, 100)}%` : '0%',
                      opacity: percentage === null ? 0.25 : 1,
                    }}
                  />
                </div>

                {/* Subsystem Check Verification Output */}
                <div className="mt-1 flex items-start gap-1.5 min-h-[24px]">
                  <span className={`shrink-0 leading-tight text-xs ${statusColors.iconColor}`}>
                    {statusColors.icon}
                  </span>
                  <span className={`text-[10px] font-mono leading-tight ${statusColors.textColor} line-clamp-2`}>
                    {message}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
