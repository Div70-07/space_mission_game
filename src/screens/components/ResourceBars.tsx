// Owner: B. Real-time mission resource telemetry and budget constraint monitors.
import type { Totals, Check, Mission, Rocket, Orbit } from '@/shared/types'
import { RESOURCE_UNITS } from '@/shared/constants'

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
}

type ResourceStatus = 'normal' | 'warning' | 'critical' | 'unconstrained'

interface ResourceMetricConfig {
  id: 'mass' | 'power' | 'budget' | 'data' | 'comms' | 'time'
  name: string
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
}: ResourceBarsProps) {
  // Determine rocket payload capacity for target orbit if both are chosen
  const orbitPayloadLimit =
    rocket && orbit && rocket.payloadByOrbit[orbit.id] !== undefined
      ? rocket.payloadByOrbit[orbit.id]
      : undefined

  // Find corresponding check result for each subsystem
  const getCheck = (id: Check['id']) => checks.find((c) => c.id === id)

  // Configure the 6 mission resources
  const resources: ResourceMetricConfig[] = [
    {
      id: 'mass',
      name: 'Dry & Wet Mass',
      current: totals?.mass ?? 0,
      unit: RESOURCE_UNITS.mass,
      limit: orbitPayloadLimit,
      limitLabel: orbitPayloadLimit !== undefined ? `${orbitPayloadLimit.toLocaleString()} ${RESOURCE_UNITS.mass} max` : 'Pending Launcher & Orbit',
      check: getCheck('mass') || getCheck('launch'),
    },
    {
      id: 'power',
      name: 'Power Balance',
      current: totals?.power ?? 0,
      unit: RESOURCE_UNITS.power,
      limit: undefined, // Net power depends on generation vs active payload loads
      limitLabel: getCheck('power')
        ? (getCheck('power')!.ok ? 'Generation Sufficient' : 'Deficit / Unbalanced')
        : `Load: ${totals?.power ?? 0} W`,
      check: getCheck('power'),
    },
    {
      id: 'budget',
      name: 'Financial Budget',
      current: totals?.cost ?? 0,
      unit: `$${RESOURCE_UNITS.cost}`,
      limit: mission?.budget,
      limitLabel: mission?.budget ? `$${mission.budget}M max` : 'Pending Mission Selection',
      check: getCheck('budget'),
    },
    {
      id: 'data',
      name: 'Instrument Data Rate',
      current: totals?.dataPerDay ?? 0,
      unit: RESOURCE_UNITS.dataPerDay,
      limit: totals?.downlinkPerDay && totals.downlinkPerDay > 0 ? totals.downlinkPerDay : undefined,
      limitLabel: totals?.downlinkPerDay && totals.downlinkPerDay > 0
        ? `Downlink limit: ${totals.downlinkPerDay} MB/d`
        : 'Pending Antenna Mounting',
      check: getCheck('data'),
    },
    {
      id: 'comms',
      name: 'Downlink Bandwidth',
      current: totals?.downlinkPerDay ?? 0,
      unit: RESOURCE_UNITS.downlinkPerDay,
      limit: totals?.dataPerDay && totals.dataPerDay > 0 ? totals.dataPerDay : undefined,
      limitLabel: totals?.dataPerDay && totals.dataPerDay > 0
        ? `Payload demand: ${totals.dataPerDay} MB/d`
        : 'No Active Payloads',
      check: getCheck('comms'),
    },
    {
      id: 'time',
      name: 'Mission Lifetime',
      current: lifetimeMonths,
      unit: 'months',
      limit: mission?.lifetimeMonths,
      limitLabel: mission?.lifetimeMonths ? `Min requirement: ${mission.lifetimeMonths} mo` : 'Baseline: 12 mo',
      check: getCheck('time'),
    },
  ]

  return (
    <div
      aria-label="Mission Telemetry & Resource Constraints"
      className={`bg-slate-950/90 border border-teal-900/40 rounded-xl p-4 shadow-lg shadow-black/40 ${className}`}
    >
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase">
            Resource Telemetry HUD
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          6 SUBSYSTEMS MONITORED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {resources.map((res) => {
          // Status evaluation
          let status: ResourceStatus = 'normal'
          let percentage: number | null = null

          if (res.limit !== undefined && res.limit > 0) {
            percentage = Math.min(Math.round((res.current / res.limit) * 100), 200)
            if (res.id === 'time') {
              // For lifetime, being below mission requirement is critical
              if (res.current < res.limit) {
                status = 'critical'
              }
            } else if (res.current > res.limit) {
              status = 'critical'
            } else if (res.current > res.limit * 0.85) {
              status = 'warning'
            }
          } else {
            // Unconstrained or pending external constraint
            if (res.id === 'power') {
              status = res.check ? (res.check.ok ? 'normal' : 'critical') : 'normal'
            } else {
              status = 'unconstrained'
            }
          }

          // Special case: comms bottleneck (data output exceeds downlink)
          if (res.id === 'comms' && totals && totals.dataPerDay > 0) {
            if (totals.downlinkPerDay < totals.dataPerDay) {
              status = 'critical'
            }
          }

          // Engine check override (if check exists and failed, force critical status)
          if (res.check && !res.check.ok) {
            status = 'critical'
          }

          // Styles according to status
          const statusColors = {
            normal: {
              bar: 'bg-teal-400 shadow-teal-500/50',
              text: 'text-teal-400',
              border: 'border-slate-800/80',
              badge: 'bg-teal-950/40 text-teal-300 border-teal-800/40',
              label: 'NORMAL',
            },
            warning: {
              bar: 'bg-amber-400 shadow-amber-500/50',
              text: 'text-amber-400',
              border: 'border-amber-900/40',
              badge: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
              label: 'WARNING',
            },
            critical: {
              bar: 'bg-rose-500 shadow-rose-500/50',
              text: 'text-rose-400',
              border: 'border-rose-900/60',
              badge: 'bg-rose-950/60 text-rose-300 border-rose-800/70',
              label: 'CRITICAL',
            },
            unconstrained: {
              bar: 'bg-slate-700',
              text: 'text-slate-400',
              border: 'border-slate-800/80',
              badge: 'bg-slate-900 text-slate-400 border-slate-700/80',
              label: 'PENDING LIMIT',
            },
          }[status]

          return (
            <div
              key={res.id}
              className={`bg-slate-900/70 border ${statusColors.border} rounded-lg p-3 flex flex-col justify-between transition-colors`}
            >
              {/* Header: Metric Name & Value */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-medium text-slate-300">
                    {res.name}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${statusColors.badge}`}>
                    {statusColors.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-mono font-bold text-slate-100">
                    {res.current.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">{res.unit}</span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 text-right truncate max-w-[140px]" title={res.limitLabel}>
                    {res.limitLabel}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Feedback */}
              <div>
                <div
                  role="progressbar"
                  aria-label={`${res.name} usage`}
                  aria-valuenow={percentage !== null ? res.current : undefined}
                  aria-valuemin={percentage !== null ? 0 : undefined}
                  aria-valuemax={res.limit !== undefined ? res.limit : undefined}
                  className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5"
                >
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${statusColors.bar}`}
                    style={{
                      width: percentage !== null ? `${Math.min(percentage, 100)}%` : '0%',
                      opacity: percentage === null ? 0.2 : 1,
                    }}
                  />
                </div>

                {/* Subsystem Check Message if present */}
                {res.check && (
                  <p className={`text-[10px] font-mono truncate leading-tight ${res.check.ok ? 'text-slate-500' : 'text-rose-400 font-semibold'}`}>
                    {res.check.ok ? '✓ Check passed' : `⚠ ${res.check.message}`}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
