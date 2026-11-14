// Part A: Engine and scoring public door
import type { Check, Design, GameData } from '@/shared/types'
import { computeTotals } from './totals'
import { requiredDeltaV, availableDeltaV } from './deltaV'
import { runMission } from './runMission'

export { computeTotals, requiredDeltaV, availableDeltaV, runMission }

export function checkDesign(_design: Design, _data: GameData): Check[] {
  return [{ id: 'mass', ok: true, message: 'placeholder' }]
}
