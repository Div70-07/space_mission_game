import type { Role } from '@/shared/types'
import { ROLES } from '@/shared/constants'

/**
 * Derives the active roles required for mission launch approval.
 * In solo mode (or when no multiplayer roles are claimed), all 4 roles are required.
 * In multiplayer mode (online/local), only currently claimed active roles are required.
 */
export function getRequiredRoles(
  mode: string,
  players?: Record<string, { role: Role | null }> | null
): Role[] {
  const activeRoles: Role[] =
    mode === 'solo' || !players
      ? [...ROLES]
      : Object.values(players)
          .map((p) => p.role)
          .filter((r): r is Role => r !== null)

  return activeRoles.length > 0 ? activeRoles : [...ROLES]
}

/**
 * Checks whether all required roles have recorded their sign-off.
 * Requires that requiredRoles is non-empty and every role in requiredRoles is present in approvedBy.
 */
export function areRolesApproved(
  requiredRoles: Role[],
  approvedBy: Role[] = []
): boolean {
  return (
    requiredRoles.length > 0 &&
    requiredRoles.every((role) => approvedBy.includes(role))
  )
}
