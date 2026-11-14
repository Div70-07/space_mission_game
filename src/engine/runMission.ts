// Owner: A. Main simulation entry point.
import type { Design, GameData, SimResult } from '@/shared/types'

export function runMission(_design: Design, _data: GameData, _seed: number): SimResult {
  return { success: true, score: 0, events: [], reasons: ['placeholder'] }
}
