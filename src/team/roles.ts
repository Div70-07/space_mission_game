import type { Role } from '@/shared/types'
import { useTeamStore } from './teamStore'

export interface RoleInfo {
  id: Role
  label: string
  badge: string
  subtitle: string
  sections: string[]
  description: string
  keyMetric: string
}

export const ROLE_INFO: Record<Role, RoleInfo> = {
  planner: {
    id: 'planner',
    label: 'Planner',
    badge: 'MISSION ARCH',
    subtitle: 'Budget & Flight Timeline',
    sections: ['planner', 'mission', 'orbit', 'lifetime', 'timeline'],
    description: 'Defines overall mission profile, manages financial budget limits, and establishes operational flight duration.',
    keyMetric: 'Budget ($M) & Mission Lifetime (months)',
  },
  engineer: {
    id: 'engineer',
    label: 'Engineer',
    badge: 'POWER & BUS',
    subtitle: 'Power Systems & Structure',
    sections: ['engineer', 'structure', 'power', 'rocket', 'fuel', 'bus'],
    description: 'Selects primary spacecraft power generation (solar arrays/RTG), propulsion fuel tanks, and structural frames.',
    keyMetric: 'Spacecraft Dry Mass (kg) & Power Balance (W)',
  },
  science: {
    id: 'science',
    label: 'Science Lead',
    badge: 'PAYLOAD',
    subtitle: 'Scientific Instruments',
    sections: ['science', 'instruments', 'payload'],
    description: 'Mounts observational cameras, spectrometers, and radar sensors to achieve maximum scientific discovery value.',
    keyMetric: 'Science Value (pts) & Data Generation (MB/day)',
  },
  comms: {
    id: 'comms',
    label: 'Comms Officer',
    badge: 'TELEMETRY',
    subtitle: 'Antennas & Ground Link',
    sections: ['comms', 'antenna', 'downlink', 'telemetry'],
    description: 'Configures high-gain and omni-directional antennas to guarantee continuous telemetry and high-bandwidth downlink.',
    keyMetric: 'Downlink Bandwidth (MB/day)',
  },
}

/**
 * Pure authorization check ensuring each specialist role controls their respective subsystems.
 * Supports exact role name ('planner', 'engineer', 'science', 'comms') as called by Builder/RoleTabs,
 * as well as specific subsystem names ('instruments', 'power', 'antenna', 'fuel', etc.).
 */
export function canEdit(role: Role, section: string): boolean {
  if (!role || !section) return false
  const target = section.toLowerCase()

  // Match directly if section name matches the role name (e.g. canEdit('science', 'science'))
  if (role === target) return true

  // Match against registered subsystem sections
  const info = ROLE_INFO[role]
  if (info && info.sections.includes(target)) {
    return true
  }

  return false
}

/**
 * React hook that queries the team store.
 * - In 'solo' mode: returns true for all sections (solo architect controls everything).
 * - In 'local' or 'online' mode: returns true only if the user's assigned role is authorized.
 */
export function useCanEdit(section: string): boolean {
  const mode = useTeamStore((s) => s.mode)
  const myRole = useTeamStore((s) => s.myRole)

  if (mode === 'solo') {
    return true
  }

  if (!myRole) {
    return false
  }

  return canEdit(myRole, section)
}
