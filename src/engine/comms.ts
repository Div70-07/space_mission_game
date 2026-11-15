// src/engine/comms.ts
import type { Orbit, Totals } from '../shared/types';

export interface CommsBudgetResult {
  ok: boolean;
  marginMBPerDay: number;
  message: string;
}

export function checkCommsBudget(totals: Totals, orbit: Orbit | undefined): CommsBudgetResult {
  const isDeepSpace = orbit?.id.toLowerCase().includes('mars') || orbit?.altitudeKm! > 100000;

  // Deep-space link attenuation (game assumption): a simplified path-loss penalty of 0.70
  // is applied for Mars or high-altitude orbits (>100 000 km) to represent the increased
  // free-space path loss and DSN scheduling constraints. Real link budgets use the Friis
  // transmission equation; this factor is a conservative game-design approximation.
  const attenuation = isDeepSpace ? 0.7 : 1.0;

  // Guard against negative totals (malformed data should not produce negative margins)
  const safeDownlink = Math.max(0, totals.downlinkPerDay);
  const safeData     = Math.max(0, totals.dataPerDay);

  const effectiveDownlink = Math.round(safeDownlink * attenuation);
  const marginMBPerDay = effectiveDownlink - safeData;
  const ok = marginMBPerDay >= 0 && safeDownlink > 0;

  let message = 'Communications link nominal.';
  if (safeDownlink === 0) {
    message = 'Critical: No antenna installed. Science data cannot be returned.';
  } else if (!ok) {
    message = `Downlink bottleneck: Instruments produce ${safeData} MB/day, exceeding antenna downlink (${effectiveDownlink} MB/day). Buffer will overflow.`;
  }

  return {
    ok,
    marginMBPerDay,
    message,
  };
}