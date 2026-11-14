// Owner: B. Role switcher tab bar.
import type { Role } from '@/shared/types'

export function RoleTabs({ activeRole, onSelect }: { activeRole?: Role; onSelect?: (role: Role) => void }) {
  const roles: Role[] = ['planner', 'engineer', 'science', 'comms']
  return (
    <div className="flex gap-2">
      {roles.map((r) => (
        <button
          key={r}
          onClick={() => onSelect?.(r)}
          className={`px-3 py-1 rounded text-sm capitalize ${activeRole === r ? 'bg-teal-600 text-white' : 'bg-slate-800 text-gray-400'}`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
