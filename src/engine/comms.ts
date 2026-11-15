// src/engine/comms.ts
import type { Orbit, Totals, Mission } from '../shared/types';

export interface CommsBudgetResult {
  ok: boolean;
  marginMBPerDay: number;
  message: string;
  rawDownlink: number;
  effectiveDownlink: number;
  attenuation: number;
}

/**
 * Calculates deep-space communications link attenuation factor.
 * Deep-space path loss penalty of 0.70 (-30%) applies for Mars or high-altitude orbits (>100,000 km)
 * to represent increased free-space path loss (Friis equation) and Deep Space Network (DSN) scheduling constraints.
 */
export function getAttenuationFactor(orbit: Orbit | undefined, mission?: Mission): number {
  const isMarsOrbit = Boolean(
    orbit?.id.toLowerCase().includes('mars') ||
    (orbit?.info && orbit.info.toLowerCase().includes('mars'))
  );
  const isHighAltitude = Boolean(orbit?.altitudeKm !== undefined && orbit.altitudeKm > 100000);
  const isMarsMission = Boolean(
    !orbit && (
      mission?.targetDestination?.toLowerCase().includes('mars') ||
      (mission as any)?.recommendedOrbit?.toLowerCase().includes('mars') ||
      mission?.orbitIds?.some(id => id.toLowerCase().includes('mars'))
    )
  );

  const isDeepSpace = isMarsOrbit || isHighAltitude || isMarsMission;
  return isDeepSpace ? 0.7 : 1.0;
}

/**
 * Computes effective science data downlink bandwidth in MB/day after path-loss attenuation.
 */
export function computeEffectiveDownlink(rawDownlink: number, orbit: Orbit | undefined, mission?: Mission): number {
  const safeDownlink = Math.max(0, rawDownlink);
  const attenuation = getAttenuationFactor(orbit, mission);
  return Math.round(safeDownlink * attenuation);
}

export function checkCommsBudget(
  totals: Totals,
  orbit: Orbit | undefined,
  mission?: Mission
): CommsBudgetResult {
  const attenuation = getAttenuationFactor(orbit, mission);

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
  } else if (attenuation < 1.0) {
    message = `Communications link nominal. Mars deep-space attenuation (x${attenuation.toFixed(2)}): ${effectiveDownlink} MB/day effective.`;
  }

  return {
    ok,
    marginMBPerDay,
    message,
    rawDownlink: safeDownlink,
    effectiveDownlink,
    attenuation,
  };
}
