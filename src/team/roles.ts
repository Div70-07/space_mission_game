// Owner: C. Role-based permissions and edit authorization.
import type { Role } from '@/shared/types'

export function canEdit(_role: Role, _section: string): boolean {
  return true
}
