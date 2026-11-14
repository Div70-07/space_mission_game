// Owner: D. 2D/3D visual canvas for spacecraft and orbital maneuvers.
import type { SimResult } from '@/shared/types'

export function MissionScene({ result }: { result?: SimResult }) {
  return (
    <div className="w-full h-64 bg-slate-950 border border-teal-900/40 rounded flex items-center justify-center text-teal-400">
      Mission Scene Visualizer {result ? `(${result.success ? 'Success' : 'Failure'})` : '(Standby)'}
    </div>
  )
}
