import { useTeamStore } from './teamStore'
import { ROLE_INFO } from './roles'

export function LocalTeamMode() {
  const mode = useTeamStore((s) => s.mode)
  const myRole = useTeamStore((s) => s.myRole)
  const cycleLocalRole = useTeamStore((s) => s.cycleLocalRole)
  const setMode = useTeamStore((s) => s.setMode)

  if (mode !== 'local') {
    return null
  }

  const currentInfo = myRole ? ROLE_INFO[myRole] : null

  return (
    <div className="bg-slate-950 border-b border-teal-900/60 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60 font-bold uppercase text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          Pass-the-Laptop Active
        </span>

        <span className="text-slate-300">
          Now Playing:{' '}
          <strong className="text-teal-300 uppercase">
            {currentInfo ? currentInfo.label : 'None'}
          </strong>{' '}
          <span className="text-slate-500 hidden sm:inline">
            ({currentInfo?.subtitle})
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => cycleLocalRole()}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1 rounded font-bold text-xs shadow transition-all cursor-pointer"
        >
          Pass to Next Player →
        </button>

        <button
          type="button"
          onClick={() => setMode('solo')}
          className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
        >
          Exit Pass-the-Laptop
        </button>
      </div>
    </div>
  )
}
