// Owner: B. Flight telemetry HUD for the Orbit & Rocket integration workstation.
import { useMemo } from 'react'
import type { Rocket, Orbit, Mission, Check, Totals } from '@/shared/types'

export interface FlightTelemetryHudProps {
  totals: Totals
  checks: Check[]
  mission?: Mission
  rocket?: Rocket
  orbit?: Orbit
  fuelKg: number
  availDeltaV: number
  reqDeltaV: number
  rocketPayloadCapacity?: number
  payloadMargin?: number
  isOrbitCompatible: boolean
  canApprove: boolean
  allRolesApproved: boolean
  approvedRolesCount: number
  requiredRolesCount: number
  className?: string
}

export function FlightTelemetryHud({
  totals,
  checks,
  mission,
  rocket,
  orbit,
  fuelKg,
  availDeltaV,
  reqDeltaV,
  rocketPayloadCapacity,
  payloadMargin,
  isOrbitCompatible,
  canApprove,
  allRolesApproved,
  approvedRolesCount,
  requiredRolesCount,
  className = '',
}: FlightTelemetryHudProps) {
  const isBudgetExceeded = mission ? totals.cost > mission.budget : false
  const isDeltaVSufficient = availDeltaV >= reqDeltaV
  const isPayloadExceeded = rocketPayloadCapacity !== undefined && totals.mass > rocketPayloadCapacity

  const passingChecks = useMemo(() => checks.filter((c) => c.ok).length, [checks])
  const totalChecks = checks.length

  const allNominal = isDeltaVSufficient && !isPayloadExceeded && !isBudgetExceeded && isOrbitCompatible && passingChecks === totalChecks

  return (
    <div
      aria-label="Flight Telemetry HUD"
      className={`flex flex-col xl:h-full bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow-none ${className}`}
    >
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 border-b border-[#334155] bg-[#1E293B] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <div>
            <h2 className="text-sm font-bold font-sans tracking-normal text-slate-100 uppercase leading-none">
              Flight Telemetry
            </h2>
            <div className="text-xs text-slate-400 font-sans mt-0.5 leading-none">
              Orbit & Propulsion
            </div>
          </div>
        </div>

        <div>
          {allNominal ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2.5 py-0.5 rounded border border-emerald-800/60 text-xs font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Flight Nominal
            </span>
          ) : (
            <span className="text-amber-400 font-semibold flex items-center gap-1.5 bg-[#273449] px-2.5 py-0.5 rounded border border-amber-800/60 text-xs font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Constraints Pending
            </span>
          )}
        </div>
      </div>

      {/* 8 Live Telemetry Metrics Stack */}
      <div className="p-2.5 space-y-2.5 xl:flex-1 xl:min-h-0 xl:overflow-y-auto custom-scrollbar">
        {/* 1. Total Spacecraft Mass */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Spacecraft Wet Mass
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              isPayloadExceeded
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            }`}>
              {isPayloadExceeded ? 'Overload' : 'Nominal'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                {totals.mass.toLocaleString()}
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">kg</span>
            </div>
            <div className="text-right text-xs font-sans text-slate-400">
              Dry: {(totals.mass - fuelKg).toLocaleString()} kg
            </div>
          </div>

          {/* Progress against capacity */}
          <div className="my-1.5">
            <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#334155]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isPayloadExceeded ? 'bg-[#F87171]' : 'bg-[#4ADE80]'
                }`}
                style={{
                  width: rocketPayloadCapacity
                    ? `${Math.min(100, Math.round((totals.mass / rocketPayloadCapacity) * 100))}%`
                    : '50%',
                }}
              />
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-0.5">
            <span className={`shrink-0 leading-tight text-xs ${isPayloadExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isPayloadExceeded ? '⚠' : '✓'}
            </span>
            <span className="text-xs font-sans leading-snug text-slate-300">
              {isPayloadExceeded
                ? `Exceeds launcher capacity by ${Math.abs(payloadMargin || 0).toLocaleString()} kg.`
                : rocketPayloadCapacity
                  ? `Within payload capacity envelope (${(payloadMargin || 0).toLocaleString()} kg margin).`
                  : 'Pending launcher selection.'}
            </span>
          </div>
        </div>

        {/* 2. Selected Rocket */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Selected Rocket
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              rocket
                ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              {rocket ? 'Mounted' : 'Unassigned'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <span className="text-base font-bold text-white font-sans truncate max-w-[170px]" title={rocket?.name}>
              {rocket ? rocket.name.split('(')[0] : 'None Selected'}
            </span>
            <span className="text-sm font-bold text-blue-400 font-mono">
              {rocket ? `$${rocket.cost}M` : '--'}
            </span>
          </div>

          <div className="flex items-start gap-1.5 mt-1 border-t border-[#334155] pt-1.5">
            <span className="text-xs font-sans leading-snug text-slate-400">
              {rocket ? rocket.source.split('(')[0] : 'Select commercial vehicle in panel.'}
            </span>
          </div>
        </div>

        {/* 3. Available Delta-V vs Required Delta-V */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Trajectory Delta-V
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              isDeltaVSufficient
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
            }`}>
              {isDeltaVSufficient ? 'Sufficient' : 'Deficit'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                {availDeltaV.toFixed(2)}
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">km/s</span>
            </div>
            <div className="text-right text-xs font-sans text-slate-400">
              Req: {reqDeltaV.toFixed(2)} km/s
            </div>
          </div>

          <div className="my-1.5">
            <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#334155]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDeltaVSufficient ? 'bg-[#4ADE80]' : 'bg-[#F87171]'
                }`}
                style={{
                  width: reqDeltaV > 0
                    ? `${Math.min(100, Math.round((availDeltaV / reqDeltaV) * 100))}%`
                    : '100%',
                }}
              />
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-0.5">
            <span className={`shrink-0 leading-tight text-xs ${isDeltaVSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isDeltaVSufficient ? '✓' : '⚠'}
            </span>
            <span className="text-xs font-sans leading-snug text-slate-300">
              {isDeltaVSufficient
                ? `Delta-V margin: +${(availDeltaV - reqDeltaV).toFixed(2)} km/s for orbital insertion.`
                : `Short by ${Math.abs(availDeltaV - reqDeltaV).toFixed(2)} km/s. Increase propellant.`}
            </span>
          </div>
        </div>

        {/* 4. Payload Capacity */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Payload Capacity
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              rocketPayloadCapacity === undefined
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : isPayloadExceeded
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            }`}>
              {rocketPayloadCapacity === undefined
                ? 'Pending'
                : isPayloadExceeded
                  ? 'Exceeded'
                  : 'Compliant'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                {rocketPayloadCapacity !== undefined ? rocketPayloadCapacity.toLocaleString() : '--'}
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">kg max</span>
            </div>
            <div className={`text-right text-xs font-sans font-semibold ${
              payloadMargin !== undefined
                ? payloadMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                : 'text-slate-400'
            }`}>
              {payloadMargin !== undefined ? `${payloadMargin >= 0 ? '+' : ''}${payloadMargin.toLocaleString()} kg` : '--'}
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-1 border-t border-[#334155] pt-1.5">
            <span className="text-xs font-sans leading-snug text-slate-300">
              {rocketPayloadCapacity !== undefined
                ? `Rated payload capacity to ${orbit?.name || 'target orbit'}.`
                : 'Requires both rocket and orbit selection.'}
            </span>
          </div>
        </div>

        {/* 5. Fuel Mass */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Propellant Mass
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              fuelKg > 0
                ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              {fuelKg > 0 ? 'Loaded' : 'Dry Tank'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                {fuelKg.toLocaleString()}
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">kg</span>
            </div>
            <div className="text-right text-xs font-sans text-slate-400">
              Tank: {Math.round((fuelKg / 2000) * 100)}%
            </div>
          </div>

          <div className="my-1.5">
            <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#334155]">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((fuelKg / 2000) * 100))}%` }}
              />
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-0.5">
            <span className="text-xs font-sans leading-snug text-slate-300">
              Allocated monopropellant for orbital adjustment maneuvers.
            </span>
          </div>
        </div>

        {/* 6. Mission Financial Budget */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Financial Budget
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              isBudgetExceeded
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            }`}>
              {isBudgetExceeded ? 'Exceeded' : 'Nominal'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono tracking-tight deepsky-num">
                ${totals.cost}M
              </span>
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">USD</span>
            </div>
            <div className="text-right text-xs font-sans text-slate-400">
              Cap: ${mission?.budget ?? 0}M
            </div>
          </div>

          <div className="my-1.5">
            <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-[#334155]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isBudgetExceeded ? 'bg-[#F87171]' : 'bg-[#4ADE80]'
                }`}
                style={{
                  width: mission?.budget
                    ? `${Math.min(100, Math.round((totals.cost / mission.budget) * 100))}%`
                    : '100%',
                }}
              />
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-0.5">
            <span className={`shrink-0 leading-tight text-xs ${isBudgetExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isBudgetExceeded ? '⚠' : '✓'}
            </span>
            <span className="text-xs font-sans leading-snug text-slate-300">
              {isBudgetExceeded
                ? `Exceeds mission budget by $${totals.cost - (mission?.budget ?? 0)}M.`
                : `Budget within authorized limit ($${(mission?.budget ?? 0) - totals.cost}M available).`}
            </span>
          </div>
        </div>

        {/* 7. Orbit Requirements */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Orbit Requirements
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              !orbit
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : isOrbitCompatible
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              {!orbit ? 'Pending' : isOrbitCompatible ? 'Compliant' : 'Secondary'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <span className="text-base font-bold text-white font-sans truncate max-w-[170px]" title={orbit?.name}>
              {orbit ? orbit.name : 'None Selected'}
            </span>
            <span className="text-sm font-semibold text-slate-300 font-mono">
              {orbit ? `${orbit.altitudeKm.toLocaleString()} km` : '--'}
            </span>
          </div>

          <div className="flex items-start gap-1.5 mt-1 border-t border-[#334155] pt-1.5">
            <span className="text-xs font-sans leading-snug text-slate-300">
              {isOrbitCompatible
                ? 'Target orbit satisfies scientific mission baseline.'
                : orbit
                  ? 'Secondary orbit: check mission requirements.'
                  : 'Select an orbit in the configuration panel.'}
            </span>
          </div>
        </div>

        {/* 8. Flight Readiness & Authorization */}
        <div className="bg-[#273449] border border-[#334155] rounded-xl p-3 flex flex-col justify-between hover:border-[#475569] transition-colors">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-sm font-semibold text-slate-200 tracking-normal font-sans">
              Flight Readiness
            </span>
            <span className={`text-xs px-2 py-0.5 font-sans font-semibold rounded border ${
              canApprove && allRolesApproved
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              {canApprove && allRolesApproved ? 'Go for Launch' : 'No-Go'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-sm font-bold text-slate-100 font-sans">
              Sign-offs: <span className="font-mono">{approvedRolesCount} / {requiredRolesCount}</span> Roles
            </div>
            <div className="text-right text-xs font-sans text-slate-400">
              Checks: <span className="font-mono">{passingChecks} / {totalChecks}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 mt-1 border-t border-[#334155] pt-1.5">
            <span className="text-xs font-sans leading-snug text-slate-300">
              {canApprove && allRolesApproved
                ? 'All flight constraints satisfied and crew approvals logged.'
                : 'Complete engineering validations and record role sign-offs.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
