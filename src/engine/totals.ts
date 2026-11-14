// Owner: A. Calculate spacecraft totals (mass, power, cost, data, downlink).
import type { Design, GameData, Totals } from '@/shared/types'

export function computeTotals(_design: Design, _data: GameData): Totals {
  return { mass: 0, power: 0, cost: 0, dataPerDay: 0, downlinkPerDay: 0 }
}
