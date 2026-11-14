// Owner: B. Role switcher tab bar for subsystem management with team access control.
import type { KeyboardEvent } from 'react'
import type { Role } from '@/shared/types'
import { ROLES } from '@/shared/constants'
import { canEdit } from '@/team'

export interface RoleTabsProps {
  /** Currently active viewing/subsystem tab */
  activeRole: Role
  /** Callback when user selects another role tab */
  onSelect: (role: Role) => void
  /** In multiplayer mode, the role assigned to the local user */
  userRole?: Role
  /** Section identifier to test permissions against (defaults to the role name) */
  targetSection?: string
  /** Optional custom class */
  className?: string
}

const ROLE_METADATA: Record<Role, { label: string; badge: string; subtitle: string }> = {
  planner: {
    label: 'Planner',
    badge: 'MISSION ARCH',
    subtitle: 'Budget & Flight Timeline',
  },
  engineer: {
    label: 'Engineer',
    badge: 'POWER & BUS',
    subtitle: 'Power Systems & Structure',
  },
  science: {
    label: 'Science',
    badge: 'PAYLOAD',
    subtitle: 'Scientific Instruments',
  },
  comms: {
    label: 'Comms',
    badge: 'TELEMETRY',
    subtitle: 'Antennas & Ground Link',
  },
}

export function RoleTabs({
  activeRole,
  onSelect,
  userRole,
  targetSection,
  className = '',
}: RoleTabsProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, currentRole: Role) => {
    const currentIndex = ROLES.indexOf(currentRole)
    let nextIndex = currentIndex

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % ROLES.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + ROLES.length) % ROLES.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = ROLES.length - 1
    }

    if (nextIndex !== currentIndex) {
      onSelect(ROLES[nextIndex])
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Spacecraft Subsystem Role Tabs"
      className={`flex flex-wrap sm:flex-nowrap gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/80 ${className}`}
    >
      {ROLES.map((role) => {
        const meta = ROLE_METADATA[role]
        const isActive = activeRole === role
        const sectionToCheck = targetSection ?? role
        // In multiplayer, check if the current user has write authorization for this role's subsystem
        const isEditableByUser = userRole ? canEdit(userRole, sectionToCheck) : true
        const isUserAssignedRole = userRole === role

        return (
          <button
            key={role}
            role="tab"
            id={`tab-${role}`}
            aria-selected={isActive}
            aria-controls={`panel-${role}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(role)}
            onKeyDown={(e) => handleKeyDown(e, role)}
            className={`flex-1 min-w-[130px] p-2.5 rounded-md text-left transition-all duration-150 relative cursor-pointer
              ${isActive
                ? 'bg-slate-900 border border-teal-500/50 shadow-sm shadow-teal-950/40'
                : 'hover:bg-slate-900/50 border border-transparent text-slate-400 hover:text-slate-200'
              }
            `}
          >
            {/* Top row: Role Name & Access Badge */}
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold tracking-wide uppercase font-mono ${isActive ? 'text-teal-300' : 'text-slate-300'}`}>
                {meta.label}
              </span>

              <div className="flex items-center gap-1">
                {isUserAssignedRole && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" title="Your Assigned Role" />
                )}
                {!isEditableByUser && (
                  <svg className="w-3 h-3 text-amber-400/80" fill="currentColor" viewBox="0 0 20 20" aria-label="Read-only: requires teammate permission">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Subtitle / Focus area */}
            <div className="text-[11px] text-slate-400 truncate leading-tight">
              {meta.subtitle}
            </div>

            {/* Subtle bottom indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-teal-500/20 via-teal-400 to-teal-500/20 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
