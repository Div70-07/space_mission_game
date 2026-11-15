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
    subtitle: 'Budget & Timeline',
  },
  engineer: {
    label: 'Engineer',
    badge: 'POWER & BUS',
    subtitle: 'Power & Chassis',
  },
  science: {
    label: 'Science',
    badge: 'PAYLOAD',
    subtitle: 'Payload Sensors',
  },
  comms: {
    label: 'Comms',
    badge: 'TELEMETRY',
    subtitle: 'Antenna & Link',
  },
}

const ROLE_THEMES: Record<Role, {
  activeBorder: string
  activeBg: string
  activeText: string
  shadow: string
  barBg: string
}> = {
  planner: {
    activeBorder: 'border-blue-400',
    activeBg: 'bg-[#273449]',
    activeText: 'text-white',
    shadow: 'shadow-none',
    barBg: 'bg-blue-400',
  },
  engineer: {
    activeBorder: 'border-amber-400/80',
    activeBg: 'bg-[#273449]',
    activeText: 'text-white',
    shadow: 'shadow-none',
    barBg: 'bg-amber-400',
  },
  science: {
    activeBorder: 'border-purple-400/80',
    activeBg: 'bg-[#273449]',
    activeText: 'text-white',
    shadow: 'shadow-none',
    barBg: 'bg-purple-400',
  },
  comms: {
    activeBorder: 'border-blue-400',
    activeBg: 'bg-[#273449]',
    activeText: 'text-white',
    shadow: 'shadow-none',
    barBg: 'bg-blue-400',
  },
}

export function RoleTabs({
  activeRole,
  onSelect,
  userRole,
  targetSection,
  className = '',
}: RoleTabsProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentRole: Role) => {
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
      className={`grid grid-cols-2 sm:flex sm:flex-nowrap gap-1.5 p-1.5 bg-[#1E293B] rounded-lg border border-[#334155] ${className}`}
    >
      {ROLES.map((role) => {
        const meta = ROLE_METADATA[role]
        const theme = ROLE_THEMES[role]
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
            className={`flex-1 min-w-0 px-2.5 py-2 rounded-md text-left transition-all duration-150 relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]
              ${isActive
                ? `${theme.activeBg} border ${theme.activeBorder} ${theme.shadow}`
                : 'bg-[#1E293B] hover:bg-[#273449] border border-transparent text-slate-400 hover:text-slate-200'
              }
            `}
          >
            {/* Top row: Role Name & Access Badge */}
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-sm font-semibold tracking-normal font-sans ${isActive ? theme.activeText : 'text-slate-300'}`}>
                {meta.label}
              </span>

              <div className="flex items-center gap-1">
                {isUserAssignedRole && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" title="Your Assigned Crew Station" />
                )}
                {!isEditableByUser && (
                  <span className="text-xs font-sans text-amber-400/90 flex items-center gap-1 font-semibold" title="Read-only station: peer-controlled subsystem">
                    <svg className="w-3 h-3 text-amber-400/90" fill="currentColor" viewBox="0 0 20 20" aria-label="Read-only: requires teammate permission">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Subtitle / Subsystem Focus Area */}
            <div className="text-xs text-slate-400 leading-tight font-sans whitespace-nowrap">
              {meta.subtitle}
            </div>

            {/* Subtle Active Indicator Underline */}
            {isActive && (
              <span className={`absolute bottom-0 left-2 right-2 h-0.5 ${theme.barBg} rounded-full`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
