import type { Role } from '@/shared/types'
import { ROLES } from '@/shared/constants'
import { gameData } from '@/data'
import { checkDesign } from '@/engine'
import { useDesignStore } from '@/shared/designStore'
import { useTeamStore } from './teamStore'
import { ROLE_INFO } from './roles'

export interface ApproveGateProps {
  onLaunch?: () => void
  approvals?: Role[]
}

export function ApproveGate({ onLaunch, approvals: propApprovals }: ApproveGateProps) {
  const { design, approve, resetApprovals } = useDesignStore()
  const mode = useTeamStore((s) => s.mode)
  const myRole = useTeamStore((s) => s.myRole)
  const players = useTeamStore((s) => s.players)

  const effectiveApprovals = propApprovals ?? design.approvedBy ?? []

  // System validation checks
  const checks = checkDesign(design, gameData)
  const failedChecks = checks.filter((c) => !c.ok)
  const isEngineeringValid = failedChecks.length === 0

  // In online / local team mode, check claimed roles. In solo mode, all roles are auto-claimed
  const activeRoles: Role[] =
    mode === 'solo'
      ? [...ROLES]
      : Object.values(players)
          .map((p) => p.role)
          .filter((r): r is Role => r !== null)

  const requiredRoles = activeRoles.length > 0 ? activeRoles : [...ROLES]
  const allRolesApproved =
    requiredRoles.length > 0 &&
    requiredRoles.every((role) => effectiveApprovals.includes(role))

  const canLaunch = isEngineeringValid && allRolesApproved
  const hasUserApproved = myRole ? effectiveApprovals.includes(myRole) : false

  // Handle Approve Click
  const handleApprove = () => {
    if (mode === 'solo') {
      // Solo mode approves all roles at once
      ROLES.forEach((r) => approve(r))
    } else if (myRole) {
      approve(myRole)
    }
  }

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
            PRE-FLIGHT LAUNCH READINESS
          </span>
          <h3 className="text-base font-bold font-mono text-slate-100 mt-1">
            CREW LAUNCH APPROVAL GATE
          </h3>
        </div>

        {/* Solo or Specialist Approve Action */}
        <div className="flex items-center gap-2">
          {effectiveApprovals.length > 0 && (
            <button
              type="button"
              onClick={() => resetApprovals()}
              className="text-slate-400 hover:text-rose-300 font-mono text-xs px-3 py-1.5 rounded border border-slate-800 hover:border-rose-900 transition-colors cursor-pointer"
            >
              Reset Sign-offs
            </button>
          )}

          {mode === 'solo' ? (
            <button
              type="button"
              onClick={handleApprove}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer"
            >
              ✓ Sign-off Design (All Roles)
            </button>
          ) : (
            <button
              type="button"
              disabled={!myRole || hasUserApproved}
              onClick={handleApprove}
              className={`font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                hasUserApproved
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 cursor-default'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md'
              }`}
            >
              {hasUserApproved ? '✓ Your Sign-off Recorded' : `Approve as ${myRole ? ROLE_INFO[myRole].label : 'Specialist'}`}
            </button>
          )}
        </div>
      </div>

      {/* Role Sign-off Status Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ROLES.map((role) => {
          const isApproved = effectiveApprovals.includes(role)
          const info = ROLE_INFO[role]
          const isRequired = requiredRoles.includes(role)

          return (
            <div
              key={role}
              className={`p-3 rounded-lg border text-xs font-mono transition-all flex flex-col justify-between ${
                isApproved
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : isRequired
                  ? 'bg-slate-900/60 border-amber-900/40 text-amber-300'
                  : 'bg-slate-900/20 border-slate-800/40 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{info.label}</span>
                <span className="text-[10px] uppercase">
                  {isApproved ? 'READY' : 'WAITING'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {isApproved ? '✓ Sign-off Complete' : 'Pending Review'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Engineering Constraint Violations Warning */}
      {!isEngineeringValid && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-lg text-xs font-mono space-y-1 text-rose-300">
          <span className="font-bold block uppercase">
            ⚠ Cannot Authorize Launch: {failedChecks.length} Engineering Constraints Failed
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 text-[11px]">
            {failedChecks.map((fc) => (
              <li key={fc.id}>{fc.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Launch Execution Trigger */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
        <span className="text-xs font-mono text-slate-400">
          Status: {canLaunch ? 'All systems GO for launch' : 'Awaiting sign-offs or constraint resolution'}
        </span>
        {onLaunch && (
          <button
            type="button"
            disabled={!canLaunch}
            onClick={onLaunch}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            🚀 Initiate Mission Launch
          </button>
        )}
      </div>
    </div>
  )
}
