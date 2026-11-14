// src/engine/comms.ts
import type { Orbit, Totals } from '../shared/types';

export interface CommsBudgetResult {
  ok: boolean;
  marginMBPerDay: number;
  message: string;
}

export function checkCommsBudget(totals: Totals, orbit: Orbit | undefined): CommsBudgetResult {
  const isDeepSpace = orbit?.id.toLowerCase().includes('mars') || orbit?.altitudeKm! > 100000;
  
  // High latency and attenuation over deep-space link
  const attenuation = isDeepSpace ? 0.7 : 1.0;
  const effectiveDownlink = Math.round(totals.downlinkPerDay * attenuation);
  const marginMBPerDay = effectiveDownlink - totals.dataPerDay;
  const ok = marginMBPerDay >= 0 && totals.downlinkPerDay > 0;

  let message = 'Communications link nominal.';
  if (totals.downlinkPerDay === 0) {
    message = 'Critical: No antenna installed. Science data cannot be returned.';
  } else if (!ok) {
    message = `Downlink bottleneck: Instruments produce ${totals.dataPerDay} MB/day, exceeding antenna downlink (${effectiveDownlink} MB/day). Buffer will overflow.`;
  }

  return {
    ok,
    marginMBPerDay,
    message,
  };
}