// Owner: C. Approval gate modal for 4-player sign-off before launch.
import type { Role } from '@/shared/types'

export function ApproveGate({ approvals }: { approvals?: Role[] }) {
  return (
    <div className="bg-slate-900 border border-teal-500/40 p-4 rounded text-sm">
      <h3 className="font-semibold text-teal-300 mb-2">Launch Approval Sign-off</h3>
      <p className="text-gray-400">Approved: {approvals?.join(', ') || 'None'}</p>
    </div>
  )
}
