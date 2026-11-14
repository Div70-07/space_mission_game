// Owner: B. Real-time budget and resource meters.
import type { Totals } from '@/shared/types'

export function ResourceBars({ totals }: { totals?: Totals }) {
  return (
    <div className="bg-gray-900 border border-teal-900/40 p-4 rounded-lg flex gap-4 text-xs">
      <div>Mass: {totals?.mass ?? 0} kg</div>
      <div>Power: {totals?.power ?? 0} W</div>
      <div>Cost: ${totals?.cost ?? 0}M</div>
      <div>Data: {totals?.dataPerDay ?? 0} MB/d</div>
      <div>Downlink: {totals?.downlinkPerDay ?? 0} MB/d</div>
    </div>
  )
}
