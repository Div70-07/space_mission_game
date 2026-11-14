// src/engine/launch.ts
import type { Orbit, Rocket, Totals } from '../shared/types';
import { availableDeltaV, requiredDeltaV } from './deltaV';

export interface LaunchCheckResult {
  ok: boolean;
  maxPayload: number;
  payloadMass: number;
  marginKg: number;
  message: string;
}

export function checkLaunch(
  rocket: Rocket | undefined,
  orbit: Orbit | undefined,
  totals: Totals
): LaunchCheckResult {
  if (!rocket || !orbit) {
    return {
      ok: false,
      maxPayload: 0,
      payloadMass: totals.mass,
      marginKg: 0,
      message: 'Select both a rocket and an orbit to evaluate launch capability.',
    };
  }

  const maxPayload = rocket.payloadByOrbit[orbit.id] ?? 0;
  const marginKg = maxPayload - totals.mass;
  const ok = marginKg >= 0;

  return {
    ok,
    maxPayload,
    payloadMass: totals.mass,
    marginKg,
    message: ok
      ? `Launch feasible: ${rocket.name} lifts ${maxPayload} kg to ${orbit.name} (Margin: +${marginKg} kg).`
      : `Launch failure: Spacecraft is ${totals.mass} kg, exceeding ${rocket.name} limit of ${maxPayload} kg by ${Math.abs(marginKg)} kg.`,
  };
}

export function checkOrbit(
  orbit: Orbit | undefined,
  availDv: number
): { ok: boolean; reqDv: number; marginKmS: number; message: string } {
  const reqDv = requiredDeltaV(orbit);
  const marginKmS = Number((availDv - reqDv).toFixed(2));
  const ok = marginKmS >= 0;

  return {
    ok,
    reqDv,
    marginKmS,
    message: ok
      ? `Orbit achievable: Available Δv (${availDv} km/s) meets required (${reqDv} km/s).`
      : `Orbit unreachable: Trajectory requires ${reqDv} km/s, but only ${availDv} km/s is available.`,
  };
}